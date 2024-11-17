package auth

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/gitlab"
	"gorm.io/gorm"
	"rul.sh/vaulterm/server/models"
	"rul.sh/vaulterm/server/utils"
)

var gitlabCfg *oauth2.Config

func getGitlabConfig() *oauth2.Config {
	if gitlabCfg != nil {
		return gitlabCfg
	}

	gitlabCfg = &oauth2.Config{
		ClientID:     os.Getenv("GITLAB_CLIENT_ID"),
		ClientSecret: os.Getenv("GITLAB_CLIENT_SECRET"),
		Endpoint:     gitlab.Endpoint,
		RedirectURL:  "vaulterm://auth/login",
		Scopes:       []string{"read_user"},
	}
	return gitlabCfg
}

func gitlabCallback(c *fiber.Ctx) error {
	var body struct {
		Code     string `json:"code"`
		Verifier string `json:"verifier"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).SendString("Failed to parse request body")
	}
	if body.Code == "" || body.Verifier == "" {
		return c.Status(fiber.StatusBadRequest).SendString("Missing code or verifier")
	}

	// Exchange code for a token
	cfg := getGitlabConfig()
	token, err := cfg.Exchange(c.Context(), body.Code, oauth2.VerifierOption(body.Verifier))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Failed to exchange token")
	}

	// Retrieve user info
	client := cfg.Client(c.Context(), token)
	resp, err := client.Get("https://gitlab.com/api/v4/user")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Failed to get user info")
	}
	defer resp.Body.Close()

	data, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		return c.Status(fiber.StatusInternalServerError).
			SendString(fmt.Sprintf("Gitlab API error: %s", string(data)))
	}

	// Parse user info
	var user struct {
		Username  string `json:"username"`
		ID        int    `json:"id"`
		Name      string `json:"name"`
		AvatarURL string `json:"avatar_url"`
		Email     string `json:"email"`
	}

	if err := json.Unmarshal(data, &user); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Failed to parse user info")
	}

	repo := NewRepository()
	accountId := strconv.Itoa(user.ID)
	userAccount, err := repo.FindUserAccount("gitlab", accountId)

	// Register the user if the account not yet registered
	if errors.Is(err, gorm.ErrRecordNotFound) {
		acc := models.UserAccount{
			Type:      "gitlab",
			AccountID: accountId,
			Username:  user.Username,
			Email:     user.Email,
		}
		user := models.User{
			Name:     user.Name,
			Role:     models.UserRoleUser,
			Image:    user.AvatarURL,
			Accounts: []*models.UserAccount{&acc},
		}

		sessionId, err := repo.CreateUser(&user)
		if err != nil {
			return utils.ResponseError(c, err, 500)
		}

		return c.JSON(fiber.Map{
			"user":      user,
			"sessionId": sessionId,
		})
	}

	if err != nil {
		return utils.ResponseError(c, err, 500)
	}
	sessionId, err := repo.CreateUserSession(&userAccount.User)
	if err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(fiber.Map{
		"user":      userAccount.User,
		"sessionId": sessionId,
	})
}
