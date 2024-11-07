package auth

import (
	"gorm.io/gorm"
	"rul.sh/vaulterm/db"
	"rul.sh/vaulterm/lib"
	"rul.sh/vaulterm/models"
)

type Auth struct{ db *gorm.DB }

func NewAuthRepository() *Auth {
	return &Auth{db: db.Get()}
}

func (r *Auth) FindUser(username string) (*models.User, error) {
	var user models.User
	ret := r.db.Where("username = ? OR email = ?", username, username).First(&user)

	return &user, ret.Error
}

func (r *Auth) CreateUserSession(user *models.User) (string, error) {
	sessionId, err := lib.GenerateSessionID(20)
	if err != nil {
		return "", err
	}

	if ret := r.db.Create(&models.UserSession{ID: sessionId, UserID: user.ID}); ret.Error != nil {
		return "", ret.Error
	}

	return sessionId, nil
}

func (r *Auth) GetSession(sessionId string) (*models.UserSession, error) {
	var session models.UserSession
	res := r.db.Joins("User").Where(&models.UserSession{ID: sessionId}).First(&session)
	return &session, res.Error
}

func (r *Auth) RemoveUserSession(sessionId string, force bool) error {
	db := r.db
	if force {
		db = db.Unscoped()
	}

	res := db.Delete(&models.UserSession{ID: sessionId})
	return res.Error
}
