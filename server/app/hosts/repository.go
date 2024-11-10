package hosts

import (
	"gorm.io/gorm"
	"rul.sh/vaulterm/db"
	"rul.sh/vaulterm/models"
	"rul.sh/vaulterm/utils"
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

func (r *Hosts) GetAll() ([]*models.Host, error) {
	query := r.ACL(r.db.Order("id DESC"))

	var rows []*models.Host
	ret := query.Find(&rows)

	return rows, ret.Error
}

func (r *Hosts) Get(id string) (*models.HostDecrypted, error) {
	query := r.ACL(r.db)

	var host models.Host
	ret := query.Joins("Key").Joins("AltKey").Where("hosts.id = ?", id).First(&host)
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
	ret := r.ACL(r.db.Model(&models.Host{}).Where("id = ?", id)).Count(&count)
	return count > 0, ret.Error
}

func (r *Hosts) Delete(id string) error {
	query := r.ACL(r.db)
	return query.Delete(&models.Host{Model: models.Model{ID: id}}).Error
}

func (r *Hosts) Create(item *models.Host) error {
	return r.db.Create(item).Error
}

func (r *Hosts) Update(id string, item *models.Host) error {
	query := r.ACL(r.db.Where("id = ?", id))

	return query.Updates(item).Error
}

func (r *Hosts) ACL(query *gorm.DB) *gorm.DB {
	if r.User.IsAdmin {
		return query
	}

	return query.Where("hosts.owner_id = ?", r.User.ID)
}
