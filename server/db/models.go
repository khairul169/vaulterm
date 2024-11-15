package db

import (
	"rul.sh/vaulterm/server/models"
)

var Models = []interface{}{
	&models.User{},
	&models.UserSession{},
	&models.Keychain{},
	&models.Host{},
	&models.Team{},
	&models.TeamMembers{},
	&models.TermSession{},
}
