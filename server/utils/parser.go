package utils

import "encoding/json"

func ParseMapInterface(data interface{}, out interface{}) error {
	// Marshal the map to JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	// Unmarshal the JSON data into the struct
	err = json.Unmarshal(jsonData, &out)
	return err
}
