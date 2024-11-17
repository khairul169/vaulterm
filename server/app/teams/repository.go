package teams

import (
	"gorm.io/gorm"
	"rul.sh/vaulterm/server/db"
	"rul.sh/vaulterm/server/lib"
	"rul.sh/vaulterm/server/models"
)

type Teams struct {
	db   *gorm.DB
	User *lib.UserContext
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
	query := r.db.Order("created_at ASC")

	if !r.User.IsAdmin() {
		query = query.
			Joins("JOIN team_members ON team_members.team_id = teams.id").
			Where("team_members.user_id = ?", r.User.ID)
	}

	ret := query.Find(&rows)
	return rows, ret.Error
}

func (r *Teams) Create(data *models.Team) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(data).Error; err != nil {
			return err
		}

		if r.User.ID != "" {
			ret := tx.Create(&models.TeamMembers{
				UserID: r.User.ID,
				TeamID: data.ID,
				Role:   models.TeamRoleOwner,
			})
			if ret.Error != nil {
				return ret.Error
			}
		}

		return nil
	})
}

func (r *Teams) Get(opt GetOptions) (*models.Team, error) {
	query := r.db.Where("teams.id = ?", opt.ID)

	if opt.WithMembers {
		query = query.Preload("Members.User", func(db *gorm.DB) *gorm.DB {
			return db.Select("users.id", "users.name", "users.username", "users.email")
		})
	}

	var data models.Team
	if err := query.First(&data).Error; err != nil {
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

func (r *Teams) Delete(id string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("team_id = ?", id).Delete(&models.TeamMembers{}).Error; err != nil {
			return err
		}
		if err := tx.Where("id = ?", id).Delete(&models.Team{}).Error; err != nil {
			return err
		}
		return nil
	})
}
