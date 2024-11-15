package app

import (
	"github.com/gofiber/fiber/v2"
	"rul.sh/vaulterm/server/app/hosts"
	"rul.sh/vaulterm/server/app/keychains"
	"rul.sh/vaulterm/server/app/teams"
	"rul.sh/vaulterm/server/app/teams/members"
	"rul.sh/vaulterm/server/app/ws"
)

func InitRouter(app *fiber.App) {
	// App route list
	hosts.Router(app)
	keychains.Router(app)
	teams := teams.Router(app)
	members.Router(teams)
	ws.Router(app)
}
