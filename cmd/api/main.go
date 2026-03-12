package main

import (
	configAdapter "data-host/internal/adapters/driven/config"
	"data-host/internal/adapters/driven/repository"
	"data-host/internal/adapters/driving/http"
	"data-host/internal/adapters/driving/logger"
	"data-host/internal/core/ports"
	"data-host/internal/core/services"
	"data-host/internal/database"
	"os"
	"os/signal"
	"syscall"

	"github.com/rs/zerolog/log"
)

func main() {
	// Initialize logger
	debug := os.Getenv("DEBUG") == "true"
	logger.Init(debug)

	logLevel := os.Getenv("LOG_LEVEL")
	if logLevel != "" {
		logger.SetLogLevel(logLevel)
	}

	configLoader := configAdapter.NewViperAdapter("config", "yaml", ".")
	config, err := configLoader.Load()
	if err != nil {
		log.Warn().Err(err).Msg("Error loading config file")
	}

	var repo ports.RegistryRepository
	appEnv := os.Getenv("APP_ENV")
	if appEnv == "production" || appEnv == "publish" {
		log.Info().Msg("Running in PUBLISH mode (Filesystem Storage)")
		repo = repository.NewFilesystemRepository(config)
	} else {
		log.Info().Str("database_url", config.DatabaseURL).Msg("Running in DEVELOPMENT mode (SQLite Storage)")
		db := database.New(config.DatabaseURL)
		repo, err = repository.NewSQLiteRepository(db.GetDB(), config)
		if err != nil {
			log.Fatal().Err(err).Msg("Failed to initialize SQLite repository")
		}
	}

	httpAdapter := http.NewGinAdapter()
	hostService := services.NewHostService(httpAdapter)

	// Create a channel to catch signals
	done := make(chan bool, 1)
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		sig := <-sigChan
		log.Info().Interface("signal", sig).Msg("Received signal. Shutting down...")
		if err := hostService.Stop(); err != nil {
			log.Error().Err(err).Msg("Error during shutdown")
		}
		done <- true
	}()

	log.Info().Int("port", config.Port).Msg("Starting API server")
	if err := hostService.Start(config, repo); err != nil {
		log.Fatal().Err(err).Msg("Server error")
	}

	<-done
	log.Info().Msg("Server exited gracefully.")
}
