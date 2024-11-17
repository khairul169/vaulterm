package db

import (
	"rul.sh/vaulterm/server/models"
)

var Models = []interface{}{
	&models.User{},
	&models.UserSession{},
	&models.UserAccount{},
	&models.Keychain{},
	&models.Host{},
	&models.HostTag{},
	&models.Team{},
	&models.TeamMembers{},
	&models.TermSession{},
}
