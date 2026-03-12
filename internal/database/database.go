package database

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"strconv"
	"time"

	_ "github.com/joho/godotenv/autoload"
	"github.com/rs/zerolog/log"
	_ "modernc.org/sqlite"
)

// Service represents a service that interacts with a database.
type Service interface {
	// Health returns a map of health status information.
	Health() map[string]string

	// Close terminates the database connection.
	Close() error

	// GetDB returns the underlying sql.DB
	GetDB() *sql.DB
}

type service struct {
	db  *sql.DB
	url string
}

var dbInstance *service

func New(url string) Service {
	if dbInstance != nil {
		return dbInstance
	}

	db, err := sql.Open("sqlite", url)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to open database")
	}

	dbInstance = &service{
		db:  db,
		url: url,
	}

	// Automatic migrations
	migrateOnStartup := os.Getenv("MIGRATE_ON_STARTUP") != "false"
	if migrateOnStartup {
		if err := RunMigrations(dbInstance.db); err != nil {
			log.Fatal().Err(err).Msg("failed to run migrations")
		}
	} else {
		log.Info().Msg("Database migrations skipped (MIGRATE_ON_STARTUP=false)")
	}

	return dbInstance
}

func GetDB() *sql.DB {
	if dbInstance == nil {
		return nil
	}
	return dbInstance.db
}

func (s *service) GetDB() *sql.DB {
	return s.db
}

func (s *service) Health() map[string]string {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	stats := make(map[string]string)
	err := s.db.PingContext(ctx)
	if err != nil {
		stats["status"] = "down"
		stats["error"] = fmt.Sprintf("db down: %v", err)
		return stats
	}

	stats["status"] = "up"
	stats["message"] = "It's healthy"

	dbStats := s.db.Stats()
	stats["open_connections"] = strconv.Itoa(dbStats.OpenConnections)
	stats["in_use"] = strconv.Itoa(dbStats.InUse)
	stats["idle"] = strconv.Itoa(dbStats.Idle)
	stats["wait_count"] = strconv.FormatInt(dbStats.WaitCount, 10)
	stats["wait_duration"] = dbStats.WaitDuration.String()
	stats["max_idle_closed"] = strconv.FormatInt(dbStats.MaxIdleClosed, 10)
	stats["max_lifetime_closed"] = strconv.FormatInt(dbStats.MaxLifetimeClosed, 10)

	return stats
}

func (s *service) Close() error {
	log.Info().Str("url", s.url).Msg("Disconnected from database")
	return s.db.Close()
}
