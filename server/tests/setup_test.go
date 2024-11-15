package tests

import (
	"log"
	"os"
	"testing"

	"rul.sh/vaulterm/server/db"
)

func TestMain(m *testing.M) {
	log.Println("Starting tests...")
	test := NewTest(nil)

	// Run all tests
	code := m.Run()

	log.Println("Cleaning up...")

	// Clean up
	test.Close()
	db.Close()
	os.Exit(code)
}
