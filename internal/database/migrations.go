package database

import (
	"database/sql"
	"embed"

	"github.com/pressly/goose/v3"
	"github.com/rs/zerolog"
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

	// Redirect goose output to our logger
	goose.SetLogger(&gooseLogger{lg})

	// We allow missing migrations to handle transitions between different versioning schemes
	// however this only works if migrations in DB but not on disk are okay.
	// Out-of-order migrations are not directly supported via OptionsFunc in simple Up()?
	// Actually, WithAllowMissing() helps if files are removed.
	if err := goose.Up(db, "migrations/sqlite", goose.WithAllowMissing()); err != nil {
		lg.Error().Err(err).Msg("Migration failed")
		return err
	}

	lg.Info().Msg("Migrations completed successfully")
	return nil
}

type gooseLogger struct {
	lg zerolog.Logger
}

func (l *gooseLogger) Printf(format string, v ...interface{}) {
	l.lg.Info().Msgf(format, v...)
}

func (l *gooseLogger) Fatalf(format string, v ...interface{}) {
	l.lg.Fatal().Msgf(format, v...)
}

// GetMigrationStatus returns the status of database migrations.
func GetMigrationStatus(db *sql.DB) error {
	goose.SetBaseFS(migrationsFS)
	if err := goose.SetDialect("sqlite3"); err != nil {
		return err
	}

	return goose.Status(db, "migrations/sqlite", goose.WithAllowMissing())
}

// RollbackMigration rolls back the last database migration.
func RollbackMigration(db *sql.DB) error {
	lg := log.With().Str("component", "migrations").Logger()

	goose.SetBaseFS(migrationsFS)
	if err := goose.SetDialect("sqlite3"); err != nil {
		return err
	}

	if err := goose.Down(db, "migrations/sqlite", goose.WithAllowMissing()); err != nil {
		lg.Error().Err(err).Msg("Rollback failed")
		return err
	}

	lg.Info().Msg("Rollback completed successfully")
	return nil
}

// ResetMigrations rolls back all migrations.
func ResetMigrations(db *sql.DB) error {
	lg := log.With().Str("component", "migrations").Logger()

	lg.Info().Msg("Resetting all database migrations")

	goose.SetBaseFS(migrationsFS)
	if err := goose.SetDialect("sqlite3"); err != nil {
		return err
	}

	if err := goose.Reset(db, "migrations/sqlite"); err != nil {
		lg.Error().Err(err).Msg("Reset failed")
		return err
	}

	lg.Info().Msg("Reset completed successfully")
	return nil
}
