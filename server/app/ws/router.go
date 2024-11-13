package ws

import (
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"rul.sh/vaulterm/app/ws/stats"
	"rul.sh/vaulterm/app/ws/term"
)

func Router(app fiber.Router) {
	router := app.Group("/ws")

	router.Use(func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	router.Get("/term", websocket.New(term.HandleTerm))
	router.Get("/stats", websocket.New(stats.HandleStats))
}
