package models

import "time"

type Team struct {
	Model

	Name    string  `json:"name" gorm:"type:varchar(32)"`
	Icon    string  `json:"icon" gorm:"type:varchar(2)"`
	Members []*User `json:"members" gorm:"many2many:team_members"`

	Timestamps
	SoftDeletes
}

type TeamMembers struct {
	TeamID    string    `json:"teamId" gorm:"primarykey;type:varchar(26)"`
	Team      Team      `json:"team"`
	UserID    string    `json:"userId" gorm:"primarykey;type:varchar(26)"`
	User      User      `json:"user"`
	Role      string    `json:"role" gorm:"type:varchar(16)"`
	CreatedAt time.Time `json:"createdAt"`
}
