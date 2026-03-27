/*
 * Driving Adapter: External API / Entry Point.
 * Translates external requests (e.g., HTTP, Auth, Config) into core application calls.
 */
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

	// 3. Resolve configuration state
	// (DataPath is now site-specific)

	// 4. Validate
	if err := Validate(config); err != nil {
		return nil, err
	}

	return config, nil
}

// Save marshals the config to YAML and saves it to the specified path.
func Save(path string, config *domain.HostConfig) error {
	data, err := yaml.Marshal(config)
	if err != nil {
		return fmt.Errorf("failed to marshal config to YAML: %w", err)
	}
	return os.WriteFile(path, data, 0644)
}

// SaveWithComments generates a configuration file with helpful instructions for the user.
func SaveWithComments(path string, config *domain.HostConfig) error {
	var sb strings.Builder

	sb.WriteString("# Data-Host Configuration\n")
	sb.WriteString("# Generated automatically during bootstrap.\n\n")

	sb.WriteString("# Port the backend service will listen on.\n")
	sb.WriteString(fmt.Sprintf("port: %d\n\n", config.Port))

	sb.WriteString("# SQLite database location.\n")
	sb.WriteString(fmt.Sprintf("database_url: \"%s\"\n\n", config.DatabaseURL))

	sb.WriteString("# Root directory for site discovery. Individual sites should have a site.json/site.yaml.\n")
	sb.WriteString(fmt.Sprintf("site_path: \"%s\"\n\n", config.SitePath))

	sb.WriteString("# Default directory for generated pages.\n")
	sb.WriteString(fmt.Sprintf("generate_path: \"%s\"\n\n", config.GeneratePath))

	sb.WriteString("# Directory for archived data and schemas.\n")
	sb.WriteString(fmt.Sprintf("archive_path: \"%s\"\n\n", config.ArchivePath))

	sb.WriteString("# Directory for extracted artifacts (templates, schemas, etc.)\n")
	sb.WriteString(fmt.Sprintf("local_artifacts_dir: \"%s\"\n\n", config.LocalArtifactsDir))

	sb.WriteString("# Logging configuration.\n")
	sb.WriteString(fmt.Sprintf("log_level: \"%s\" # DEBUG, INFO, WARN, ERROR, FATAL\n", config.LogLevel))
	sb.WriteString(fmt.Sprintf("log_format: \"%s\" # json, pretty\n", config.LogFormat))
	sb.WriteString(fmt.Sprintf("log_output: \"%s\" # stdout or file path\n", config.LogOutput))
	sb.WriteString(fmt.Sprintf("log_file_enabled: %v\n", config.LogFileEnabled))
	sb.WriteString(fmt.Sprintf("log_file_path: \"%s\"\n", config.LogFilePath))
	sb.WriteString(fmt.Sprintf("log_max_size: %d # megabytes\n", config.LogMaxSize))
	sb.WriteString(fmt.Sprintf("log_max_backups: %d\n", config.LogMaxBackups))
	sb.WriteString(fmt.Sprintf("log_max_age: %d # days\n\n", config.LogMaxAge))

	sb.WriteString("# Deployment environment.\n")
	sb.WriteString(fmt.Sprintf("deploy: \"%s\" # Options: IDE, TEST, DOCKER, PROD\n\n", config.Deploy))

	sb.WriteString("# Security Settings\n")
	sb.WriteString("# Enable dev mode to bypass authentication requirements (DO NOT USE IN PRODUCTION)\n")
	sb.WriteString(fmt.Sprintf("dev_mode: %v\n\n", config.DevMode))

	sb.WriteString("# Security: JWT secret for API authentication.\n")
	sb.WriteString("# IMPORTANT: Change this to a secure random string (min 32 chars).\n")
	sb.WriteString(fmt.Sprintf("jwt_secret: \"%s\"\n\n", config.JWTSecret))

	sb.WriteString("# Rate Limiting: Requests per IP per minute.\n")
	sb.WriteString("rate_limits:\n")
	sb.WriteString(fmt.Sprintf("  read_requests: %d\n", config.RateLimits.ReadRequests))
	sb.WriteString(fmt.Sprintf("  write_requests: %d\n\n", config.RateLimits.WriteRequests))

	sb.WriteString("# CORS allowed origins (comma separated).\n")
	sb.WriteString("cors_allow_origins:\n")
	for _, origin := range config.CORSAllowOrigins {
		sb.WriteString(fmt.Sprintf("  - \"%s\"\n", origin))
	}
	sb.WriteString("\n")

	sb.WriteString("# Site Registry: Maps your project directories to URI paths.\n")
	sb.WriteString("# Note: Sites are also automatically discovered from 'site_path' if they contain a site.json file.\n")
	sb.WriteString("sites:\n")
	if len(config.Sites) == 0 {
		sb.WriteString("  # Optional: Manual site entries can be added here if discovery is not used.\n")
	}
	for _, site := range config.Sites {
		sb.WriteString(fmt.Sprintf("  - name: \"%s\"\n", site.Name))
		sb.WriteString(fmt.Sprintf("    active: %v\n", site.Active))
		sb.WriteString(fmt.Sprintf("    type: \"%s\"\n", site.Type))
		sb.WriteString(fmt.Sprintf("    publish_url: \"%s\"\n", site.PublishURL))
		sb.WriteString(fmt.Sprintf("    description: \"%s\"\n", site.Description))
		sb.WriteString(fmt.Sprintf("    site_path: \"%s\"\n", site.SitePath))
		sb.WriteString(fmt.Sprintf("    data_path: \"%s\"\n", site.DataPath))
		sb.WriteString(fmt.Sprintf("    schema_path: \"%s\"\n", site.SchemaPath))
		sb.WriteString(fmt.Sprintf("    site_dist: \"%s\"\n", site.SiteDist))
		sb.WriteString(fmt.Sprintf("    mount_path: \"%s\"\n", site.MountPath))
		if site.MountSource != "" {
			sb.WriteString(fmt.Sprintf("    mount_source: \"%s\"\n", site.MountSource))
		}
		if site.MountDist != "" {
			sb.WriteString(fmt.Sprintf("    mount_dist: \"%s\"\n", site.MountDist))
		}
	}

	sb.WriteString("\n# Integration settings\n")
	sb.WriteString("github:\n")
	sb.WriteString(fmt.Sprintf("  org: \"%s\"\n", config.Github.Org))
	sb.WriteString(fmt.Sprintf("  token: \"%s\"\n", config.Github.Token))

	return os.WriteFile(path, []byte(sb.String()), 0644)
}

func GetDefaults() *domain.HostConfig {
	return &domain.HostConfig{
		Port:           8080,
		DatabaseURL:    "blueprint.db",
		LogLevel:       "INFO",
		LogFormat:      "json",
		LogOutput:      "stdout",
		LogFileEnabled: false,
		LogFilePath:    "logs/data-host.log",
		LogMaxSize:     10,
		LogMaxBackups:  3,
		LogMaxAge:      28,
		Debug:          false,
		CORSAllowOrigins: []string{
			"http://localhost:5173",
			"http://localhost:8080",
		},
		RateLimits: domain.RateLimitConfig{
			ReadRequests:  1000,
			WriteRequests: 100,
		},
		JWTSecret:         "your-secret-key-must-be-at-least-32-chars-long",
		Deploy:            "IDE",
		LocalArtifactsDir: "./artifacts",
		ExtractArtifacts:  false,
		DevMode:           true,
		SitePath:          "./sites",
		GeneratePath:      "./generated",
		ArchivePath:       "./artifacts/archive",
		Sites: []domain.SiteConfig{
			{
				Name:        "data-services",
				Active:      true,
				Type:        "document",
				PublishURL:  "/host/data-services",
				Description: "Core data platform.",
				SitePath:    "./sites/data-services",
				DataPath:    "./sites/data-services/data/",
				SchemaPath:  "./sites/data-services/dist/registry/schema/",
				SiteDist:    "./sites/data-services/dist",
				MountPath:   "/host/data-services",
				MountSource: "./sites/data-services",
				MountDist:   "./sites/data-services/dist",
			},
		},
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
	if val := os.Getenv("DATA_HOST_DATABASE_URL"); val != "" {
		config.DatabaseURL = val
	}
	if val := os.Getenv("DATA_HOST_SITE_PATH"); val != "" {
		config.SitePath = val
	}
	if val := os.Getenv("DATA_HOST_GENERATE_PATH"); val != "" {
		config.GeneratePath = val
	}
	if val := os.Getenv("DATA_HOST_ARCHIVE_PATH"); val != "" {
		config.ArchivePath = val
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
	if val := os.Getenv("DATA_HOST_LOG_FILE_ENABLED"); val != "" {
		config.LogFileEnabled = strings.ToLower(val) == "true"
	}
	if val := os.Getenv("DATA_HOST_LOG_FILE_PATH"); val != "" {
		config.LogFilePath = val
	}
	if val := os.Getenv("DATA_HOST_LOG_MAX_SIZE"); val != "" {
		if i, err := strconv.Atoi(val); err == nil {
			config.LogMaxSize = i
		}
	}
	if val := os.Getenv("DATA_HOST_LOG_MAX_BACKUPS"); val != "" {
		if i, err := strconv.Atoi(val); err == nil {
			config.LogMaxBackups = i
		}
	}
	if val := os.Getenv("DATA_HOST_LOG_MAX_AGE"); val != "" {
		if i, err := strconv.Atoi(val); err == nil {
			config.LogMaxAge = i
		}
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
		config.Deploy = val
	}
	if val := os.Getenv("DATA_HOST_LOCAL_ARTIFACTS_DIR"); val != "" {
		config.LocalArtifactsDir = val
	}
	if val := os.Getenv("DATA_HOST_EXTRACT_ARTIFACTS"); val != "" {
		config.ExtractArtifacts = strings.ToLower(val) == "true"
	}
	if val := os.Getenv("DATA_HOST_DEV_MODE"); val != "" {
		config.DevMode = strings.ToLower(val) == "true"
	}
	if val := os.Getenv("GITHUB_ORG"); val != "" {
		config.Github.Org = val
	}
	if val := os.Getenv("GITHUB_TOKEN"); val != "" {
		config.Github.Token = val
	}
}
