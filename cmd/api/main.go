package main

import (
	configAdapter "data-host/internal/adapters/driven/config"
	"data-host/internal/adapters/driven/repository"
	"data-host/internal/adapters/driving/http"
	"data-host/internal/core/ports"
	"data-host/internal/core/services"
	"data-host/internal/database"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	configLoader := configAdapter.NewViperAdapter("config", "yaml", ".")
	config, err := configLoader.Load()
	if err != nil {
		log.Printf("Warning: error loading config file: %v\n", err)
	}

	var repo ports.RegistryRepository
	appEnv := os.Getenv("APP_ENV")
	if appEnv == "production" || appEnv == "publish" {
		fmt.Println("Running in PUBLISH mode (Filesystem Storage)")
		repo = repository.NewFilesystemRepository(config)
	} else {
		fmt.Printf("Running in DEVELOPMENT mode (SQLite Storage: %s)\n", config.DatabaseURL)
		db := database.New(config.DatabaseURL)
		repo, err = repository.NewSQLiteRepository(db.GetDB(), config)
		if err != nil {
			log.Fatalf("Failed to initialize SQLite repository: %v", err)
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
		fmt.Printf("\nReceived signal: %v. Shutting down...\n", sig)
		if err := hostService.Stop(); err != nil {
			log.Printf("Error during shutdown: %v", err)
		}
		done <- true
	}()

	fmt.Printf("Starting API server on port %d...\n", config.Port)
	if err := hostService.Start(config, repo); err != nil {
		log.Fatalf("Server error: %v", err)
	}

	<-done
	fmt.Println("Server exited gracefully.")
}
