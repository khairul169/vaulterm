package hosts

import (
	"gorm.io/gorm"
	"rul.sh/vaulterm/db"
	"rul.sh/vaulterm/models"
)

type Hosts struct{ db *gorm.DB }

func NewHostsRepository() *Hosts {
	return &Hosts{db: db.Get()}
}

func (r *Hosts) GetAll() ([]*models.Host, error) {
	var rows []*models.Host
	ret := r.db.Order("created_at DESC").Find(&rows)

	return rows, ret.Error
}

type GetHostResult struct {
	Host   *models.Host
	Key    map[string]interface{}
	AltKey map[string]interface{}
}

func (r *Hosts) Get(id string) (*GetHostResult, error) {
	var host models.Host
	ret := r.db.Joins("Key").Joins("AltKey").Where("hosts.id = ?", id).First(&host)

	if ret.Error != nil {
		return nil, ret.Error
	}

	res := &GetHostResult{Host: &host}

	if host.Key.Data != "" {
		if err := host.Key.DecryptData(&res.Key); err != nil {
			return nil, err
		}
	}
	if host.AltKey.Data != "" {
		if err := host.AltKey.DecryptData(&res.AltKey); err != nil {
			return nil, err
		}
	}

	return res, ret.Error
}

func (r *Hosts) Create(item *models.Host) error {
	return r.db.Create(item).Error
}
