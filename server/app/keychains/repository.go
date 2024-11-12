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

func (r *Keychains) GetAll(opt GetAllOpt) ([]*models.Keychain, error) {
	query := r.db.Order("created_at DESC")

	if opt.TeamID != "" {
		query = query.Where("keychains.team_id = ?", opt.TeamID)
	} else {
		query = query.Where("keychains.owner_id = ? AND keychains.team_id IS NULL", r.User.ID)
	}

	var rows []*models.Keychain
	ret := query.Find(&rows)
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

func (r *Keychains) Exists(id string) (bool, error) {
	var count int64
	ret := r.db.Model(&models.Keychain{}).Where("id = ?", id).Count(&count)
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
	return r.db.Where("id = ?", id).Updates(item).Error
}
