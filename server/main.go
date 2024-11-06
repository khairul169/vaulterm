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
		HostName: "pve",
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

	// app.Get("/ws/ssh", websocket.New(func(c *websocket.Conn) {
	// 	err := lib.NewSSHWebsocketSession(c, &lib.SSHConfig{
	// 		HostName: "10.0.0.102",
	// 		User:     "root",
	// 		Password: "ausya2",
	// 	})

	// 	if err != nil {
	// 		msg := fmt.Sprintf("\r\n%s\r\n", err.Error())
	// 		c.WriteMessage(websocket.TextMessage, []byte(msg))
	// 	}
	// }))

	app.Get("/ws/ssh", websocket.New(func(c *websocket.Conn) {
		node := &lib.PVEInstance{
			Type: "lxc",
			Node: "pve",
			VMID: "102",
		}

		access, err := pve.GetAccessTicket()
		if err != nil {
			c.WriteMessage(websocket.TextMessage, []byte(err.Error()))
			return
		}

		ticket, err := pve.GetVNCTicket(access, node, false)
		if err != nil {
			c.WriteMessage(websocket.TextMessage, []byte(err.Error()))
			return
		}

		if err := pve.NewTerminalSession(c, access, node, ticket); err != nil {
			c.WriteMessage(websocket.TextMessage, []byte(err.Error()))
		}

	}))
	app.Listen(":3000")
}
