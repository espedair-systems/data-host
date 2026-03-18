/*
 * Driving Adapter: External API / Entry Point.
 * Translates external requests (e.g., HTTP, Auth, Config) into core application calls.
 */
package config

import (
	"data-host/internal/core/domain"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-playground/validator/v10"
)

// Validate performs strict validation on the configuration.
func Validate(config *domain.HostConfig) error {
	validate := validator.New()

	if err := validate.Struct(config); err != nil {
		var messages []string
		for _, err := range err.(validator.ValidationErrors) {
			messages = append(messages,
				fmt.Sprintf("%s: validation failed on '%s' tag (got: %v)",
					err.Field(), err.Tag(), err.Value()))
		}
		return fmt.Errorf("configuration validation failed:\n  - %s",
			strings.Join(messages, "\n  - "))
	}

	// Custom validation: check if database directory is writable
	if err := validateWritablePath(config.DatabaseURL); err != nil {
		return fmt.Errorf("database configuration invalid: %w", err)
	}

	return nil
}

// validateWritablePath ensures the directory containing the path exists and is writable.
func validateWritablePath(path string) error {
	if path == "" {
		return fmt.Errorf("path cannot be empty")
	}

	dbDir := filepath.Dir(path)

	// Try to create directory if it doesn't exist
	if _, err := os.Stat(dbDir); os.IsNotExist(err) {
		if err := os.MkdirAll(dbDir, 0755); err != nil {
			return fmt.Errorf("directory %s does not exist and could not be created: %w", dbDir, err)
		}
	}

	// Test writability
	testFile := filepath.Join(dbDir, ".datahost_write_test")
	if err := os.WriteFile(testFile, []byte("test"), 0644); err != nil {
		return fmt.Errorf("directory %s is not writable: %w", dbDir, err)
	}
	os.Remove(testFile)

	return nil
}
