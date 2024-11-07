package auth

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"rul.sh/vaulterm/lib"
	"rul.sh/vaulterm/utils"
)

func Router(app *fiber.App) {
	router := app.Group("/auth")

	router.Post("/login", login)
	router.Get("/user", getUser)
	router.Post("/logout", logout)
}

func login(c *fiber.Ctx) error {
	repo := NewAuthRepository()

	var body LoginSchema
	if err := c.BodyParser(&body); err != nil {
		return &fiber.Error{
			Code:    fiber.StatusBadRequest,
			Message: err.Error(),
		}
	}

	user, err := repo.FindUser(body.Username)
	if err != nil {
		return &fiber.Error{
			Code:    fiber.StatusUnauthorized,
			Message: "Username or password is invalid",
		}
	}

	if valid := lib.VerifyPassword(body.Password, user.Password); !valid {
		return &fiber.Error{
			Code:    fiber.StatusUnauthorized,
			Message: "Username or password is invalid",
		}
	}

	sessionId, err := repo.CreateUserSession(user)
	if err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(fiber.Map{
		"user":      user,
		"sessionId": sessionId,
	})
}

func getUser(c *fiber.Ctx) error {
	auth := c.Get("Authorization")
	var sessionId string

	if auth != "" {
		sessionId = strings.Split(auth, " ")[1]
	}

	repo := NewAuthRepository()
	session, err := repo.GetSession(sessionId)
	if err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(session)
}

func logout(c *fiber.Ctx) error {
	auth := c.Get("Authorization")
	force := c.Query("force")
	var sessionId string

	if auth != "" {
		sessionId = strings.Split(auth, " ")[1]
	}

	repo := NewAuthRepository()
	err := repo.RemoveUserSession(sessionId, force == "true")

	if err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(fiber.Map{
		"status":  "ok",
		"message": "Successfully logged out",
	})
}
