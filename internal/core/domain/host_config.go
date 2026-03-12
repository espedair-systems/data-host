package domain

type MountPoint struct {
	Path       string `yaml:"path" validate:"required"`
	SourcePath string `yaml:"source_path" validate:"required"`
}

type HostConfig struct {
	Port         int          `yaml:"port" validate:"required,min=1,max=65535"`
	FrontendPath string       `yaml:"frontend_path" validate:"required"`
	DataPath     string       `yaml:"data_path" validate:"required"`
	DatabaseURL  string       `yaml:"database_url" validate:"required"`
	Mounts       []MountPoint `yaml:"mounts" validate:"dive"`
	Debug        bool         `yaml:"debug"`
	LogLevel     string       `yaml:"log_level" validate:"required,oneof=DEBUG INFO WARN ERROR FATAL"`
	LogFormat    string       `yaml:"log_format" validate:"required,oneof=json pretty"`
	LogOutput    string       `yaml:"log_output" validate:"required"`
}
