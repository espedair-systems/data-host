package main

import (
	"data-host/internal/database"
	"database/sql"
	"fmt"
	"os"

	"github.com/rs/zerolog/log"
	_ "modernc.org/sqlite"
)

func main() {
	if len(os.Args) < 2 {
		printUsage()
		os.Exit(1)
	}

	command := os.Args[1]

	// Open database
	dbPath := "blueprint.db"
	if len(os.Args) > 2 {
		dbPath = os.Args[2]
	}

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to open database")
	}
	defer db.Close()

	switch command {
	case "up":
		if err := database.RunMigrations(db); err != nil {
			log.Fatal().Err(err).Msg("Migration failed")
		}
		fmt.Println("✓ Migrations applied successfully")

	case "down":
		if err := database.RollbackMigration(db); err != nil {
			log.Fatal().Err(err).Msg("Rollback failed")
		}
		fmt.Println("✓ Migration rolled back successfully")

	case "status":
		if err := database.GetMigrationStatus(db); err != nil {
			log.Fatal().Err(err).Msg("Failed to get status")
		}

	case "reset":
		if err := database.ResetMigrations(db); err != nil {
			log.Fatal().Err(err).Msg("Reset failed")
		}
		fmt.Println("✓ Database reset successfully")

	default:
		fmt.Printf("Unknown command: %s\n", command)
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println("Usage:")
	fmt.Println("  migrate up [db_path]")
	fmt.Println("  migrate down [db_path]")
	fmt.Println("  migrate status [db_path]")
	fmt.Println("  migrate reset [db_path]")
	fmt.Println("")
	fmt.Println("Defaults:")
	fmt.Println("  db_path: blueprint.db")
}
