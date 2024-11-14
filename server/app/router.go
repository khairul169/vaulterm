package app

import (
	"github.com/gofiber/fiber/v2"
	"rul.sh/vaulterm/app/hosts"
	"rul.sh/vaulterm/app/keychains"
	"rul.sh/vaulterm/app/teams"
	"rul.sh/vaulterm/app/teams/members"
	"rul.sh/vaulterm/app/ws"
)

func InitRouter(app *fiber.App) {
	// App route list
	hosts.Router(app)
	keychains.Router(app)
	teams := teams.Router(app)
	members.Router(teams)
	ws.Router(app)
}
