package members

import (
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"rul.sh/vaulterm/server/db"
	"rul.sh/vaulterm/server/models"
	"rul.sh/vaulterm/server/utils"
)

type TeamMembers struct {
	db   *gorm.DB
	User *utils.UserContext
}

func NewRepository(r *TeamMembers) *TeamMembers {
	if r == nil {
		r = &TeamMembers{}
	}
	r.db = db.Get()
	return r
}

func (r *TeamMembers) Add(data *models.TeamMembers) error {
	ret := r.db.Clauses(clause.OnConflict{DoNothing: true}).Create(data)
	return ret.Error
}

func (r *TeamMembers) SetRole(data *models.TeamMembers) error {
	ret := r.db.
		Where("team_id = ? AND user_id = ?", data.TeamID, data.UserID).
		Updates(&models.TeamMembers{Role: data.Role})
	return ret.Error
}

func (r *TeamMembers) Remove(data *models.TeamMembers) error {
	ret := r.db.Delete(&models.TeamMembers{TeamID: data.TeamID, UserID: data.UserID})
	return ret.Error
}
