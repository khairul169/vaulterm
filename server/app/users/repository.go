package users

import (
	"gorm.io/gorm"
	"rul.sh/vaulterm/db"
	"rul.sh/vaulterm/models"
	"rul.sh/vaulterm/utils"
)

type Users struct {
	db   *gorm.DB
	User *utils.UserContext
}

func NewRepository(r *Users) *Users {
	if r == nil {
		r = &Users{}
	}
	r.db = db.Get()
	return r
}

func (r *Users) Find(username string) (*models.User, error) {
	var user models.User
	ret := r.db.Where("username = ? OR email = ?", username, username).First(&user)

	return &user, ret.Error
}