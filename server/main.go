package main

import (
	"os"

	"rul.sh/vaulterm/app"
)

func main() {
	app := app.NewApp()

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	app.Listen(":" + port)
}
