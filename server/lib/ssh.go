package lib

import (
	"fmt"
	"io"

	"golang.org/x/crypto/ssh"
)

type SSHClient struct {
	HostName             string
	User                 string
	Password             string
	Port                 int
	PrivateKey           string
	PrivateKeyPassphrase string
}

type SSHClientConfig struct {
	HostName string
	Port     int
	Key      map[string]interface{}
	AltKey   map[string]interface{}
}

func NewSSHClient(cfg *SSHClientConfig) *SSHClient {
	username, _ := cfg.Key["username"].(string)
	password, _ := cfg.Key["password"].(string)
	privateKey, _ := cfg.AltKey["private"].(string)
	passphrase, _ := cfg.AltKey["passphrase"].(string)

	return &SSHClient{
		HostName:             cfg.HostName,
		User:                 username,
		Password:             password,
		Port:                 cfg.Port,
		PrivateKey:           privateKey,
		PrivateKeyPassphrase: passphrase,
	}
}

func (s *SSHClient) Connect() (*ssh.Client, error) {
	// Set up SSH client configuration
	port := s.Port
	if port == 0 {
		port = 22
	}
	auth := []ssh.AuthMethod{
		ssh.Password(s.Password),
	}

	if s.PrivateKey != "" {
		var err error
		var signer ssh.Signer

		if s.PrivateKeyPassphrase != "" {
			signer, err = ssh.ParsePrivateKeyWithPassphrase([]byte(s.PrivateKey), []byte(s.PrivateKeyPassphrase))
		} else {
			signer, err = ssh.ParsePrivateKey([]byte(s.PrivateKey))
		}

		if err != nil {
			return nil, fmt.Errorf("unable to parse private key: %v", err)
		}
		auth = append(auth, ssh.PublicKeys(signer))
	}

	sshConfig := &ssh.ClientConfig{
		User:            s.User,
		Auth:            auth,
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
	}

	// Connect to SSH server
	hostName := fmt.Sprintf("%s:%d", s.HostName, port)
	sshConn, err := ssh.Dial("tcp", hostName, sshConfig)
	if err != nil {
		return nil, err
	}

	return sshConn, nil
}

type PtyShellRes struct {
	Stdout  io.Reader
	Stderr  io.Reader
	Stdin   io.WriteCloser
	Session *ssh.Session
}

func (s *SSHClient) StartPtyShell(sshConn *ssh.Client) (res *PtyShellRes, err error) {
	// Start an SSH shell session
	session, err := sshConn.NewSession()
	if err != nil {
		return nil, err
	}

	stdoutPipe, err := session.StdoutPipe()
	if err != nil {
		return nil, err
	}

	stderrPipe, err := session.StderrPipe()
	if err != nil {
		return nil, err
	}

	stdinPipe, err := session.StdinPipe()
	if err != nil {
		return nil, err
	}

	err = session.RequestPty("xterm-256color", 80, 24, ssh.TerminalModes{})
	if err != nil {
		return nil, err
	}

	if err := session.Shell(); err != nil {
		return nil, err
	}

	return &PtyShellRes{
		Stdout:  stdoutPipe,
		Stderr:  stderrPipe,
		Stdin:   stdinPipe,
		Session: session,
	}, nil
}

func (s *SSHClient) Exec(sshConn *ssh.Client, command string) (string, error) {
	// Start an SSH shell session
	session, err := sshConn.NewSession()
	if err != nil {
		return "", err
	}
	defer session.Close()

	// Execute the command
	output, err := session.CombinedOutput(command)
	if err != nil {
		return "", err
	}

	return string(output), nil
}

func (s *SSHClient) GetOS(client *SSHClient, con *ssh.Client) (string, error) {
	out, err := client.Exec(con, "cat /etc/os-release || uname -a || systeminfo")
	if err != nil {
		return "", err
	}

	return DetectOS(out), nil
}
