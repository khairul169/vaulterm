package app

import (
	"fmt"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"rul.sh/vaulterm/server/app/auth"
	"rul.sh/vaulterm/server/db"
	"rul.sh/vaulterm/server/middleware"
	"rul.sh/vaulterm/server/utils"
)

func NewApp() *fiber.App {
	// Load deps
	utils.CheckAndCreateEnvFile()
	godotenv.Load(utils.GetDataPath(".env"))

	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		// WAL: _journal_mode=WAL
		dbPath := utils.GetDataPath("data.db")
		dbUrl = fmt.Sprintf("file:%s?cache=shared&mode=rwc", dbPath)
	}
	db.Init(dbUrl)

	// Create fiber app
	app := fiber.New(fiber.Config{ErrorHandler: ErrorHandler})
	app.Use(cors.New())

	// Server info
	app.Get("/server", func(c *fiber.Ctx) error {
		return c.JSON(&fiber.Map{
			"name":    "Vaulterm",
			"version": "0.0.1",
		})
	})

	// Health check
	app.Get("/health-check", func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	app.Use(middleware.Auth)
	auth.Router(app)

	app.Use(middleware.Protected())
	InitRouter(app)

	return app
}
