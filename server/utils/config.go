package utils

import (
	"fmt"
	"os"

	"rul.sh/vaulterm/server/lib"
)

func CheckAndCreateEnvFile() error {
	// Check if .env file exists
	if _, err := os.Stat(".env"); !os.IsNotExist(err) {
		return nil
	}

	// File doesn't exist, so create it
	randomKey, err := lib.GenerateRandomKey()
	if err != nil {
		return err
	}

	// Write the random key to the .env file
	envContent := fmt.Sprintf("ENCRYPTION_KEY=%s\n", randomKey)
	err = os.WriteFile(".env", []byte(envContent), 0644)
	if err != nil {
		return err
	}
	fmt.Println(".env file created with ENCRYPTION_KEY.")

	return nil
}
