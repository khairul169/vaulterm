package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"rul.sh/vaulterm/db"
	"rul.sh/vaulterm/models"
)

func Auth(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	var sessionId string

	if authHeader != "" {
		sessionId = strings.Split(authHeader, " ")[1]
	}

	if strings.HasPrefix(c.Path(), "/ws") && sessionId == "" {
		sessionId = c.Query("sid")
	}

	session, _ := GetUserSession(sessionId)

	if session != nil && session.User.ID != "" {
		c.Locals("user", &session.User)
		c.Locals("sessionId", sessionId)
	}

	return c.Next()
}

func GetUserSession(sessionId string) (*models.UserSession, error) {
	var session models.UserSession
	res := db.Get().
		Joins("User").
		Preload("User.Teams", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "name", "icon")
		}).
		Where("user_sessions.id = ?", sessionId).
		First(&session)

	return &session, res.Error
}

func Protected() func(c *fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		user := c.Locals("user")
		if user == nil {
			return &fiber.Error{
				Code:    fiber.StatusUnauthorized,
				Message: "Unauthorized",
			}
		}
		return c.Next()
	}

}
