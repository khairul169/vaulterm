package utils

import (
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"rul.sh/vaulterm/middleware"
)

type UserContext = middleware.AuthUser

func GetUser(c *fiber.Ctx) *UserContext {
	user, _ := c.Locals("user").(*UserContext)
	return user
}

func GetUserWs(c *websocket.Conn) *UserContext {
	user, _ := c.Locals("user").(*UserContext)
	return user
}
