package teams

import (
	"gorm.io/gorm"
	"rul.sh/vaulterm/db"
	"rul.sh/vaulterm/models"
	"rul.sh/vaulterm/utils"
)

type Teams struct {
	db   *gorm.DB
	User *utils.UserContext
}

func NewRepository(r *Teams) *Teams {
	if r == nil {
		r = &Teams{}
	}
	r.db = db.Get()
	return r
}

func (r *Teams) GetAll() ([]*models.Team, error) {
	var rows []*models.Team
	ret := r.db.Order("created_at DESC").Find(&rows)
	return rows, ret.Error
}

func (r *Teams) Create(data *models.Team) error {
	return r.db.Create(data).Error
}

func (r *Teams) Get(id string) (*models.Team, error) {
	var data models.Team
	if err := r.db.Where("id = ?", id).First(&data).Error; err != nil {
		return nil, err
	}

	return &data, nil
}

func (r *Teams) Exists(id string) (bool, error) {
	var count int64
	ret := r.db.Model(&models.Team{}).Where("id = ?", id).Count(&count)
	return count > 0, ret.Error
}

func (r *Teams) Update(id string, item *models.Team) error {
	return r.db.Where("id = ?", id).Updates(item).Error
}
