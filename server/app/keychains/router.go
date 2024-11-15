package keychains

import (
	"errors"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"rul.sh/vaulterm/server/models"
	"rul.sh/vaulterm/server/utils"
)

func Router(app fiber.Router) {
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
	teamId := c.Query("teamId")
	withData := c.Query("withData")

	user := utils.GetUser(c)
	repo := NewRepository(&Keychains{User: user})

	if teamId != "" && !user.IsInTeam(&teamId) {
		return utils.ResponseError(c, errors.New("no access"), 403)
	}

	rows, err := repo.GetAll(GetAllOpt{TeamID: teamId})
	if err != nil {
		return utils.ResponseError(c, err, 500)
	}

	if withData != "true" || (teamId != "" && !user.TeamCanWrite(&teamId)) {
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

	user := utils.GetUser(c)
	repo := NewRepository(&Keychains{User: user})

	if body.TeamID != nil && !user.TeamCanWrite(body.TeamID) {
		return utils.ResponseError(c, errors.New("no access"), 403)
	}

	item := &models.Keychain{
		OwnerID: &user.ID,
		TeamID:  body.TeamID,
		Type:    body.Type,
		Label:   body.Label,
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

	user := utils.GetUser(c)
	repo := NewRepository(&Keychains{User: user})

	id := c.Params("id")
	data, _ := repo.Get(id)
	if data == nil {
		return utils.ResponseError(c, errors.New("key not found"), 404)
	}
	if !data.CanWrite(&user.User) || !user.TeamCanWrite(body.TeamID) {
		return utils.ResponseError(c, errors.New("no access"), 403)
	}

	item := &models.Keychain{
		TeamID: body.TeamID,
		Type:   body.Type,
		Label:  body.Label,
	}

	if err := item.EncryptData(body.Data); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	if err := repo.Update(id, item); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(item)
}
