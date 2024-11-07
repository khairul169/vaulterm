package ws

import (
	"fmt"
	"io"
	"log"
	"strconv"
	"strings"

	"github.com/gofiber/contrib/websocket"
	"golang.org/x/crypto/ssh"
)

type SSHConfig struct {
	HostName             string
	User                 string
	Password             string
	Port                 int
	PrivateKey           string
	PrivateKeyPassphrase string
}

func NewSSHWebsocketSession(c *websocket.Conn, cfg *SSHConfig) error {
	// Set up SSH client configuration
	port := cfg.Port
	if port == 0 {
		port = 22
	}
	auth := []ssh.AuthMethod{
		ssh.Password(cfg.Password),
	}

	if cfg.PrivateKey != "" {
		var err error
		var signer ssh.Signer

		if cfg.PrivateKeyPassphrase != "" {
			signer, err = ssh.ParsePrivateKeyWithPassphrase([]byte(cfg.PrivateKey), []byte(cfg.PrivateKeyPassphrase))
		} else {
			signer, err = ssh.ParsePrivateKey([]byte(cfg.PrivateKey))
		}

		if err != nil {
			return fmt.Errorf("unable to parse private key: %v", err)
		}
		auth = append(auth, ssh.PublicKeys(signer))
	}

	sshConfig := &ssh.ClientConfig{
		User:            cfg.User,
		Auth:            auth,
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}

	// Connect to SSH server
	hostName := fmt.Sprintf("%s:%d", cfg.HostName, port)
	sshConn, err := ssh.Dial("tcp", hostName, sshConfig)
	if err != nil {
		return err
	}
	defer sshConn.Close()

	// Start an SSH shell session
	session, err := sshConn.NewSession()
	if err != nil {
		return err
	}
	defer session.Close()

	stdoutPipe, err := session.StdoutPipe()
	if err != nil {
		return err
	}

	stderrPipe, err := session.StderrPipe()
	if err != nil {
		return err
	}

	stdinPipe, err := session.StdinPipe()
	if err != nil {
		return err
	}

	err = session.RequestPty("xterm-256color", 80, 24, ssh.TerminalModes{})
	if err != nil {
		return err
	}

	if err := session.Shell(); err != nil {
		return err
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
			n, err := stderrPipe.Read(buf)
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

			stdinPipe.Write(msg)
		}
	}()

	// Wait for the SSH session to close
	if err := session.Wait(); err != nil {
		log.Printf("SSH session ended with error: %v", err)
		return err
	}

	log.Println("SSH session ended normally")
	return nil
}
