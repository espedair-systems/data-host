package database

import (
	"database/sql"
	"embed"

	"github.com/pressly/goose/v3"
	"github.com/rs/zerolog/log"
)

//go:embed migrations/sqlite/*.sql
var migrationsFS embed.FS

// RunMigrations runs all pending database migrations.
func RunMigrations(db *sql.DB) error {
	lg := log.With().Str("component", "migrations").Logger()

	lg.Info().Msg("Running database migrations")

	goose.SetBaseFS(migrationsFS)
	if err := goose.SetDialect("sqlite3"); err != nil {
		lg.Error().Err(err).Msg("Failed to set dialect")
		return err
	}

	if err := goose.Up(db, "migrations/sqlite"); err != nil {
		lg.Error().Err(err).Msg("Migration failed")
		return err
	}

	lg.Info().Msg("Migrations completed successfully")
	return nil
}

// GetMigrationStatus returns the status of database migrations.
func GetMigrationStatus(db *sql.DB) error {
	goose.SetBaseFS(migrationsFS)
	if err := goose.SetDialect("sqlite3"); err != nil {
		return err
	}

	return goose.Status(db, "migrations/sqlite")
}

// RollbackMigration rolls back the last database migration.
func RollbackMigration(db *sql.DB) error {
	lg := log.With().Str("component", "migrations").Logger()

	goose.SetBaseFS(migrationsFS)
	if err := goose.SetDialect("sqlite3"); err != nil {
		return err
	}

	if err := goose.Down(db, "migrations/sqlite"); err != nil {
		lg.Error().Err(err).Msg("Rollback failed")
		return err
	}

	lg.Info().Msg("Rollback completed successfully")
	return nil
}
