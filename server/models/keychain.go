package models

import (
	"encoding/json"

	"rul.sh/vaulterm/lib"
)

const (
	KeychainTypeUserPass    = "user"
	KeychainTypePVE         = "pve"
	KeychainTypeRSA         = "rsa"
	KeychainTypeCertificate = "cert"
)

type Keychain struct {
	Model

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

	enc, err := lib.Encrypt(string(jsonData))
	if err == nil {
		k.Data = enc
	}
	return err
}

func (k *Keychain) DecryptData(data interface{}) error {
	// Decrypt stored data
	dec, err := lib.Decrypt(k.Data)
	if err != nil {
		return err
	}

	err = json.Unmarshal([]byte(dec), &data)
	if err != nil {
		return err
	}

	return nil
}
