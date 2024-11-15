//go:build gui
// +build gui

package main

import (
	"context"
	"fmt"
)

// App struct
type App struct {
	ctx       context.Context
	localPort int
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Returns local server address
func (a *App) GetLocalServer() string {
	if a.localPort == 0 {
		return ""
	}
	return fmt.Sprintf("http://localhost:%d", a.localPort)
}
