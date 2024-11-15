package utils

import (
	"fmt"
	"os"
	"path/filepath"

	"rul.sh/vaulterm/server/lib"
)

func GetDataPath(resolveFile string) string {
	// Resolve the app directory
	execPath, err := os.Executable()
	if err != nil {
		return ""
	}
	appDir := filepath.Dir(execPath)
	if resolveFile == "" {
		return appDir
	}
	return filepath.Join(appDir, resolveFile)
}

func CheckAndCreateEnvFile() error {
	// Skip if ENCRYPTION_KEY is set
	if os.Getenv("ENCRYPTION_KEY") != "" {
		return nil
	}
	// Check if .env file exists
	envFile := GetDataPath(".env")
	if _, err := os.Stat(envFile); !os.IsNotExist(err) {
		return nil
	}

	// File doesn't exist, so create it
	randomKey, err := lib.GenerateRandomKey()
	if err != nil {
		return err
	}

	// Write the random key to the .env file
	envContent := fmt.Sprintf("ENCRYPTION_KEY=%s\n", randomKey)
	err = os.WriteFile(envFile, []byte(envContent), 0644)
	if err != nil {
		return err
	}

	fmt.Println(".env file created with ENCRYPTION_KEY.")
	return nil
}
