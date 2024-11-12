package db

import (
	"log"
	"os"
	"strings"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var dbInstance *gorm.DB

func Get() *gorm.DB {
	if dbInstance == nil {
		log.Fatal("database not initialized")
	}
	return dbInstance
}

func Init() {
	// log.Println("Initializing database...")

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "file:data.db?cache=shared&mode=rwc&_journal_mode=WAL"
	}

	// Open db connection
	var con gorm.Dialector
	if strings.HasPrefix(dsn, "postgres:") {
		con = postgres.Open(dsn)
	} else {
		con = sqlite.Open(dsn)
	}

	db, err := gorm.Open(con, &gorm.Config{
		SkipDefaultTransaction: true,
	})
	if err != nil {
		log.Fatal(err)
	}
	dbInstance = db

	// Migrate the schema
	db.AutoMigrate(Models...)
	InitModels(db)
	runSeeders(db)
}

func Close() error {
	con, err := dbInstance.DB()
	if err != nil {
		return err
	}
	if err := con.Close(); err != nil {
		return err
	}
	return nil
}
