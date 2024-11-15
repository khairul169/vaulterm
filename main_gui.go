//go:build gui
// +build gui

package main

import (
	"context"
	"embed"
	"log"
	"net"

	"github.com/wailsapp/wails/v2/pkg/application"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	srv "rul.sh/vaulterm/server/app"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	server := srv.NewApp()
	defer server.Shutdown()

	// Create wails app
	appCtx := NewApp()
	app := application.NewWithOptions(&options.App{
		Title:  "Vaulterm",
		Width:  1150,
		Height: 720,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			appCtx.startup(ctx)
		},
		Bind: []interface{}{appCtx},
	})

	// Run the local server
	go func() {
		defer app.Quit()

		listener, err := net.Listen("tcp", ":0")
		if err != nil {
			log.Fatal(err)
		}

		port := listener.Addr().(*net.TCPAddr).Port
		appCtx.localPort = port

		log.Printf("Starting server on http://localhost:%d\n", port)

		if err := server.Listener(listener); err != nil {
			log.Printf("Server error: %s\n", err)
		}
	}()

	if err := app.Run(); err != nil {
		println("Error:", err.Error())
	}
}
