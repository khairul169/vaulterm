package hosts

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
	"rul.sh/vaulterm/models"
	"rul.sh/vaulterm/utils"
)

func Router(app *fiber.App) {
	router := app.Group("/hosts")

	router.Get("/", getAll)
	router.Post("/", create)
}

func getAll(c *fiber.Ctx) error {
	repo := NewHostsRepository()
	rows, err := repo.GetAll()
	if err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(fiber.Map{
		"rows": rows,
	})
}

func create(c *fiber.Ctx) error {
	var body CreateHostSchema
	if err := c.BodyParser(&body); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	repo := NewHostsRepository()

	item := &models.Host{
		Type:     body.Type,
		Label:    body.Label,
		Host:     body.Host,
		Port:     body.Port,
		Metadata: body.Metadata,
		ParentID: body.ParentID,
		KeyID:    body.KeyID,
		AltKeyID: body.AltKeyID,
	}
	if err := repo.Create(item); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.Status(http.StatusCreated).JSON(item)
}
