package users

import (
	"gorm.io/gorm"
	"rul.sh/vaulterm/server/db"
	"rul.sh/vaulterm/server/models"
	"rul.sh/vaulterm/server/utils"
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

func (r *Users) Get(id string) (*models.User, error) {
	var user models.User
	ret := r.db.Preload("Teams").Where("id = ?", id).First(&user)

	return &user, ret.Error
}
