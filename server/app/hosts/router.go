package hosts

import (
	"fmt"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"rul.sh/vaulterm/models"
	"rul.sh/vaulterm/utils"
)

func Router(app *fiber.App) {
	router := app.Group("/hosts")

	router.Get("/", getAll)
	router.Post("/", create)
	router.Put("/:id", update)
	router.Delete("/:id", delete)
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

func update(c *fiber.Ctx) error {
	var body CreateHostSchema
	if err := c.BodyParser(&body); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	repo := NewHostsRepository()

	id := c.Params("id")
	exist, _ := repo.Exists(id)
	if !exist {
		return utils.ResponseError(c, fmt.Errorf("host %s not found", id), 404)
	}

	item := &models.Host{
		Model:    models.Model{ID: id},
		Type:     body.Type,
		Label:    body.Label,
		Host:     body.Host,
		Port:     body.Port,
		Metadata: body.Metadata,
		ParentID: body.ParentID,
		KeyID:    body.KeyID,
		AltKeyID: body.AltKeyID,
	}
	if err := repo.Update(item); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(item)
}

func delete(c *fiber.Ctx) error {
	repo := NewHostsRepository()

	id := c.Params("id")
	exist, _ := repo.Exists(id)
	if !exist {
		return utils.ResponseError(c, fmt.Errorf("host %s not found", id), 404)
	}

	if err := repo.Delete(id); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(fiber.Map{
		"status":  "ok",
		"message": "Successfully deleted",
	})
}
