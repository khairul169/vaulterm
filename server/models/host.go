package models

import "gorm.io/datatypes"

const (
	HostTypeSSH       = "ssh"
	HostTypePVE       = "pve"
	HostTypePVENode   = "pve_node"
	HostTypePVEHost   = "pve_host"
	HostTypeIncus     = "incus"
	HostTypeIncusHost = "incus_host"
)

type Host struct {
	Model

	Type     string            `json:"type" gorm:"not null;index:hosts_type_idx;type:varchar(16)"`
	Label    string            `json:"label"`
	Host     string            `json:"host" gorm:"type:varchar(64)"`
	Port     int               `json:"port" gorm:"type:smallint"`
	OS       string            `json:"os" gorm:"type:varchar(32)"`
	Metadata datatypes.JSONMap `json:"metadata"`

	ParentID *string  `json:"parentId" gorm:"index:hosts_parent_id_idx;type:varchar(26)"`
	Parent   *Host    `json:"parent" gorm:"foreignKey:ParentID"`
	KeyID    *string  `json:"keyId" gorm:"index:hosts_key_id_idx"`
	Key      Keychain `json:"key" gorm:"foreignKey:KeyID"`
	AltKeyID *string  `json:"altKeyId" gorm:"index:hosts_altkey_id_idx"`
	AltKey   Keychain `json:"altKey" gorm:"foreignKey:AltKeyID"`

	Timestamps
	SoftDeletes
}

type HostDecrypted struct {
	Host
	Key    map[string]interface{}
	AltKey map[string]interface{}
}

func (h *Host) DecryptKeys() (*HostDecrypted, error) {
	res := &HostDecrypted{Host: *h}

	if h.Key.Data != "" {
		if err := h.Key.DecryptData(&res.Key); err != nil {
			return nil, err
		}
	}
	if h.AltKey.Data != "" {
		if err := h.AltKey.DecryptData(&res.AltKey); err != nil {
			return nil, err
		}
	}

	return res, nil
}
