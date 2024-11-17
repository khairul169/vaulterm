package server

import (
	"os"

	"github.com/gofiber/fiber/v2"
)

func Router(app fiber.Router) {
	router := app.Group("/server")

	router.Get("/", getServerInfo)
	router.Get("/config", getConfig)
}

func getServerInfo(c *fiber.Ctx) error {
	return c.JSON(&fiber.Map{
		"name":    "Vaulterm",
		"version": "0.0.1",
	})
}

func getConfig(c *fiber.Ctx) error {
	config := fiber.Map{
		"oauth":            "github",
		"github_client_id": os.Getenv("GITHUB_CLIENT_ID"),
	}
	return c.JSON(config)
}
