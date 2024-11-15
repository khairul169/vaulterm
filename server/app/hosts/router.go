package hosts

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"rul.sh/vaulterm/server/models"
	"rul.sh/vaulterm/server/utils"
)

func Router(app fiber.Router) {
	router := app.Group("/hosts")

	router.Get("/", getAll)
	router.Post("/", create)
	router.Put("/:id", update)
	router.Delete("/:id", delete)
}

func getAll(c *fiber.Ctx) error {
	teamId := c.Query("teamId")
	user := utils.GetUser(c)
	repo := NewRepository(&Hosts{User: user})

	if teamId != "" && !user.IsInTeam(&teamId) {
		return utils.ResponseError(c, errors.New("no access"), 403)
	}

	rows, err := repo.GetAll(GetAllOpt{TeamID: teamId})
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

	user := utils.GetUser(c)
	repo := NewRepository(&Hosts{User: user})

	if body.TeamID != nil && !user.TeamCanWrite(body.TeamID) {
		return utils.ResponseError(c, errors.New("no access"), 403)
	}

	item := &models.Host{
		OwnerID:  &user.ID,
		TeamID:   body.TeamID,
		Type:     body.Type,
		Label:    body.Label,
		Host:     body.Host,
		Port:     body.Port,
		Metadata: body.Metadata,
		ParentID: body.ParentID,
		KeyID:    body.KeyID,
		AltKeyID: body.AltKeyID,
	}

	osName, err := tryConnect(c, item)
	if err != nil {
		return utils.ResponseError(c, fmt.Errorf("cannot connect to the host: %s", err), 500)
	}
	item.OS = osName

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

	user := utils.GetUser(c)
	repo := NewRepository(&Hosts{User: user})

	id := c.Params("id")
	data, _ := repo.Get(id)
	if data == nil {
		return utils.ResponseError(c, errors.New("host not found"), 404)
	}
	if !data.CanWrite(&user.User) || !user.TeamCanWrite(body.TeamID) {
		return utils.ResponseError(c, errors.New("no access"), 403)
	}

	item := &models.Host{
		Model:    models.Model{ID: id},
		TeamID:   body.TeamID,
		Type:     body.Type,
		Label:    body.Label,
		Host:     body.Host,
		Port:     body.Port,
		Metadata: body.Metadata,
		ParentID: body.ParentID,
		KeyID:    body.KeyID,
		AltKeyID: body.AltKeyID,
	}

	osName, err := tryConnect(c, item)
	if err != nil {
		return utils.ResponseError(c, fmt.Errorf("cannot connect to the host: %s", err), 500)
	}
	item.OS = osName

	if err := repo.Update(id, item); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(item)
}

func delete(c *fiber.Ctx) error {
	user := utils.GetUser(c)
	repo := NewRepository(&Hosts{User: user})

	id := c.Params("id")
	host, _ := repo.Get(id)
	if host == nil {
		return utils.ResponseError(c, errors.New("host not found"), 404)
	}
	if !host.CanWrite(&user.User) {
		return utils.ResponseError(c, errors.New("no access"), 403)
	}

	if err := repo.Delete(id); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(fiber.Map{
		"status":  "ok",
		"message": "Successfully deleted",
	})
}
