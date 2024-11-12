package models

const (
	UserRoleUser  = "user"
	UserRoleAdmin = "admin"
)

type User struct {
	Model

	Name     string `json:"name"`
	Username string `json:"username" gorm:"unique"`
	Password string `json:"-"`
	Email    string `json:"email" gorm:"unique"`
	Role     string `json:"role" gorm:"default:user;not null;index:users_role_idx;type:varchar(8)"`

	Teams []*Team `json:"teams" gorm:"many2many:team_members"`

	Timestamps
	SoftDeletes
}

type UserSession struct {
	ID     string `json:"id" gorm:"primarykey;type:varchar(40)"`
	UserID string `json:"userId" gorm:"type:varchar(26)"`
	User   User   `json:"user"`

	Timestamps
	SoftDeletes
}
