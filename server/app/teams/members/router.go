package members

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"rul.sh/vaulterm/server/app/teams"
	"rul.sh/vaulterm/server/app/users"
	"rul.sh/vaulterm/server/lib"
	"rul.sh/vaulterm/server/models"
	"rul.sh/vaulterm/server/utils"
)

func Router(app fiber.Router) {
	router := app.Group("/:id/members")

	// router.Get("/", getAll)
	router.Post("/", invite)
	router.Put("/:userId/role", setRole)
	router.Delete("/:userId", remove)
}

// func getAll(c *fiber.Ctx) error {
// 	user := lib.GetUser(c)
// 	repo := NewRepository(&TeamMembers{User: user})

// 	rows, err := repo.GetAll()
// 	if err != nil {
// 		return utils.ResponseError(c, err, 500)
// 	}

// 	return c.JSON(fiber.Map{"rows": rows})
// }

func invite(c *fiber.Ctx) error {
	var body InviteSchema
	if err := c.BodyParser(&body); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	user := lib.GetUser(c)
	teamRepo := teams.NewRepository(&teams.Teams{User: user})
	repo := NewRepository(&TeamMembers{User: user})

	id := c.Params("id")
	exist, _ := teamRepo.Exists(id)
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

	err := repo.Add(&models.TeamMembers{TeamID: id, UserID: userData.ID, Role: body.Role})
	if err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(true)
}

func setRole(c *fiber.Ctx) error {
	var body PutRoleSchema
	if err := c.BodyParser(&body); err != nil {
		return utils.ResponseError(c, err, 500)
	}

	user := lib.GetUser(c)
	teamRepo := teams.NewRepository(&teams.Teams{User: user})
	repo := NewRepository(&TeamMembers{User: user})

	id := c.Params("id")
	userId := c.Params("userId")

	exist, _ := teamRepo.Exists(id)
	if !exist {
		return utils.ResponseError(c, errors.New("team not found"), 404)
	}
	if !user.TeamCanWrite(&id) {
		return utils.ResponseError(c, errors.New("no access"), 403)
	}

	userRepo := users.NewRepository(nil)
	userData, _ := userRepo.Get(userId)
	if userData == nil || userData.ID == "" {
		return utils.ResponseError(c, errors.New("user not found"), 404)
	}
	if !userData.IsInTeam(&id) {
		return utils.ResponseError(c, errors.New("user not in team"), 400)
	}

	err := repo.SetRole(&models.TeamMembers{TeamID: id, UserID: userData.ID, Role: body.Role})
	if err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(true)
}

func remove(c *fiber.Ctx) error {
	user := lib.GetUser(c)
	teamRepo := teams.NewRepository(&teams.Teams{User: user})
	repo := NewRepository(&TeamMembers{User: user})

	id := c.Params("id")
	userId := c.Params("userId")

	exist, _ := teamRepo.Exists(id)
	if !exist {
		return utils.ResponseError(c, errors.New("team not found"), 404)
	}
	if !user.TeamCanWrite(&id) {
		return utils.ResponseError(c, errors.New("no access"), 403)
	}

	userRepo := users.NewRepository(&users.Users{User: user})
	userData, _ := userRepo.Get(userId)
	if userData.ID == "" {
		return utils.ResponseError(c, errors.New("user not found"), 404)
	}
	userRole := userData.GetTeamRole(&id)
	if userRole == "" {
		return utils.ResponseError(c, errors.New("user not in team"), 400)
	}
	if userRole == models.TeamRoleOwner {
		return utils.ResponseError(c, errors.New("cannot remove owner"), 400)
	}

	err := repo.Remove(&models.TeamMembers{TeamID: id, UserID: userData.ID})
	if err != nil {
		return utils.ResponseError(c, err, 500)
	}

	return c.JSON(true)
}
