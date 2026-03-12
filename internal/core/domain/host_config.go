package domain

type MountPoint struct {
	Path       string `yaml:"path"`
	SourcePath string `yaml:"source_path"`
}

type HostConfig struct {
	Port         int
	FrontendPath string
	DataPath     string
	DatabaseURL  string
	Mounts       []MountPoint
	Debug        bool
	LogLevel     string
	LogFormat    string
	LogOutput    string
}
