package keychains

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
	"rul.sh/vaulterm/models"
	"rul.sh/vaulterm/utils"
)

func Router(app *fiber.App) {
	router := app.Group("/keychains")

	router.Get("/", getAll)
	router.Post("/", create)
}

func getAll(c *fiber.Ctx) error {
	repo := NewKeychainsRepository()
	rows, err := repo.GetAll()
	if err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(fiber.Map{
		"rows": rows,
	})
}

func create(c *fiber.Ctx) error {
	var body CreateKeychainSchema
	if err := c.BodyParser(&body); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	repo := NewKeychainsRepository()

	item := &models.Keychain{
		Type:  body.Type,
		Label: body.Label,
	}

	if err := item.EncryptData(body.Data); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	if err := repo.Create(item); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.Status(http.StatusCreated).JSON(item)
}
