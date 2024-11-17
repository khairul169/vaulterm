package hosts

import (
	"gorm.io/gorm"
	"rul.sh/vaulterm/server/db"
	"rul.sh/vaulterm/server/lib"
	"rul.sh/vaulterm/server/models"
)

type Hosts struct {
	db   *gorm.DB
	User *lib.UserContext
}

func NewRepository(r *Hosts) *Hosts {
	if r == nil {
		r = &Hosts{}
	}
	r.db = db.Get()
	return r
}

func (r *Hosts) GetAll(opt GetAllOpt) ([]*models.Host, error) {
	query := r.db.
		Preload("Tags").
		Order("id DESC")

	if len(opt.ID) > 0 {
		query = query.Where("hosts.id IN (?)", opt.ID)
	}

	if opt.TeamID != "" {
		query = query.Where("hosts.team_id = ?", opt.TeamID)
	} else {
		query = query.Where("hosts.owner_id = ? AND hosts.team_id IS NULL", r.User.ID)
	}

	if opt.ParentID != nil && *opt.ParentID != "none" {
		if *opt.ParentID != "" {
			query = query.Where("hosts.parent_id = ?", *opt.ParentID)
		} else {
			query = query.Where("hosts.parent_id IS NULL")
		}
	}

	var rows []*models.Host
	ret := query.Find(&rows)

	return rows, ret.Error
}

func (r *Hosts) Get(id string) (*models.Host, error) {
	var host models.Host
	ret := r.db.Where("hosts.id = ?", id).First(&host)
	return &host, ret.Error
}

func (r *Hosts) GetWithKeys(id string) (*models.HostDecrypted, error) {
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

func (r *Hosts) SetParentId(id *string, hostIds []string) error {
	return r.db.Model(&models.Host{}).Where("id IN (?)", hostIds).Update("parent_id", id).Error
}

func (r *Hosts) GetAvailableTags(teamId string) (*[]models.HostTag, error) {
	query := r.db.Model(&models.HostTag{}).
		Joins("JOIN hosts ON hosts.id = host_tags.host_id").
		Distinct("host_tags.name")

	if teamId != "" {
		query = query.Where("hosts.team_id = ?", teamId)
	} else {
		query = query.Where("hosts.owner_id = ? AND hosts.team_id IS NULL", r.User.ID)
	}

	var result []models.HostTag
	return &result, query.Find(&result).Error
}
