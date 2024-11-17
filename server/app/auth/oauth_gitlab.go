package auth

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/gitlab"
	"gorm.io/gorm"
	"rul.sh/vaulterm/server/models"
	"rul.sh/vaulterm/server/utils"
)

type GitlabCfg struct {
	oauth2.Config
	verifier  string
	challenge string
}

var gitlabCfg *GitlabCfg

func getGitlabConfig() *GitlabCfg {
	if gitlabCfg != nil {
		return gitlabCfg
	}

	oauthCfg := oauth2.Config{
		ClientID:     os.Getenv("GITLAB_CLIENT_ID"),
		ClientSecret: os.Getenv("GITLAB_CLIENT_SECRET"),
		Endpoint:     gitlab.Endpoint,
		// RedirectURL:  "http://localhost:3000/auth/oauth/gitlab/callback",
		RedirectURL: "http://localhost:8081",
		Scopes:      []string{"read_user"},
	}
	verifier := oauth2.GenerateVerifier()
	challenge := oauth2.S256ChallengeFromVerifier(verifier)

	gitlabCfg = &GitlabCfg{
		Config:    oauthCfg,
		verifier:  verifier,
		challenge: challenge,
	}
	return gitlabCfg
}

func gitlabRedir(c *fiber.Ctx) error {
	// Redirect to Gitlab login page
	url := getGitlabConfig().
		AuthCodeURL("login", oauth2.S256ChallengeOption(getGitlabConfig().verifier))
	return c.Redirect(url)
}

func gitlabCallback(c *fiber.Ctx) error {
	cfg := getGitlabConfig()
	code := c.Query("code")
	verifier := c.Query("verifier")

	if code == "" {
		return c.Status(fiber.StatusBadRequest).SendString("Missing code")
	}
	if verifier == "" {
		verifier = cfg.verifier
	}

	// Exchange code for a token
	token, err := cfg.Exchange(c.Context(), code, oauth2.VerifierOption(verifier))
	if err != nil {
		log.Println(token, err)
		return c.Status(fiber.StatusInternalServerError).SendString("Failed to exchange token")
	}

	// Retrieve user info
	client := cfg.Client(c.Context(), token)
	resp, err := client.Get("https://gitlab.com/api/v4/user")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Failed to get user info")
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		return c.Status(fiber.StatusInternalServerError).
			SendString(fmt.Sprintf("Gitlab API error: %s", string(body)))
	}

	// Parse user info
	var user struct {
		Username  string `json:"username"`
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
