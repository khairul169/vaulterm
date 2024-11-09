package ws

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	fastWs "github.com/fasthttp/websocket"
	"github.com/gofiber/contrib/websocket"
	"rul.sh/vaulterm/lib"
)

type IncusWebsocketSession struct {
	Type     string `json:"type"` // "qemu" | "lxc"
	Instance string `json:"instance"`
	User     *int   `json:"user"`
	Shell    string `json:"shell"`
}

func (i *IncusWebsocketSession) NewTerminal(c *websocket.Conn, incus *lib.IncusServer) error {
	if i.Shell == "" {
		i.Shell = "/bin/sh"
	}

	exec, err := incus.InstanceExec(i.Instance, []string{i.Shell}, &lib.IncusInstanceExecOptions{
		Interactive: true,
		User:        i.User,
	})
	if err != nil {
		return err
	}

	clientCert, err := incus.GetCertificate()
	if err != nil {
		return err
	}

	dialer := fastWs.Dialer{
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: true,
			Certificates:       []tls.Certificate{*clientCert},
		},
	}

	controlUrl := fmt.Sprintf("wss://%s:%d%s/websocket?secret=%s", incus.HostName, incus.Port, exec.Operation, exec.Control)
	controlWs, _, err := dialer.Dial(controlUrl, nil)
	if err != nil {
		return err
	}
	defer controlWs.Close()

	ttyUrl := fmt.Sprintf("wss://%s:%d%s/websocket?secret=%s", incus.HostName, incus.Port, exec.Operation, exec.Secret)
	ttyWs, _, err := dialer.Dial(ttyUrl, nil)
	if err != nil {
		return err
	}
	defer ttyWs.Close()

	go func() {
		for {
			_, msg, err := c.ReadMessage()
			if err != nil {
				log.Println("Error reading from client:", err)
				break
			}

			if strings.HasPrefix(string(msg), "\x01") {
				parts := strings.Split(string(msg[1:]), ",")
				if len(parts) == 2 {
					resizeCmd, _ := json.Marshal(map[string]interface{}{
						"command": "window-resize",
						"args": map[string]string{
							"width":  parts[0],
							"height": parts[1],
						},
					})
					controlWs.WriteMessage(websocket.BinaryMessage, resizeCmd)
				}
				continue
			}

			if err = ttyWs.WriteMessage(websocket.BinaryMessage, msg); err != nil {
				log.Println("Error writing to Incus:", err)
				break
			}
		}
	}()

	for {
		t, msg, err := ttyWs.ReadMessage()
		if err != nil {
			log.Println("Error reading from Incus:", err)
			break
		}

		if err = c.WriteMessage(t, msg); err != nil {
			log.Println("Error writing to client:", err)
			break
		}
	}

	return nil
}
