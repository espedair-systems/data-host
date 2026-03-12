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
	viper.SetDefault("frontend_path", "./frontend/dist")
	viper.SetDefault("data_path", "/")
	viper.SetDefault("database_url", "blueprint.db")
	viper.SetDefault("debug", false)
	viper.SetDefault("log_level", "INFO")
	viper.SetDefault("log_format", "json")
	viper.SetDefault("log_output", "stdout")

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			// Create a default config file if it doesn't exist
			log.Info().Msg("Config file not found, creating default config.yaml...")
			if err := viper.SafeWriteConfigAs(v.configPath + "/" + v.configName + "." + v.configType); err != nil {
				log.Warn().Err(err).Msg("Error creating default config")
			}
		} else {
			return domain.HostConfig{}, fmt.Errorf("error reading config file: %w", err)
		}
	}

	var config domain.HostConfig
	config.Port = viper.GetInt("port")
	config.FrontendPath = viper.GetString("frontend_path")
	config.DataPath = viper.GetString("data_path")
	config.DatabaseURL = viper.GetString("database_url")
	config.Debug = viper.GetBool("debug")
	config.LogLevel = viper.GetString("log_level")
	config.LogFormat = viper.GetString("log_format")
	config.LogOutput = viper.GetString("log_output")

	if err := viper.UnmarshalKey("mounts", &config.Mounts); err != nil {
		return domain.HostConfig{}, fmt.Errorf("error unmarshaling mounts: %w", err)
	}

	return config, nil
}
