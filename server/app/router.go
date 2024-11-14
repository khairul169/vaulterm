package app

import (
	"github.com/gofiber/fiber/v2"
	"rul.sh/vaulterm/app/hosts"
	"rul.sh/vaulterm/app/keychains"
	"rul.sh/vaulterm/app/teams"
	"rul.sh/vaulterm/app/ws"
)

func InitRouter(app *fiber.App) {
	// App route list
	routes := []Router{
		hosts.Router,
		keychains.Router,
		teams.Router,
		ws.Router,
	}

	for _, route := range routes {
		route(app)
	}
}

type Router func(app fiber.Router)
