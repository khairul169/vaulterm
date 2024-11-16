package hosts

import "gorm.io/datatypes"

type CreateHostSchema struct {
	Type     string            `json:"type"`
	Label    string            `json:"label"`
	Host     string            `json:"host"`
	Port     int               `json:"port"`
	Metadata datatypes.JSONMap `json:"metadata"`

	TeamID   *string `json:"teamId"`
	ParentID *string `json:"parentId"`
	KeyID    *string `json:"keyId"`
	AltKeyID *string `json:"altKeyId"`
}

type GetAllOpt struct {
	TeamID   string
	ParentID *string
	ID       []string
}

type MoveHostSchema struct {
	TeamID   string `json:"teamId"`
	ParentID string `json:"parentId"`
	HostID   string `json:"hostId"`
}
