/*
 * Entry Point: Application Bootstrap.
 * Responsible for initializing dependencies and starting the application.
 */
package main

import (
	"archive/zip"
	configAdapter "data-host/internal/adapters/driven/config"
	appConfig "data-host/internal/adapters/driving/config"
	"data-host/internal/adapters/driving/logger"
	"data-host/internal/core/services"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
)

// unzip utility for deployment artifacts
func unzip(src string, dest string) error {
	r, err := zip.OpenReader(src)
	if err != nil {
		return err
	}
	defer r.Close()

	for _, f := range r.File {
		fpath := filepath.Join(dest, f.Name)
		if !strings.HasPrefix(fpath, filepath.Clean(dest)+string(os.PathSeparator)) {
			return fmt.Errorf("%s: illegal file path", fpath)
		}
		if f.FileInfo().IsDir() {
			os.MkdirAll(fpath, os.ModePerm)
			continue
		}
		if err = os.MkdirAll(filepath.Dir(fpath), os.ModePerm); err != nil {
			return err
		}
		outFile, err := os.OpenFile(fpath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			return err
		}
		rc, err := f.Open()
		if err != nil {
			return err
		}
		_, err = io.Copy(outFile, rc)
		outFile.Close()
		rc.Close()
		if err != nil {
			return err
		}
	}
	return nil
}

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

	// Persist any new default fields to the config file
	_ = appConfig.SaveWithComments(fullPath, &config)

	// Extract templates to ./artifacts/templates by default
	bootRes := bootstrap.ExtractTemplates(&config)
	if !bootRes.OK {
		fmt.Printf("Warning: Template extraction failed: %s\n", bootRes.Text)
	}

	// Initialize logger (handles file logging if enabled)
	logger.Init(config)

	if config.Deploy == "IDE" {
		targets := []string{"./data-service/dist.zip", "./data-services/dist.zip"}
		for _, zipPath := range targets {
			if _, err := os.Stat(zipPath); err == nil {
				dest := filepath.Dir(zipPath)
				fmt.Printf("Found %s, unzipping to %s...\n", zipPath, dest)
				if err := unzip(zipPath, dest); err != nil {
					fmt.Printf("Error unzipping %s: %v\n", zipPath, err)
				} else {
					fmt.Printf("Successfully unzipped %s\n", zipPath)
				}
				break
			}
		}
	}

	p := tea.NewProgram(initialModel(config), tea.WithAltScreen(), tea.WithMouseCellMotion())
	if _, err := p.Run(); err != nil {
		fmt.Printf("Error running TUI: %v", err)
		os.Exit(1)
	}
}
