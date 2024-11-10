package keychains

import (
	"gorm.io/gorm"
	"rul.sh/vaulterm/db"
	"rul.sh/vaulterm/models"
	"rul.sh/vaulterm/utils"
)

type Keychains struct {
	db   *gorm.DB
	User *utils.UserContext
}

func NewRepository(r *Keychains) *Keychains {
	if r == nil {
		r = &Keychains{}
	}
	r.db = db.Get()
	return r
}

func (r *Keychains) GetAll() ([]*models.Keychain, error) {
	var rows []*models.Keychain
	query := r.ACL(r.db.Order("created_at DESC"))

	ret := query.Find(&rows)
	return rows, ret.Error
}

func (r *Keychains) Create(item *models.Keychain) error {
	return r.db.Create(item).Error
}

func (r *Keychains) Get(id string) (*models.Keychain, error) {
	var keychain models.Keychain
	query := r.ACL(r.db.Where("id = ?", id))

	if err := query.First(&keychain).Error; err != nil {
		return nil, err
	}

	return &keychain, nil
}

func (r *Keychains) Exists(id string) (bool, error) {
	var count int64
	query := r.ACL(r.db.Model(&models.Keychain{}).Where("id = ?", id))
	ret := query.Count(&count)
	return count > 0, ret.Error
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

func (r *Keychains) Update(id string, item *models.Keychain) error {
	query := r.ACL(r.db.Where("id = ?", id))
	return query.Updates(item).Error
}

func (r *Keychains) ACL(query *gorm.DB) *gorm.DB {
	if r.User.IsAdmin {
		return query
	}

	return query.Where("keychains.owner_id = ?", r.User.ID)
}
