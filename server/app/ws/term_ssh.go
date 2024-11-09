package ws

import (
	"io"
	"log"
	"strconv"
	"strings"

	"github.com/gofiber/contrib/websocket"
	"rul.sh/vaulterm/lib"
)

func NewSSHWebsocketSession(c *websocket.Conn, client *lib.SSHClient) error {
	con, err := client.Connect()
	if err != nil {
		log.Printf("error connecting to SSH: %v", err)
		return err
	}
	defer con.Close()

	shell, err := client.StartPtyShell(con)
	if err != nil {
		log.Printf("error starting SSH shell: %v", err)
		return err
	}

	session := shell.Session
	defer session.Close()

	// Goroutine to send SSH stdout to WebSocket
	go func() {
		buf := make([]byte, 1024)
		for {
			n, err := shell.Stdout.Read(buf)
			if err != nil {
				if err != io.EOF {
					log.Printf("error reading from SSH stdout: %v", err)
				}
				break
			}

			if err := c.WriteMessage(websocket.BinaryMessage, buf[:n]); err != nil {
				log.Printf("error writing to websocket: %v", err)
				break
			}
		}
	}()

	// Goroutine to handle SSH stderr
	go func() {
		buf := make([]byte, 1024)
		for {
			n, err := shell.Stderr.Read(buf)
			if err != nil {
				if err != io.EOF {
					log.Printf("error reading from SSH stderr: %v", err)
				}
				break
			}
			if err := c.WriteMessage(websocket.BinaryMessage, buf[:n]); err != nil {
				log.Printf("error writing to websocket: %v", err)
				break
			}
		}
	}()

	// Handle WebSocket to SSH data streaming
	go func() {
		defer session.Close()

		for {
			_, msg, err := c.ReadMessage()
			if err != nil {
				log.Printf("error reading from websocket: %v", err)
				break
			}

			if strings.HasPrefix(string(msg), "\x01") {
				parts := strings.Split(string(msg[1:]), ",")
				if len(parts) == 2 {
					width, _ := strconv.Atoi(parts[0])
					height, _ := strconv.Atoi(parts[1])
					session.WindowChange(height, width)
				}
				continue
			}

			shell.Stdin.Write(msg)
		}

		log.Println("SSH session closed")
	}()

	// Wait for the SSH session to close
	if err := session.Wait(); err != nil {
		log.Printf("SSH session ended with error: %v", err)
		return err
	}

	return nil
}
