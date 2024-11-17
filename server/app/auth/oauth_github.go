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
	"golang.org/x/oauth2/github"
	"gorm.io/gorm"
	"rul.sh/vaulterm/server/models"
	"rul.sh/vaulterm/server/utils"
)

var config *oauth2.Config

func getGithubConfig() *oauth2.Config {
	if config != nil {
		return config
	}

	config = &oauth2.Config{
		ClientID:     os.Getenv("GITHUB_CLIENT_ID"),
		ClientSecret: os.Getenv("GITHUB_CLIENT_SECRET"),
		Endpoint:     github.Endpoint,
		RedirectURL:  "http://localhost:3000/auth/oauth/github/callback",
		Scopes:       []string{"read:user"},
	}
	return config
}

func githubRedir(c *fiber.Ctx) error {
	// Redirect to GitHub login page
	url := getGithubConfig().AuthCodeURL("state", oauth2.AccessTypeOffline)
	return c.Redirect(url)
}

func githubCallback(c *fiber.Ctx) error {
	code := c.Query("code")
	if code == "" {
		return c.Status(fiber.StatusBadRequest).SendString("Missing code")
	}

	// Exchange code for a token
	cfg := getGithubConfig()
	token, err := cfg.Exchange(c.Context(), code)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Failed to exchange token")
	}

	// Retrieve user info
	client := cfg.Client(c.Context(), token)
	resp, err := client.Get("https://api.github.com/user")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Failed to get user info")
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		return c.Status(fiber.StatusInternalServerError).
			SendString(fmt.Sprintf("GitHub API error: %s", string(body)))
	}

	// Parse user info
	var user struct {
		Login     string `json:"login"`
		ID        int    `json:"id"`
		Name      string `json:"name"`
		AvatarURL string `json:"avatar_url"`
		Email     string `json:"email"`
	}

	if err := json.Unmarshal(body, &user); err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Failed to parse user info")
	}

	repo := NewRepository()
	accountId := strconv.Itoa(user.ID)
	userAccount, err := repo.FindUserAccount("github", accountId)

	// Register the user if the account not yet registered
	if errors.Is(err, gorm.ErrRecordNotFound) {
		acc := models.UserAccount{
			Type:      "github",
			AccountID: accountId,
			Username:  user.Login,
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
