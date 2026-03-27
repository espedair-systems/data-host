/*
 * Driven Adapter: Infrastructure / Implementation.
 * Implements outbound ports for external systems like databases or filesystems.
 */
package config

import (
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"fmt"
	"strings"

	"github.com/rs/zerolog/log"
	"github.com/spf13/viper"
)

type ViperAdapter struct {
	configName string
	configType string
	configPath string
}

func NewViperAdapter(name, ctype, path string) ports.ConfigProvider {
	return &ViperAdapter{
		configName: name,
		configType: ctype,
		configPath: path,
	}
}

func (v *ViperAdapter) Load() (domain.HostConfig, error) {
	viper.SetConfigName(v.configName)
	viper.SetConfigType(v.configType)
	viper.AddConfigPath(v.configPath)

	// Environment variables
	viper.SetEnvPrefix("DATA_HOST")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()

	// Defaults
	viper.SetDefault("port", 8080)
	viper.SetDefault("database_url", "blueprint.db")
	viper.SetDefault("debug", false)
	viper.SetDefault("log_level", "INFO")
	viper.SetDefault("log_format", "json")
	viper.SetDefault("log_output", "stdout")
	viper.SetDefault("log_file_enabled", false)
	viper.SetDefault("log_file_path", "logs/data-host.log")
	viper.SetDefault("log_max_size", 10)
	viper.SetDefault("log_max_backups", 3)
	viper.SetDefault("log_max_age", 28)
	viper.SetDefault("deploy", "IDE")
	viper.SetDefault("local_artifacts_dir", "./artifacts")
	viper.SetDefault("extract_artifacts", false)
	viper.SetDefault("dev_mode", true)
	viper.SetDefault("site_path", "./sites")
	viper.SetDefault("generate_path", "./generated")
	viper.SetDefault("erd_limit", 20)

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return domain.HostConfig{}, fmt.Errorf("error reading config file: %w", err)
		}
		// If not found, we continue with defaults/env
		log.Debug().Msg("Config file not found, continuing with defaults and environment variables")
	}

	var config domain.HostConfig
	config.Port = viper.GetInt("port")
	config.DatabaseURL = viper.GetString("database_url")
	config.Debug = viper.GetBool("debug")
	config.LogLevel = viper.GetString("log_level")
	config.LogFormat = viper.GetString("log_format")
	config.LogOutput = viper.GetString("log_output")
	config.LogFileEnabled = viper.GetBool("log_file_enabled")
	config.LogFilePath = viper.GetString("log_file_path")
	config.LogMaxSize = viper.GetInt("log_max_size")
	config.LogMaxBackups = viper.GetInt("log_max_backups")
	config.LogMaxAge = viper.GetInt("log_max_age")
	config.Deploy = viper.GetString("deploy")
	config.LocalArtifactsDir = viper.GetString("local_artifacts_dir")
	config.ExtractArtifacts = viper.GetBool("extract_artifacts")
	config.DevMode = viper.GetBool("dev_mode")
	config.SitePath = viper.GetString("site_path")
	config.GeneratePath = viper.GetString("generate_path")
	config.ERDLimit = viper.GetInt("erd_limit")
	config.CORSAllowOrigins = viper.GetStringSlice("cors_allow_origins")
	config.JWTSecret = viper.GetString("jwt_secret")

	if err := viper.UnmarshalKey("rate_limits", &config.RateLimits); err != nil {
		return domain.HostConfig{}, fmt.Errorf("error unmarshaling rate_limits: %w", err)
	}

	if err := viper.UnmarshalKey("github", &config.Github); err != nil {
		return domain.HostConfig{}, fmt.Errorf("error unmarshaling github: %w", err)
	}

	if err := viper.UnmarshalKey("sites", &config.Sites); err != nil {
		return domain.HostConfig{}, fmt.Errorf("error unmarshaling sites: %w", err)
	}

	return config, nil
}
