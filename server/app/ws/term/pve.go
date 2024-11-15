package term

import (
	"crypto/tls"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"

	fastWs "github.com/fasthttp/websocket"
	"github.com/gofiber/contrib/websocket"
	"rul.sh/vaulterm/server/lib"
)

// https://github.com/proxmox/pve-xtermjs/blob/master/README

func NewTerminalSession(c *websocket.Conn, pve *lib.PVEServer, instance *lib.PVEInstance) error {
	access, err := pve.GetAccessTicket()
	if err != nil {
		log.Println("Error getting access ticket:", err)
		return err
	}

	ticket, err := pve.GetVNCTicket(access, instance, false)
	if err != nil {
		log.Println("Error getting vnc ticket:", err)
		return err
	}

	url := fmt.Sprintf("wss://%s:%d/api2/json/nodes/%s/%s/%s/vncwebsocket?port=%s&vncticket=%s",
		pve.HostName, pve.Port, instance.Node, instance.Type, instance.VMID, ticket.Port, url.QueryEscape(ticket.Ticket))

	headers := http.Header{}
	headers.Add("Authorization", "PVEAPIToken="+access.Username)
	headers.Add("Cookie", "PVEAuthCookie="+access.Ticket)

	dialer := fastWs.Dialer{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}

	ws, _, err := dialer.Dial(url, headers)
	if err != nil {
		log.Println("Error connecting to Proxmox WebSocket:", err)
		return err
	}
	defer ws.Close()

	// Send first ticket line
	ws.WriteMessage(fastWs.TextMessage, []byte(fmt.Sprintf("%s:%s\n", access.Username, access.Ticket)))

	go func() {
		for {
			t, msg, err := c.ReadMessage()
			if err != nil {
				log.Println("Error reading from client:", err)
				break
			}

			if strings.HasPrefix(string(msg), "\x01") {
				parts := strings.Split(string(msg[1:]), ",")
				if len(parts) == 2 {
					width, _ := strconv.Atoi(parts[0])
					height, _ := strconv.Atoi(parts[1])
					ws.WriteMessage(fastWs.TextMessage, []byte(fmt.Sprintf("1:%d:%d:", width, height)))
				}
				continue
			}

			msg = []byte(fmt.Sprintf("0:%d:%s\n", len(msg), string(msg)))

			if err = ws.WriteMessage(t, msg); err != nil {
				log.Println("Error writing to Proxmox:", err)
				break
			}
		}
	}()

	for {
		t, msg, err := ws.ReadMessage()
		if err != nil {
			log.Println("Error reading from Proxmox:", err)
			break
		}

		if string(msg) == "OK" {
			continue
		}

		if err = c.WriteMessage(t, msg); err != nil {
			log.Println("Error writing to client:", err)
			break
		}
	}

	return nil
}

func NewVNCSession(c *websocket.Conn, pve *lib.PVEServer, instance *lib.PVEInstance) error {
	access, err := pve.GetAccessTicket()
	if err != nil {
		log.Println("Error getting access ticket:", err)
		return err
	}

	ticket, err := pve.GetVNCTicket(access, instance, true)
	if err != nil {
		log.Println("Error getting vnc ticket:", err)
		return err
	}

	url := fmt.Sprintf("wss://%s:%d/api2/json/nodes/%s/%s/%s/vncwebsocket?port=%s&vncticket=%s",
		pve.HostName, pve.Port, instance.Node, instance.Type, instance.VMID, ticket.Port, url.QueryEscape(ticket.Ticket))

	headers := http.Header{}
	headers.Add("Authorization", "PVEAPIToken="+access.Username)
	headers.Add("Cookie", "PVEAuthCookie="+access.Ticket)

	dialer := fastWs.Dialer{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}

	ws, _, err := dialer.Dial(url, headers)
	if err != nil {
		log.Println("Error connecting to Proxmox WebSocket:", err)
		return err
	}
	defer ws.Close()

	// Send vnc password
	c.WriteMessage(fastWs.TextMessage, []byte(fmt.Sprintf("\x01%s", ticket.Ticket)))

	go func() {
		for {
			t, msg, err := c.ReadMessage()
			if err != nil {
				log.Println("Error reading from client:", err)
				break
			}

			if err = ws.WriteMessage(t, msg); err != nil {
				log.Println("Error writing to Proxmox:", err)
				break
			}
		}
	}()

	for {
		t, msg, err := ws.ReadMessage()
		if err != nil {
			log.Println("Error reading from Proxmox:", err)
			break
		}

		if err = c.WriteMessage(t, msg); err != nil {
			log.Println("Error writing to client:", err)
			break
		}
	}

	return nil
}
