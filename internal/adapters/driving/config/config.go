package config

import (
	"data-host/internal/core/domain"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/rs/zerolog/log"
	"gopkg.in/yaml.v2"
)

// Load loads and validates the configuration.
func Load() (*domain.HostConfig, error) {
	config := GetDefaults()

	// 1. Load from YAML if exists
	configPath := os.Getenv("CONFIG_FILE")
	if configPath == "" {
		configPath = "config.yaml"
	}

	if _, err := os.Stat(configPath); err == nil {
		if err := loadFromYAML(configPath, config); err != nil {
			return nil, fmt.Errorf("failed to load YAML config: %w", err)
		}
	} else {
		log.Info().Str("path", configPath).Msg("Config file not found, using defaults and environment variables")
	}

	// 2. Override with environment variables
	loadFromEnv(config)

	// 3. Validate
	if err := Validate(config); err != nil {
		return nil, err
	}

	return config, nil
}

func GetDefaults() *domain.HostConfig {
	return &domain.HostConfig{
		Port:         8080,
		FrontendPath: "./frontend/dist",
		DataPath:     "/",
		DatabaseURL:  "blueprint.db",
		LogLevel:     "INFO",
		LogFormat:    "json",
		LogOutput:    "stdout",
		Debug:        false,
		CORSAllowOrigins: []string{
			"http://localhost:5173",
			"http://localhost:8080",
		},
		RateLimits: domain.RateLimitConfig{
			ReadRequests:  100,
			WriteRequests: 10,
		},
		JWTSecret: "your-secret-key-must-be-at-least-32-chars-long",
		Deploy:    false,
	}
}

func loadFromYAML(path string, config *domain.HostConfig) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	return yaml.Unmarshal(data, config)
}

func loadFromEnv(config *domain.HostConfig) {
	if val := os.Getenv("DATA_HOST_PORT"); val != "" {
		if i, err := strconv.Atoi(val); err == nil {
			config.Port = i
		}
	}
	if val := os.Getenv("DATA_HOST_FRONTEND_PATH"); val != "" {
		config.FrontendPath = val
	}
	if val := os.Getenv("DATA_HOST_DATA_PATH"); val != "" {
		config.DataPath = val
	}
	if val := os.Getenv("DATA_HOST_DATABASE_URL"); val != "" {
		config.DatabaseURL = val
	}
	if val := os.Getenv("DATA_HOST_DEBUG"); val != "" {
		config.Debug = strings.ToLower(val) == "true"
	}
	if val := os.Getenv("DATA_HOST_LOG_LEVEL"); val != "" {
		config.LogLevel = strings.ToUpper(val)
	}
	if val := os.Getenv("DATA_HOST_LOG_FORMAT"); val != "" {
		config.LogFormat = strings.ToLower(val)
	}
	if val := os.Getenv("DATA_HOST_LOG_OUTPUT"); val != "" {
		config.LogOutput = val
	}
	if val := os.Getenv("CORS_ALLOW_ORIGINS"); val != "" {
		config.CORSAllowOrigins = strings.Split(val, ",")
	}
	if val := os.Getenv("RATE_LIMIT_READ"); val != "" {
		if i, err := strconv.Atoi(val); err == nil {
			config.RateLimits.ReadRequests = i
		}
	}
	if val := os.Getenv("RATE_LIMIT_WRITE"); val != "" {
		if i, err := strconv.Atoi(val); err == nil {
			config.RateLimits.WriteRequests = i
		}
	}
	if val := os.Getenv("JWT_SECRET"); val != "" {
		config.JWTSecret = val
	}
	if val := os.Getenv("DATA_HOST_DEPLOY"); val != "" {
		config.Deploy = strings.ToLower(val) == "true"
	}
}
