package stats

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gofiber/contrib/websocket"
	"rul.sh/vaulterm/server/lib"
)

func HandleSSHStats(c *websocket.Conn, client *lib.SSHClient) error {
	if err := client.Connect(); err != nil {
		log.Printf("error connecting to SSH: %v", err)
		return err
	}
	defer client.Close()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	msgCh := make(chan string)

	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			default:
				wg := &sync.WaitGroup{}
				wg.Add(5)
				go getCPUUsage(client, wg, msgCh)
				go getMemoryUsage(client, wg, msgCh)
				go getDiskUsage(client, wg, msgCh)
				go getNetworkUsage(client, wg, msgCh)
				go getUptime(client, wg, msgCh)
				wg.Wait()
			}
		}
	}()

	go func() {
		for msg := range msgCh {
			if err := c.WriteMessage(websocket.TextMessage, []byte(msg)); err != nil {
				break
			}
		}
	}()

	for {
		_, _, err := c.ReadMessage()
		if err != nil {
			break
		}
	}

	return nil
}

func getCPUUsage(client *lib.SSHClient, wg *sync.WaitGroup, result chan<- string) {
	defer wg.Done()

	cmd := "cat /proc/stat | grep '^cpu '"
	cpuData, err := client.Exec(cmd)
	if err != nil {
		return
	}
	total1, idle1, err := parseCPUStats(cpuData)
	if err != nil {
		return
	}

	time.Sleep(time.Second)
	cpuData, err = client.Exec(cmd)
	if err != nil {
		return
	}
	total2, idle2, err := parseCPUStats(cpuData)
	if err != nil {
		return
	}

	totalDiff := total2 - total1
	idleDiff := idle2 - idle1
	usage := (float64(totalDiff-idleDiff) / float64(totalDiff)) * 100

	result <- fmt.Sprintf("\x01%.2f", usage)
}

func parseCPUStats(data string) (int64, int64, error) {
	fields := strings.Fields(data)
	if len(fields) < 8 {
		return 0, 0, fmt.Errorf("unexpected format in /proc/stat")
	}

	user, _ := strconv.ParseInt(fields[1], 10, 64)
	nice, _ := strconv.ParseInt(fields[2], 10, 64)
	system, _ := strconv.ParseInt(fields[3], 10, 64)
	idle, _ := strconv.ParseInt(fields[4], 10, 64)
	iowait, _ := strconv.ParseInt(fields[5], 10, 64)
	irq, _ := strconv.ParseInt(fields[6], 10, 64)
	softirq, _ := strconv.ParseInt(fields[7], 10, 64)

	total := user + nice + system + idle + iowait + irq + softirq
	idle = idle + iowait

	return total, idle, nil
}

func getMemoryUsage(client *lib.SSHClient, wg *sync.WaitGroup, result chan<- string) {
	defer wg.Done()
	data, err := client.Exec("cat /proc/meminfo")
	if err != nil {
		return
	}

	var total, available int
	lines := strings.Split(data, "\n")

	for _, line := range lines {
		line = strings.TrimSpace(strings.ToLower(line))
		fields := strings.Fields(line)
		if len(fields) < 2 {
			continue
		}
		value, _ := strconv.Atoi(fields[1])
		if strings.HasPrefix(line, "memtotal") {
			total = value / 1024
		} else if strings.HasPrefix(line, "memavailable") {
			available = value / 1024
		}
	}

	result <- fmt.Sprintf("\x02%d,%d", total, available)
}

func getDiskUsage(client *lib.SSHClient, wg *sync.WaitGroup, result chan<- string) {
	defer wg.Done()
	data, err := client.Exec("df -h /")
	if err != nil {
		return
	}
	lines := strings.Split(data, "\n")
	if len(lines) < 2 {
		return
	}

	fields := strings.Fields(lines[1])
	result <- fmt.Sprintf("\x03%s,%s,%s", fields[1], fields[2], fields[4])
}

func getNetworkUsage(client *lib.SSHClient, wg *sync.WaitGroup, result chan<- string) {
	defer wg.Done()

	cmd := `iface=$(ip route | awk '/^default/ {print $5}'); if [ -n "$iface" ]; then ip -s link show "$iface"; fi`
	data, err := client.Exec(cmd)
	if err != nil || strings.TrimSpace(data) == "" {
		return
	}

	// Parse RX/TX values from the network data
	rx, tx := parseNetwork(data)
	result <- fmt.Sprintf("\x04%d,%d", rx/1024/1024, tx/1024/1024)
}

func parseNetwork(data string) (int, int) {
	lines := strings.Split(data, "\n")
	var rxBytes, txBytes int
	rxMode, txMode := false, false

	for _, line := range lines {
		line := strings.TrimSpace(line)

		// Check for RX and TX headers
		if strings.HasPrefix(line, "RX:") {
			rxMode = true
			txMode = false
			continue
		}
		if strings.HasPrefix(line, "TX:") {
			txMode = true
			rxMode = false
			continue
		}

		// Parse RX bytes if in RX mode
		if rxMode {
			fields := strings.Fields(line)
			if len(fields) > 0 {
				rxBytes, _ = strconv.Atoi(fields[0])
			}
			rxMode = false // Reset RX mode after capturing data
		}

		// Parse TX bytes if in TX mode
		if txMode {
			fields := strings.Fields(line)
			if len(fields) > 0 {
				txBytes, _ = strconv.Atoi(fields[0])
			}
			txMode = false // Reset TX mode after capturing data
		}
	}

	return txBytes, rxBytes
}

func getUptime(client *lib.SSHClient, wg *sync.WaitGroup, result chan<- string) {
	defer wg.Done()

	// Try to read uptime from /proc/uptime
	data, err := client.Exec("cat /proc/uptime")
	if err != nil {
		return
	}

	data = strings.TrimSpace(data)
	uptimeParts := strings.Split(data, " ")
	if len(uptimeParts) < 1 {
		return
	}

	uptimeSeconds, err := strconv.ParseFloat(uptimeParts[0], 64)
	if err != nil {
		return
	}

	result <- fmt.Sprintf("\x05%d", int(uptimeSeconds))
}
