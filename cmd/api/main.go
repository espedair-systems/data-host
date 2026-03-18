/*
 * Entry Point: Application Bootstrap.
 * Responsible for initializing dependencies and starting the application.
 */
// @title           DataHost API
// @version         1.0.0
// @description     REST API for data schema and table management
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.example.com/support
// @contact.email  support@example.com

// @license.name   Apache 2.0
// @license.url    http://www.apache.org/licenses/LICENSE-2.0.html

// @host            localhost:8080
// @BasePath         /api
// @schemes          http https

// @securityDefinitions.apikey Bearer
// @in               header
// @name             Authorization
// @description      Type "Bearer" followed by a space and JWT token.

package main

import (
	"data-host/internal/adapters/driven/repository"
	"data-host/internal/adapters/driving/config"
	"data-host/internal/adapters/driving/http"
	"data-host/internal/adapters/driving/logger"
	"data-host/internal/core/ports"
	"data-host/internal/core/services"
	"data-host/internal/database"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/rs/zerolog/log"
)

func main() {
	// Load and validate configuration
	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Configuration error:\n%v\n", err)
		os.Exit(1)
	}

	// Initialize logger
	logger.Init(*cfg)

	log.Info().
		Str("host", "0.0.0.0").
		Int("port", cfg.Port).
		Str("log_level", cfg.LogLevel).
		Msg("Configuration loaded successfully")

	bootstrap := services.NewBootstrapService()
	bootRes := bootstrap.ExtractTemplates(cfg)
	if !bootRes.OK {
		log.Warn().Msg(bootRes.Text)
	} else {
		log.Info().Msg(bootRes.Text)
	}

	var repo ports.RegistryRepository
	appEnv := os.Getenv("APP_ENV")
	if appEnv == "production" || appEnv == "publish" {
		log.Info().Msg("Running in PUBLISH mode (Filesystem Storage)")
		repo = repository.NewFilesystemRepository(*cfg)
	} else {
		log.Info().Str("database_url", cfg.DatabaseURL).Msg("Running in DEVELOPMENT mode (SQLite Storage)")
		db := database.New(cfg.DatabaseURL)
		repo, err = repository.NewSQLiteRepository(db.GetDB(), *cfg)
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

	log.Info().Int("port", cfg.Port).Msg("Starting API server")
	if err := hostService.Start(*cfg, repo); err != nil {
		log.Fatal().Err(err).Msg("Server error")
	}

	<-done
	log.Info().Msg("Server exited gracefully.")
}
