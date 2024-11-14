package term

import (
	"bufio"
	"io"
	"log"
	"strconv"
	"strings"

	"github.com/gofiber/contrib/websocket"
	"rul.sh/vaulterm/lib"
)

func NewSSHWebsocketSession(c *websocket.Conn, client *lib.SSHClient) ([]byte, error) {
	if err := client.Connect(); err != nil {
		log.Printf("error connecting to SSH: %v", err)
		return nil, err
	}
	defer client.Close()

	shell, err := client.StartPtyShell()
	if err != nil {
		log.Printf("error starting SSH shell: %v", err)
		return nil, err
	}

	session := shell.Session
	defer session.Close()

	sessionCapture, sessionCaptureWriter := io.Pipe()
	defer sessionCapture.Close()
	sessionLog := []byte{}

	// Capture SSH session output
	go func() {
		reader := bufio.NewReader(sessionCapture)
		for {
			b, err := reader.ReadBytes('\n')
			if err != nil {
				break
			}
			sessionLog = append(sessionLog, b...)
		}
	}()

	// Pass SSH stdout to WebSocket
	go func() {
		buf := make([]byte, 1024)
		for {
			n, err := shell.Stdout.Read(buf)
			if err != nil {
				break
			}
			sessionCaptureWriter.Write(buf[:n])
			if err := c.WriteMessage(websocket.BinaryMessage, buf[:n]); err != nil {
				break
			}
		}
	}()

	// Pass SSH stderr to WebSocket
	go func() {
		buf := make([]byte, 1024)
		for {
			n, err := shell.Stderr.Read(buf)
			if err != nil {
				break
			}
			sessionCaptureWriter.Write(buf[:n])
			if err := c.WriteMessage(websocket.BinaryMessage, buf[:n]); err != nil {
				break
			}
		}
	}()

	// Handle user input
	go func() {
		defer session.Close()

		for {
			_, msg, err := c.ReadMessage()
			if err != nil {
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
	}()

	// Wait for the SSH session to close
	if err := session.Wait(); err != nil {
		log.Printf("SSH session ended with error: %v", err)
		return sessionLog, err
	}

	return sessionLog, nil
}
