package db

import (
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
