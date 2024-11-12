package db

import (
	"log"

	"gorm.io/gorm"
	"rul.sh/vaulterm/models"
)

var Models = []interface{}{
	&models.User{},
	&models.UserSession{},
	&models.Keychain{},
	&models.Host{},
	&models.Team{},
	&models.TeamMembers{},
}

func InitModels(db *gorm.DB) {
	if err := db.SetupJoinTable(&models.Team{}, "Members", &models.TeamMembers{}); err != nil {
		log.Fatal(err)
	}
}
