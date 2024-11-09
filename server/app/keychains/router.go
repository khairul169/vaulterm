package keychains

import (
	"fmt"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"rul.sh/vaulterm/models"
	"rul.sh/vaulterm/utils"
)

func Router(app *fiber.App) {
	router := app.Group("/keychains")

	router.Get("/", getAll)
	router.Post("/", create)
	router.Put("/:id", update)
}

type GetAllResult struct {
	*models.Keychain
	Data map[string]interface{} `json:"data"`
}

func getAll(c *fiber.Ctx) error {
	withData := c.Query("withData")

	repo := NewRepository()
	rows, err := repo.GetAll()
	if err != nil {
		return utils.ResponseError(c, err, 500)
	}

	if withData != "true" {
		return c.JSON(fiber.Map{"rows": rows})
	}

	res := make([]*GetAllResult, len(rows))
	doneCh := make(chan struct{})

	// Decrypt data
	for i, item := range rows {
		go func(i int, item *models.Keychain) {
			var data map[string]interface{}
			item.DecryptData(&data)

			res[i] = &GetAllResult{item, data}
			doneCh <- struct{}{}
		}(i, item)
	}

	for range rows {
		<-doneCh
	}

	return c.JSON(fiber.Map{"rows": res})
}

func create(c *fiber.Ctx) error {
	var body CreateKeychainSchema
	if err := c.BodyParser(&body); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	repo := NewRepository()

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

func update(c *fiber.Ctx) error {
	var body CreateKeychainSchema
	if err := c.BodyParser(&body); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	repo := NewRepository()
	id := c.Params("id")

	exist, _ := repo.Exists(id)
	if !exist {
		return utils.ResponseError(c, fmt.Errorf("key %s not found", id), 404)
	}

	item := &models.Keychain{
		Type:  body.Type,
		Label: body.Label,
	}

	if err := item.EncryptData(body.Data); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	if err := repo.Update(id, item); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(item)
}
