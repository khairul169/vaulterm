package app

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"rul.sh/vaulterm/app/auth"
	"rul.sh/vaulterm/app/hosts"
	"rul.sh/vaulterm/app/keychains"
	"rul.sh/vaulterm/app/ws"
	"rul.sh/vaulterm/db"
)

func NewApp() *fiber.App {
	// Load deps
	godotenv.Load()
	db.Init()

	// Create fiber app
	app := fiber.New(fiber.Config{ErrorHandler: ErrorHandler})

	// Middlewares
	app.Use(cors.New())

	// Init app routes
	auth.Router(app)
	hosts.Router(app)
	keychains.Router(app)
	ws.Router(app)

	// Health check
	app.Get("/health-check", func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	return app
}
