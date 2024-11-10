package hosts

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"rul.sh/vaulterm/app/keychains"
	"rul.sh/vaulterm/lib"
	"rul.sh/vaulterm/models"
	"rul.sh/vaulterm/utils"
)

func tryConnect(c *fiber.Ctx, host *models.Host) (string, error) {
	user := utils.GetUser(c)
	keyRepo := keychains.NewRepository(&keychains.Keychains{User: user})

	var key map[string]interface{}
	var altKey map[string]interface{}

	if host.KeyID != nil {
		keychain, _ := keyRepo.Get(*host.KeyID)
		if keychain == nil {
			return "", fmt.Errorf("key %s not found", *host.KeyID)
		}
		keychain.DecryptData(&key)
	}
	if host.AltKeyID != nil {
		keychain, _ := keyRepo.Get(*host.AltKeyID)
		if keychain == nil {
			return "", fmt.Errorf("key %s not found", *host.KeyID)
		}
		keychain.DecryptData(&altKey)
	}

	if host.Type == "ssh" {
		c := lib.NewSSHClient(&lib.SSHClientConfig{
			HostName: host.Host,
			Port:     host.Port,
			Key:      key,
			AltKey:   altKey,
		})

		con, err := c.Connect()
		if err != nil {
			return "", err
		}

		os, err := c.GetOS(c, con)
		if err != nil {
			return "", err
		}

		return os, nil
	}

	return "", nil
}
