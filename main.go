//go:build !gui
// +build !gui

package main

import (
	"log"
	"os"

	srv "rul.sh/vaulterm/server/app"
)

func main() {
	server := srv.NewApp()

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("Starting server on port %s\n", port)

	if err := server.Listen(":" + port); err != nil {
		log.Printf("Server error: %s\n", err)
	}
}
