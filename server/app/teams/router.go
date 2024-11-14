package teams

import (
	"errors"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"rul.sh/vaulterm/app/users"
	"rul.sh/vaulterm/models"
	"rul.sh/vaulterm/utils"
)

func Router(app fiber.Router) {
	router := app.Group("/teams")

	router.Get("/", getAll)
	router.Get("/:id", getById)
	router.Post("/", create)
	router.Put("/:id", update)
	router.Delete("/:id", delete)
	router.Post("/:id/invite", invite)
}

func getAll(c *fiber.Ctx) error {
	user := utils.GetUser(c)
	repo := NewRepository(&Teams{User: user})

	rows, err := repo.GetAll()
	if err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(fiber.Map{"rows": rows})
}

func getById(c *fiber.Ctx) error {
	user := utils.GetUser(c)
	repo := NewRepository(&Teams{User: user})

	id := c.Params("id")
	data, _ := repo.Get(GetOptions{ID: id, WithMembers: true})
	if data == nil || !user.IsInTeam(&id) {
		return utils.ResponseError(c, errors.New("team not found"), 404)
	}

	return c.JSON(data)
}

func create(c *fiber.Ctx) error {
	var body CreateTeamSchema
	if err := c.BodyParser(&body); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	user := utils.GetUser(c)
	repo := NewRepository(&Teams{User: user})

	item := &models.Team{
		Name: body.Name,
		Icon: body.Icon,
	}

	if err := repo.Create(item); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.Status(http.StatusCreated).JSON(item)
}

func update(c *fiber.Ctx) error {
	var body CreateTeamSchema
	if err := c.BodyParser(&body); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	user := utils.GetUser(c)
	repo := NewRepository(&Teams{User: user})

	id := c.Params("id")
	data, _ := repo.Get(GetOptions{ID: id})
	if data == nil {
		return utils.ResponseError(c, errors.New("team not found"), 404)
	}
	if !user.TeamCanWrite(&id) {
		return utils.ResponseError(c, errors.New("no access"), 403)
	}

	item := &models.Team{
		Name: body.Name,
		Icon: body.Icon,
	}

	if err := repo.Update(id, item); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(item)
}

func delete(c *fiber.Ctx) error {
	user := utils.GetUser(c)
	repo := NewRepository(&Teams{User: user})

	id := c.Params("id")
	data, _ := repo.Get(GetOptions{ID: id})
	if data == nil {
		return utils.ResponseError(c, errors.New("team not found"), 404)
	}
	if !user.TeamCanWrite(&id) {
		return utils.ResponseError(c, errors.New("no access"), 403)
	}

	if err := repo.Delete(id); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(true)
}

func invite(c *fiber.Ctx) error {
	var body InviteTeamSchema
	if err := c.BodyParser(&body); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	user := utils.GetUser(c)
	repo := NewRepository(&Teams{User: user})

	id := c.Params("id")
	exist, _ := repo.Exists(id)
	if !exist {
		return utils.ResponseError(c, errors.New("team not found"), 404)
	}
	if !user.TeamCanWrite(&id) {
		return utils.ResponseError(c, errors.New("no access"), 403)
	}

	userRepo := users.NewRepository(&users.Users{User: user})
	userData, _ := userRepo.Find(body.Username)
	if userData.ID == "" {
		return utils.ResponseError(c, errors.New("user not found"), 404)
	}

	if err := repo.Invite(id, userData.ID, body.Role); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(true)
}
