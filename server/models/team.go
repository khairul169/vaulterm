package models

import "time"

const (
	TeamRoleOwner  = "owner"
	TeamRoleAdmin  = "admin"
	TeamRoleMember = "member"
)

type Team struct {
	Model

	Name    string         `json:"name" gorm:"type:varchar(32)"`
	Icon    string         `json:"icon" gorm:"type:varchar(2)"`
	Members []*TeamMembers `json:"members" gorm:"foreignKey:TeamID"`

	Timestamps
	SoftDeletes
}

type TeamMembers struct {
	TeamID    string    `json:"teamId" gorm:"primarykey;type:varchar(26)"`
	Team      Team      `json:"-"`
	UserID    string    `json:"userId" gorm:"primarykey;type:varchar(26)"`
	User      User      `json:"user"`
	Role      string    `json:"role" gorm:"type:varchar(16)"`
	CreatedAt time.Time `json:"createdAt"`
}
