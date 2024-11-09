package keychains

import (
	"gorm.io/gorm"
	"rul.sh/vaulterm/db"
	"rul.sh/vaulterm/models"
)

type Keychains struct{ db *gorm.DB }

func NewRepository() *Keychains {
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

func (r *Keychains) Get(id string) (*models.Keychain, error) {
	var keychain models.Keychain
	if err := r.db.Where("id = ?", id).First(&keychain).Error; err != nil {
		return nil, err
	}

	return &keychain, nil
}

type KeychainDecrypted struct {
	models.Keychain
	Data map[string]interface{}
}

func (r *Keychains) GetDecrypted(id string) (*KeychainDecrypted, error) {
	keychain, err := r.Get(id)
	if err != nil {
		return nil, err
	}

	var data map[string]interface{}
	if err := keychain.DecryptData(&data); err != nil {
		return nil, err
	}

	return &KeychainDecrypted{Keychain: *keychain, Data: data}, nil
}
