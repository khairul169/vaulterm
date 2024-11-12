package keychains

type CreateKeychainSchema struct {
	TeamID *string     `json:"teamId"`
	Type   string      `json:"type"`
	Label  string      `json:"label"`
	Data   interface{} `json:"data"`
}

type GetAllOpt struct {
	TeamID string
}
