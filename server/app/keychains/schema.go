package keychains

type CreateKeychainSchema struct {
	Type  string      `json:"type"`
	Label string      `json:"label"`
	Data  interface{} `json:"data"`
}
