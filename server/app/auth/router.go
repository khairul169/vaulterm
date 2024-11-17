package auth

import (
	"github.com/gofiber/fiber/v2"
	"rul.sh/vaulterm/server/lib"
	"rul.sh/vaulterm/server/middleware"
	"rul.sh/vaulterm/server/models"
	"rul.sh/vaulterm/server/utils"
)

func Router(app *fiber.App) {
	router := app.Group("/auth")

	router.Post("/login", login)
	router.Get("/user", middleware.Protected(), getUser)
	router.Post("/register", register)
	router.Post("/logout", middleware.Protected(), logout)

	oauth := router.Group("/oauth")
	oauth.Get("/github", githubRedir)
	oauth.Get("/github/callback", githubCallback)
}

func login(c *fiber.Ctx) error {
	repo := NewRepository()

	var body LoginSchema
	if err := c.BodyParser(&body); err != nil {
		return &fiber.Error{
			Code:    fiber.StatusBadRequest,
			Message: err.Error(),
		}
	}

	user, err := repo.FindUser(body.Username, "")
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
	user := utils.GetUser(c)
	teams := []TeamWithRole{}

	for _, item := range user.Teams {
		teams = append(teams, TeamWithRole{
			ID:   item.TeamID,
			Name: item.Team.Name,
			Icon: item.Team.Icon,
			Role: item.Role,
		})
	}

	return c.JSON(&GetUserResult{
		AuthUser: *user,
		Teams:    teams,
	})
}

func register(c *fiber.Ctx) error {
	repo := NewRepository()

	var body RegisterSchema
	if err := c.BodyParser(&body); err != nil {
		return &fiber.Error{
			Code:    fiber.StatusBadRequest,
			Message: err.Error(),
		}
	}

	exist, _ := repo.FindUser(body.Username, body.Email)
	if exist.ID != "" {
		return &fiber.Error{
			Code:    fiber.StatusBadRequest,
			Message: "Username or email already exists",
		}
	}

	password, err := lib.HashPassword(body.Password)
	if err != nil {
		return utils.ResponseError(c, err, 500)
	}

	user := &models.User{
		Name:     body.Name,
		Username: body.Username,
		Email:    body.Email,
		Password: password,
		Role:     models.UserRoleUser,
	}

	sessionId, err := repo.CreateUser(user)
	if err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(fiber.Map{
		"user":      user,
		"sessionId": sessionId,
	})
}

func logout(c *fiber.Ctx) error {
	force := c.Query("force")
	sessionId := c.Locals("sessionId").(string)

	repo := NewRepository()
	err := repo.RemoveUserSession(sessionId, force == "true")

	if err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(fiber.Map{
		"status":  "ok",
		"message": "Successfully logged out",
	})
}
