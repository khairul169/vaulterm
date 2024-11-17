package db

import (
	"gorm.io/gorm"
	"rul.sh/vaulterm/server/models"
	"rul.sh/vaulterm/server/utils"
)

type SeedFn func(*gorm.DB) error

var seeders = []SeedFn{
	seedUsers,
}

func seedUsers(tx *gorm.DB) error {
	var userCount int64
	if res := tx.Model(&models.User{}).Count(&userCount); res.Error != nil {
		return res.Error
	}

	// skip seeder if users already exist
	if userCount > 0 {
		return nil
	}

	testPasswd, err := utils.HashPassword("123456")
	if err != nil {
		return err
	}

	teams := []*models.Team{
		{
			Name: "My Team",
			Icon: "☘️",
		},
	}

	if res := tx.Create(&teams); res.Error != nil {
		return res.Error
	}

	userList := []*models.User{
		{
			Name:     "Admin",
			Username: utils.StringPtr("admin"),
			Password: testPasswd,
			Email:    utils.StringPtr("admin@mail.com"),
			Role:     models.UserRoleAdmin,
		},
		// {
		// 	Name:     "John Doe",
		// 	Username: "user",
		// 	Password: testPasswd,
		// 	Email:    "user@mail.com",
		// },
		// {
		// 	Name:     "Mary Doe",
		// 	Username: "user2",
		// 	Password: testPasswd,
		// 	Email:    "user2@mail.com",
		// },
	}

	if res := tx.Create(&userList); res.Error != nil {
		return res.Error
	}

	// teamMembers := []models.TeamMembers{
	// 	{TeamID: teams[0].ID, UserID: userList[0].ID, Role: models.TeamRoleOwner},
	// 	{TeamID: teams[0].ID, UserID: userList[1].ID, Role: models.TeamRoleAdmin},
	// 	{TeamID: teams[0].ID, UserID: userList[2].ID, Role: models.TeamRoleMember},
	// }

	// if res := tx.Create(&teamMembers); res.Error != nil {
	// 	return res.Error
	// }

	return nil
}

func runSeeders(db *gorm.DB) {
	db.Transaction(func(tx *gorm.DB) error {
		for _, seed := range seeders {
			if err := seed(tx); err != nil {
				return err
			}
		}

		return nil
	})
}
