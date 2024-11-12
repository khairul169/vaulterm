package utils

import (
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"rul.sh/vaulterm/models"
)

type UserContext struct {
	*models.User
	IsAdmin bool `json:"isAdmin"`
}

func getUserData(user *models.User) *UserContext {
	isAdmin := false

	if user.Role == models.UserRoleAdmin {
		isAdmin = true
	}

	return &UserContext{
		User:    user,
		IsAdmin: isAdmin,
	}
}

func GetUser(c *fiber.Ctx) *UserContext {
	user := c.Locals("user").(*models.User)
	return getUserData(user)
}

func GetUserWs(c *websocket.Conn) *UserContext {
	user := c.Locals("user").(*models.User)
	return getUserData(user)
}
