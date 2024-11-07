package hosts

import "gorm.io/datatypes"

type CreateHostSchema struct {
	Type     string            `json:"type"`
	Label    string            `json:"label"`
	Host     string            `json:"host"`
	Port     int               `json:"port"`
	Metadata datatypes.JSONMap `json:"metadata"`

	ParentID *string `json:"parentId"`
	KeyID    *string `json:"keyId"`
	AltKeyID *string `json:"altKeyId"`
}
