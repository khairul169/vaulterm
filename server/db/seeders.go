package db

import (
	"gorm.io/gorm"
	"rul.sh/vaulterm/lib"
	"rul.sh/vaulterm/models"
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

	testPasswd, err := lib.HashPassword("123456")
	if err != nil {
		return err
	}

	userList := []models.User{
		{
			Name:     "Admin",
			Username: "admin",
			Password: testPasswd,
			Email:    "admin@mail.com",
			Role:     models.UserRoleAdmin,
		},
		{
			Name:     "John Doe",
			Username: "user",
			Password: testPasswd,
			Email:    "user@mail.com",
		},
	}

	if res := tx.Create(&userList); res.Error != nil {
		return res.Error
	}

	return nil
}

func runSeeders(db *gorm.DB) {
	db.Transaction(func(tx *gorm.DB) error {
		for _, seed := range seeders {
			if err := seed(db); err != nil {
				return err
			}
		}
		return nil
	})
}
