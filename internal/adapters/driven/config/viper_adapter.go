package config

import (
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"fmt"
	"strings"

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

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return domain.HostConfig{}, fmt.Errorf("error reading config file: %w", err)
		}
		// Config file not found is fine, we use defaults/env
	}

	var config domain.HostConfig
	config.Port = viper.GetInt("port")
	config.FrontendPath = viper.GetString("frontend_path")
	config.DataPath = viper.GetString("data_path")
	config.DatabaseURL = viper.GetString("database_url")

	if err := viper.UnmarshalKey("mounts", &config.Mounts); err != nil {
		return domain.HostConfig{}, fmt.Errorf("error unmarshaling mounts: %w", err)
	}

	return config, nil
}
