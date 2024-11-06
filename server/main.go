package main

import (
	"fmt"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"rul.sh/vaulterm/lib"
)

func main() {
	app := fiber.New()

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
		err := lib.NewSSHWebsocketSession(c, &lib.SSHConfig{
			HostName: "10.0.0.102",
			User:     "root",
			Password: "ausya2",
		})

		if err != nil {
			msg := fmt.Sprintf("\r\n%s\r\n", err.Error())
			c.WriteMessage(websocket.TextMessage, []byte(msg))
		}
	}))

	app.Listen(":3000")
}
