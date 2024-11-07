package keychains

import (
	"gorm.io/gorm"
	"rul.sh/vaulterm/db"
	"rul.sh/vaulterm/models"
)

type Keychains struct{ db *gorm.DB }

func NewKeychainsRepository() *Keychains {
	return &Keychains{db: db.Get()}
}

func (r *Keychains) GetAll() ([]*models.Keychain, error) {
	var rows []*models.Keychain
	ret := r.db.Order("created_at DESC").Find(&rows)

	return rows, ret.Error
}

func (r *Keychains) Create(item *models.Keychain) error {
	return r.db.Create(item).Error
}
