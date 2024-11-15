package hosts

import (
	"gorm.io/gorm"
	"rul.sh/vaulterm/server/db"
	"rul.sh/vaulterm/server/models"
	"rul.sh/vaulterm/server/utils"
)

type Hosts struct {
	db   *gorm.DB
	User *utils.UserContext
}

func NewRepository(r *Hosts) *Hosts {
	if r == nil {
		r = &Hosts{}
	}
	r.db = db.Get()
	return r
}

func (r *Hosts) GetAll(opt GetAllOpt) ([]*models.Host, error) {
	query := r.db.Order("id DESC")

	if opt.TeamID != "" {
		query = query.Where("hosts.team_id = ?", opt.TeamID)
	} else {
		query = query.Where("hosts.owner_id = ? AND hosts.team_id IS NULL", r.User.ID)
	}

	var rows []*models.Host
	ret := query.Find(&rows)

	return rows, ret.Error
}

func (r *Hosts) Get(id string) (*models.HostDecrypted, error) {
	var host models.Host
	ret := r.db.Joins("Key").Joins("AltKey").Where("hosts.id = ?", id).First(&host)
	if ret.Error != nil {
		return nil, ret.Error
	}

	res, err := host.DecryptKeys()
	if err != nil {
		return nil, err
	}

	return res, ret.Error
}

func (r *Hosts) Exists(id string) (bool, error) {
	var count int64
	ret := r.db.Model(&models.Host{}).Where("id = ?", id).Count(&count)
	return count > 0, ret.Error
}

func (r *Hosts) Create(item *models.Host) error {
	return r.db.Create(item).Error
}

func (r *Hosts) Update(id string, item *models.Host) error {
	return r.db.Where("id = ?", id).Updates(item).Error
}

func (r *Hosts) Delete(id string) error {
	return r.db.Delete(&models.Host{Model: models.Model{ID: id}}).Error
}
