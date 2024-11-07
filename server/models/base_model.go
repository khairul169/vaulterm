package models

import (
	"strings"
	"time"

	"github.com/oklog/ulid/v2"
	"gorm.io/gorm"
)

type BaseModel struct {
	ID string `gorm:"primarykey;type:varchar(26)" json:"id"`
}

func (m *BaseModel) BeforeCreate(tx *gorm.DB) error {
	m.ID = m.GenerateID()
	return nil
}

func (m *BaseModel) GenerateID() string {
	return strings.ToLower(ulid.Make().String())
}

type Timestamps struct {
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type SoftDeletes struct {
	DeletedAt gorm.DeletedAt `gorm:"index" json:"deletedAt"`
}
