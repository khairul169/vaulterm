package stats

import (
	"github.com/gofiber/contrib/websocket"
	"rul.sh/vaulterm/server/app/hosts"
	"rul.sh/vaulterm/server/lib"
	"rul.sh/vaulterm/server/models"
)

func HandleStats(c *websocket.Conn) {
	hostId := c.Query("hostId")

	user := lib.GetUserWs(c)
	hostRepo := hosts.NewRepository(&hosts.Hosts{User: user})
	data, _ := hostRepo.GetWithKeys(hostId)

	if data == nil || !data.HasAccess(&user.User) {
		c.WriteMessage(websocket.TextMessage, []byte("Host not found"))
		return
	}

	switch data.Host.Type {
	case "ssh":
		sshHandler(c, data)
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

	if err := HandleSSHStats(c, cfg); err != nil {
		c.WriteMessage(websocket.TextMessage, []byte(err.Error()))
	}
}
