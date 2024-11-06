package main

import (
	"os"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"rul.sh/vaulterm/lib"
)

func main() {
	godotenv.Load()
	app := fiber.New()

	var pve = &lib.PVEServer{
		HostName: "10.0.0.1",
		Port:     8006,
		Username: os.Getenv("PVE_USERNAME"),
		Password: os.Getenv("PVE_PASSWORD"),
	}

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, World!")
	})

	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	app.Get("/ws/ssh", websocket.New(func(c *websocket.Conn) {
		cfg := &lib.SSHConfig{
			HostName: "10.0.0.102",
			User:     "root",
			Password: "ausya2",
		}

		if err := lib.NewSSHWebsocketSession(c, cfg); err != nil {
			c.WriteMessage(websocket.TextMessage, []byte(err.Error()))
		}
	}))

	app.Get("/ws/pve", websocket.New(func(c *websocket.Conn) {
		client := c.Query("client")
		serverId := c.Query("serverId")

		var node *lib.PVEInstance

		switch serverId {
		case "2":
			node = &lib.PVEInstance{
				Type: "qemu",
				Node: "pve",
				VMID: "105",
			}
		case "3":
			node = &lib.PVEInstance{
				Type: "lxc",
				Node: "pve",
				VMID: "102",
			}
		}

		var err error
		if client == "vnc" {
			err = pve.NewVNCSession(c, node)
		} else {
			err = pve.NewTerminalSession(c, node)
		}

		if err != nil {
			c.WriteMessage(websocket.TextMessage, []byte(err.Error()))
		}
	}))

	app.Get("/ws/incus", websocket.New(func(c *websocket.Conn) {
		incus := &lib.IncusServer{
			HostName:   "100.64.0.3",
			Port:       8443,
			ClientCert: "",
			ClientKey:  "",
		}

		if err := lib.NewIncusWebsocketSession(c, incus); err != nil {
			c.WriteMessage(websocket.TextMessage, []byte(err.Error()))
		}
	}))

	app.Listen(":3000")
}
