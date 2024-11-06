package main

import (
	"context"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/coder/websocket"
	"golang.org/x/crypto/ssh"
)

// Replace with actual SSH server credentials
var sshHost = "10.0.0.102"
var sshUser = "root"
var sshPassword = "ausya2"

func sshWebSocketHandler(w http.ResponseWriter, r *http.Request) {
	wsConn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		OriginPatterns: []string{"*"}, // Adjust origin policy as needed
	})
	if err != nil {
		log.Printf("failed to accept websocket: %v", err)
		return
	}

	// Set up SSH client configuration
	sshConfig := &ssh.ClientConfig{
		User: sshUser,
		Auth: []ssh.AuthMethod{
			ssh.Password(sshPassword),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}

	// Connect to SSH server
	sshConn, err := ssh.Dial("tcp", sshHost+":22", sshConfig)
	if err != nil {
		wsConn.Write(context.Background(), websocket.MessageText, []byte(err.Error()))
		wsConn.Close(websocket.StatusInternalError, "failed to connect to SSH")
		return
	}
	defer sshConn.Close()

	// Start an SSH shell session
	session, err := sshConn.NewSession()
	if err != nil {
		wsConn.Write(context.Background(), websocket.MessageText, []byte(err.Error()))
		wsConn.Close(websocket.StatusInternalError, "failed to start SSH session")
		return
	}
	defer session.Close()

	stdoutPipe, err := session.StdoutPipe()
	if err != nil {
		wsConn.Close(websocket.StatusInternalError, "failed to get stdout pipe")
		return
	}

	stderrPipe, err := session.StderrPipe()
	if err != nil {
		wsConn.Close(websocket.StatusInternalError, "failed to get stderr pipe")
		return
	}

	stdinPipe, err := session.StdinPipe()
	if err != nil {
		wsConn.Close(websocket.StatusInternalError, "failed to get stdin pipe")
		return
	}

	err = session.RequestPty("xterm-256color", 80, 24, ssh.TerminalModes{})
	if err != nil {
		wsConn.Close(websocket.StatusInternalError, "failed to request pty")
		return
	}

	if err := session.Shell(); err != nil {
		wsConn.Close(websocket.StatusInternalError, "failed to start shell")
		return
	}

	// Goroutine to send SSH stdout to WebSocket
	go func() {
		buf := make([]byte, 1024)
		for {
			n, err := stdoutPipe.Read(buf)
			if err != nil {
				if err != io.EOF {
					log.Printf("error reading from SSH stdout: %v", err)
				}
				break
			}

			if writeErr := wsConn.Write(context.Background(), websocket.MessageBinary, buf[:n]); writeErr != nil {
				log.Printf("error writing to websocket: %v", writeErr)
				break
			}
		}
	}()

	// Goroutine to handle SSH stderr
	go func() {
		buf := make([]byte, 1024)
		for {
			n, err := stderrPipe.Read(buf)
			if err != nil {
				if err != io.EOF {
					log.Printf("error reading from SSH stderr: %v", err)
				}
				break
			}
			if writeErr := wsConn.Write(context.Background(), websocket.MessageBinary, buf[:n]); writeErr != nil {
				log.Printf("error writing to websocket: %v", writeErr)
				break
			}
		}
	}()

	// Handle WebSocket to SSH data streaming
	go func() {
		defer session.Close()

		for {
			_, msg, err := wsConn.Read(context.Background())
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
			} else {
				stdinPipe.Write(msg)
			}
		}
	}()

	// Wait for the SSH session to close
	if err := session.Wait(); err != nil {
		log.Printf("SSH session ended with error: %v", err)
		wsConn.Write(context.Background(), websocket.MessageText, []byte(err.Error()))
	} else {
		log.Println("SSH session ended normally")
	}

	// Ensure WebSocket is closed after SSH logout
	wsConn.Close(websocket.StatusNormalClosure, "SSH session closed")
}

func main() {
	http.HandleFunc("/ws/ssh", sshWebSocketHandler)
	log.Println("Server started on :3000")
	log.Fatal(http.ListenAndServe(":3000", nil))
}
