package main

import (
	configAdapter "data-host/internal/adapters/driven/config"
	"data-host/internal/adapters/driven/repository"
	"data-host/internal/adapters/driving/http"
	"data-host/internal/adapters/driving/logger"
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"data-host/internal/core/services"
	"data-host/internal/database"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/spf13/cobra"
)

func main() {
	var port int
	var dataPath string
	var databaseURL string

	var rootCmd = &cobra.Command{
		Use:   "data-host",
		Short: "Host frontend and data directories",
		Run: func(cmd *cobra.Command, args []string) {
			configLoader := configAdapter.NewViperAdapter("config", "yaml", ".")
			loadedConfig, err := configLoader.Load()
			if err != nil {
				fmt.Printf("Warning: error loading config file: %v\n", err)
			}
			logger.Init(loadedConfig)

			// Override with flags if they are set
			if cmd.Flags().Changed("port") {
				loadedConfig.Port = port
			}
			if cmd.Flags().Changed("data") {
				if len(loadedConfig.Sites) > 0 {
					// Update first active site or first site
					updated := false
					for i, s := range loadedConfig.Sites {
						if s.Active {
							loadedConfig.Sites[i].DataPath = dataPath
							updated = true
							break
						}
					}
					if !updated {
						loadedConfig.Sites[0].DataPath = dataPath
					}
				} else {
					loadedConfig.Sites = append(loadedConfig.Sites, domain.SiteConfig{
						Name:     "default",
						DataPath: dataPath,
						Active:   true,
					})
				}
			}
			if cmd.Flags().Changed("database") {
				loadedConfig.DatabaseURL = databaseURL
			}

			var repo ports.RegistryRepository
			appEnv := os.Getenv("APP_ENV")
			if appEnv == "production" || appEnv == "publish" {
				fmt.Println("Running in PUBLISH mode (Filesystem Storage)")
				repo = repository.NewFilesystemRepository(loadedConfig)
			} else {
				fmt.Printf("Running in DEVELOPMENT mode (SQLite Storage: %s)\n", loadedConfig.DatabaseURL)
				db := database.New(loadedConfig.DatabaseURL)
				repo, err = repository.NewSQLiteRepository(db.GetDB(), loadedConfig)
				if err != nil {
					fmt.Printf("Failed to initialize SQLite repository: %v\n", err)
					os.Exit(1)
				}
			}

			httpAdapter := http.NewGinAdapter()
			hostService := services.NewHostService(httpAdapter)

			// Handle graceful shutdown
			go func() {
				sigChan := make(chan os.Signal, 1)
				signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
				<-sigChan
				fmt.Println("\nShutting down...")
				_ = hostService.Stop()
				os.Exit(0)
			}()

			if err := hostService.Start(loadedConfig, repo); err != nil {
				fmt.Printf("Error starting server: %v\n", err)
				os.Exit(1)
			}
		},
	}

	rootCmd.Flags().IntVarP(&port, "port", "p", 8080, "Port to host on")
	rootCmd.Flags().StringVarP(&dataPath, "data", "d", "/", "Path to data directory")
	rootCmd.Flags().StringVarP(&databaseURL, "database", "b", "blueprint.db", "Path to SQLite database")

	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}
