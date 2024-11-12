package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
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

	if session != nil && session.ID != "" {
		c.Locals("user", session)
		c.Locals("sessionId", sessionId)
	}

	return c.Next()
}

type AuthUser struct {
	models.User
	SessionID string `json:"sessionId" gorm:"column:session_id"`
}

func GetUserSession(sessionId string) (*AuthUser, error) {
	var session AuthUser

	res := db.Get().
		Model(&models.User{}).
		Joins("JOIN user_sessions ON user_sessions.user_id = users.id").
		Preload("Teams.Team").
		Select("users.*, user_sessions.id AS session_id").
		Where("user_sessions.id = ?", sessionId).
		First(&session)

	if res.Error != nil || session.User.ID == "" {
		return nil, res.Error
	}

	return &session, nil
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
