package models

import "time"

type TermSession struct {
	Model

	UserID string `json:"userId" gorm:"type:varchar(26)"`
	User   User   `json:"user" gorm:"foreignKey:UserID"`
	HostID string `json:"hostId" gorm:"type:varchar(26)"`
	Host   Host   `json:"host" gorm:"foreignKey:HostID"`

	Reason string `json:"reason" gorm:"type:varchar(255)"`
	Log    string `json:"log" gorm:"type:text"`

	EndsAt *time.Time `json:"endsAt"`

	Timestamps
}
