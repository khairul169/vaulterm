package models

import (
	"encoding/json"

	"rul.sh/vaulterm/server/utils"
)

const (
	KeychainTypeUserPass    = "user"
	KeychainTypePVE         = "pve"
	KeychainTypeRSA         = "rsa"
	KeychainTypeCertificate = "cert"
)

type Keychain struct {
	Model

	OwnerID *string `json:"userId" gorm:"type:varchar(26)"`
	Owner   *User   `json:"user" gorm:"foreignKey:OwnerID"`
	TeamID  *string `json:"teamId" gorm:"type:varchar(26)"`
	Team    *Team   `json:"team" gorm:"foreignKey:TeamID"`

	Label string `json:"label"`
	Type  string `json:"type" gorm:"not null;index:keychains_type_idx;type:varchar(12)"`
	Data  string `json:"-" gorm:"type:text"`

	Timestamps
	SoftDeletes
}

func (k *Keychain) EncryptData(data interface{}) error {
	// Encrypt data
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	enc, err := utils.Encrypt(string(jsonData))
	if err == nil {
		k.Data = enc
	}
	return err
}

func (k *Keychain) DecryptData(data interface{}) error {
	// Decrypt stored data
	dec, err := utils.Decrypt(k.Data)
	if err != nil {
		return err
	}

	err = json.Unmarshal([]byte(dec), &data)
	if err != nil {
		return err
	}

	return nil
}

func (k *Keychain) HasAccess(user *User) bool {
	if user.IsAdmin() {
		return true
	}
	return *k.OwnerID == user.ID || user.IsInTeam(k.TeamID)
}

func (k *Keychain) CanWrite(user *User) bool {
	if user.IsAdmin() {
		return true
	}
	teamRole := user.GetTeamRole(k.TeamID)
	return *k.OwnerID == user.ID || teamRole == TeamRoleOwner || teamRole == TeamRoleAdmin
}
