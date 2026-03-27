/*
 * Entry Point: Application Bootstrap.
 * Responsible for initializing dependencies and starting the application.
 */
package main

import (
	configAdapter "data-host/internal/adapters/driven/config"
	"data-host/internal/adapters/driven/repository"
	appConfig "data-host/internal/adapters/driving/config"
	"data-host/internal/adapters/driving/http"
	"data-host/internal/adapters/driving/logger"
	"data-host/internal/adapters/driving/tui"
	"data-host/internal/core/ports"
	"data-host/internal/core/services"
	"data-host/internal/database"
	"data-host/internal/utils/archive"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/rs/zerolog/log"
)

func main() {
	configName := "config"
	configType := "yaml"
	configPath := "."
	fullPath := filepath.Join(configPath, configName+"."+configType)

	bootstrap := services.NewBootstrapService()
	created, res := bootstrap.EnsureConfigFile(fullPath)
	if !res.OK {
		fmt.Printf("Bootstrap Error: %s\n", res.Text)
		os.Exit(1)
	}
	if created {
		fmt.Printf("\nSUCCESS: %s\n", res.Text)
		fmt.Println("ACTION REQUIRED: Please edit the configuration to match your environment (e.g., data_path), then restart the application.")
		os.Exit(0)
	}

	configLoader := configAdapter.NewViperAdapter(configName, configType, configPath)
	config, err := configLoader.Load()
	if err != nil {
		config = *appConfig.GetDefaults()
	}


	// Create shared log channels EARLY
	logChan := make(chan string, 1000)
	errorChan := make(chan string, 1000)

	// Initialize REAL TUI logger immediately
	logger.InitTUI(config, &logger.TUIWriter{
		TopWindow:    &chanWriter{channel: errorChan},
		BottomWindow: &chanWriter{channel: logChan},
	})

	// Extract templates to ./artifacts/templates by default
	bootRes := bootstrap.ExtractTemplates(&config)
	if !bootRes.OK {
		log.Warn().Msgf("Template extraction failed: %s", bootRes.Text)
	}

	if config.Deploy == "IDE" {
		targets := []string{"./data-service/dist.zip", "./data-services/dist.zip"}
		for _, zipPath := range targets {
			if _, err := os.Stat(zipPath); err == nil {
				dest := filepath.Dir(zipPath)
				log.Info().Msgf("Found %s, unzipping to %s...", zipPath, dest)
				if err := archive.Unzip(zipPath, dest); err != nil {
					log.Error().Err(err).Msgf("Error unzipping %s", zipPath)
				} else {
					log.Info().Msgf("Successfully unzipped %s", zipPath)
				}
				break
			}
		}
	}

	// Initialize Ports and Adapters
	httpAdapter := http.NewGinAdapter()
	hostService := services.NewHostService(httpAdapter)

	var repo ports.RegistryRepository
	appEnv := os.Getenv("APP_ENV")
	if appEnv == "production" || appEnv == "publish" {
		repo = repository.NewFilesystemRepository(config)
	} else {
		// Disable migration on startup to handle it stepwise in TUI
		os.Setenv("MIGRATE_ON_STARTUP", "false")
		db := database.New(config.DatabaseURL)
		repo, _ = repository.NewSQLiteRepository(db.GetDB(), config)
	}

	// Initialize TUI Model with dependencies and shared channels
	model := tui.NewBootstrapModel(config, bootstrap, hostService, repo, logChan, errorChan)

	p := tea.NewProgram(model, tea.WithAltScreen(), tea.WithMouseCellMotion())

	if _, err := p.Run(); err != nil {
		fmt.Printf("Error running TUI: %v", err)
		os.Exit(1)
	}
}

type chanWriter struct {
	channel chan<- string
}

func (w *chanWriter) Write(p []byte) (n int, err error) {
	msg := string(p)

	// Clean up JSON logs from Zerolog for the TUI window
	if strings.HasPrefix(msg, "{") {
		var data map[string]interface{}
		if err := json.Unmarshal(p, &data); err == nil {
			msgStr, okM := data["message"].(string)
			lvlStr, okL := data["level"].(string)
			if okM && okL {
				msg = fmt.Sprintf("[%s] %s", strings.ToUpper(lvlStr), msgStr)
			} else if okM {
				msg = msgStr
			}
		}
	}

	w.channel <- strings.TrimSpace(msg)
	return len(p), nil
}
