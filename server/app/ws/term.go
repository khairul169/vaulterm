package ws

import (
	"log"

	"github.com/gofiber/contrib/websocket"
	"rul.sh/vaulterm/app/hosts"
	"rul.sh/vaulterm/lib"
	"rul.sh/vaulterm/models"
	"rul.sh/vaulterm/utils"
)

func HandleTerm(c *websocket.Conn) {
	hostId := c.Query("hostId")

	hostRepo := hosts.NewRepository()
	data, err := hostRepo.Get(hostId)

	if data == nil {
		log.Printf("Cannot find host! Error: %s\n", err.Error())
		c.WriteMessage(websocket.TextMessage, []byte("Host not found"))
		return
	}

	switch data.Host.Type {
	case "ssh":
		sshHandler(c, data)
	case "pve":
		pveHandler(c, data)
	case "incus":
		incusHandler(c, data)
	default:
		c.WriteMessage(websocket.TextMessage, []byte("Invalid host type"))
	}
}

func sshHandler(c *websocket.Conn, data *models.HostDecrypted) {
	cfg := lib.NewSSHClient(&lib.SSHClientConfig{
		HostName: data.Host.Host,
		Port:     data.Port,
		Key:      data.Key,
		AltKey:   data.AltKey,
	})

	if err := NewSSHWebsocketSession(c, cfg); err != nil {
		c.WriteMessage(websocket.TextMessage, []byte(err.Error()))
	}
}

func pveHandler(c *websocket.Conn, data *models.HostDecrypted) {
	client := c.Query("client")
	username, _ := data.Key["username"].(string)
	realm, _ := data.Key["realm"].(string)
	password, _ := data.Key["password"].(string)

	pve := &lib.PVEServer{
		HostName: data.Host.Host,
		Port:     data.Port,
		Username: username,
		Realm:    realm,
		Password: password,
	}

	var i *lib.PVEInstance
	if err := utils.ParseMapInterface(data.Host.Metadata, &i); err != nil {
		c.WriteMessage(websocket.TextMessage, []byte(err.Error()))
		return
	}

	if i == nil || i.Type == "" || i.Node == "" || i.VMID == "" {
		c.WriteMessage(websocket.TextMessage, []byte("Invalid pve instance metadata"))
		return
	}

	var err error
	if client == "vnc" {
		err = NewVNCSession(c, pve, i)
	} else {
		err = NewTerminalSession(c, pve, i)
	}

	if err != nil {
		c.WriteMessage(websocket.TextMessage, []byte(err.Error()))
	}
}

func incusHandler(c *websocket.Conn, data *models.HostDecrypted) {
	shell := c.Query("shell")

	cert, _ := data.Key["cert"].(string)
	key, _ := data.Key["key"].(string)

	if cert == "" || key == "" {
		c.WriteMessage(websocket.TextMessage, []byte("Missing certificate or key"))
		return
	}

	incus := &lib.IncusServer{
		HostName:   data.Host.Host,
		Port:       data.Port,
		ClientCert: cert,
		ClientKey:  key,
	}

	session := &IncusWebsocketSession{}
	if err := utils.ParseMapInterface(data.Host.Metadata, session); err != nil {
		c.WriteMessage(websocket.TextMessage, []byte(err.Error()))
		return
	}

	if shell != "" {
		session.Shell = shell
	}

	if err := session.NewTerminal(c, incus); err != nil {
		c.WriteMessage(websocket.TextMessage, []byte(err.Error()))
	}
}
