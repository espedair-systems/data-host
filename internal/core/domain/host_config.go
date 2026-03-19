/*
 * Domain Layer: Core business models and logic.
 * This layer is independent of any external frameworks or infrastructure.
 */
package domain

type RateLimitConfig struct {
	ReadRequests  int `yaml:"read_requests" mapstructure:"read_requests" validate:"required,min=1"`
	WriteRequests int `yaml:"write_requests" mapstructure:"write_requests" validate:"required,min=1"`
}

type GithubConfig struct {
	Org   string `yaml:"org" mapstructure:"org"`
	Token string `yaml:"token" mapstructure:"token"`
}

type SiteConfig struct {
	Name        string `yaml:"name" mapstructure:"name" json:"name" validate:"required"`
	Type        string `yaml:"type" mapstructure:"type" json:"type"` // Landing, document, help, Training
	Description string `yaml:"description" mapstructure:"description" json:"description"`
	DataPath    string `yaml:"data_path" mapstructure:"data_path" json:"data_path" validate:"required"`
	SitePath    string `yaml:"site_path" mapstructure:"site_path" json:"site_path"`
	SchemaPath  string `yaml:"schema_path" mapstructure:"schema_path" json:"schema_path"`
	SiteDist    string `yaml:"site_dist" mapstructure:"site_dist" json:"site_dist"`
	PublishURL  string `yaml:"publish_url" mapstructure:"publish_url" json:"publish_url"`
	MountPath   string `yaml:"mount_path" mapstructure:"mount_path" json:"mount_path"`
	MountSource string `yaml:"mount_source" mapstructure:"mount_source" json:"mount_source"`
	MountDist   string `yaml:"mount_dist" mapstructure:"mount_dist" json:"mount_dist"`
	Active      bool   `yaml:"active" mapstructure:"active" json:"active"`
	InDatabase  bool   `yaml:"in_database" mapstructure:"in_database" json:"in_database"`
}

type HostConfig struct {
	Port              int             `yaml:"port" mapstructure:"port" json:"port" validate:"required,min=1,max=65535"`
	DatabaseURL       string          `yaml:"database_url" mapstructure:"database_url" json:"database_url" validate:"required"`
	Debug             bool            `yaml:"debug" mapstructure:"debug" json:"debug"`
	LogLevel          string          `yaml:"log_level" mapstructure:"log_level" json:"log_level" validate:"required,oneof=DEBUG INFO WARN ERROR FATAL"`
	LogFormat         string          `yaml:"log_format" mapstructure:"log_format" json:"log_format" validate:"required,oneof=json pretty"`
	LogOutput         string          `yaml:"log_output" mapstructure:"log_output" json:"log_output" validate:"required"`
	CORSAllowOrigins  []string        `yaml:"cors_allow_origins" mapstructure:"cors_allow_origins" json:"cors_allow_origins" validate:"required,min=1"`
	RateLimits        RateLimitConfig `yaml:"rate_limits" mapstructure:"rate_limits" json:"rate_limits" validate:"required"`
	JWTSecret         string          `yaml:"jwt_secret" mapstructure:"jwt_secret" json:"jwt_secret" validate:"required,min=32"`
	Deploy            string          `yaml:"deploy" mapstructure:"deploy" json:"deploy"`
	LocalArtifactsDir string          `yaml:"local_artifacts_dir" mapstructure:"local_artifacts_dir" json:"local_artifacts_dir"`
	ExtractArtifacts  bool            `yaml:"extract_artifacts" mapstructure:"extract_artifacts" json:"extract_artifacts"`
	DevMode           bool            `yaml:"dev_mode" mapstructure:"dev_mode" json:"dev_mode"`
	SitePath          string          `yaml:"site_path" mapstructure:"site_path" json:"site_path"`
	GeneratePath      string          `yaml:"generate_path" mapstructure:"generate_path" json:"generate_path"`
	ArchivePath       string          `yaml:"archive_path" mapstructure:"archive_path" json:"archive_path"`
	Sites             []SiteConfig    `yaml:"sites" mapstructure:"sites" json:"sites"`
	Github            GithubConfig    `yaml:"github" mapstructure:"github" json:"github"`
	LogFileEnabled    bool            `yaml:"log_file_enabled" mapstructure:"log_file_enabled" json:"log_file_enabled"`
	LogFilePath       string          `yaml:"log_file_path" mapstructure:"log_file_path" json:"log_file_path"`
	LogMaxSize        int             `yaml:"log_max_size" mapstructure:"log_max_size" json:"log_max_size"`
	LogMaxBackups     int             `yaml:"log_max_backups" mapstructure:"log_max_backups" json:"log_max_backups"`
	LogMaxAge         int             `yaml:"log_max_age" mapstructure:"log_max_age" json:"log_max_age"`
}

// ActiveSite returns the currently active site config.
func (c *HostConfig) ActiveSite() SiteConfig {
	for _, s := range c.Sites {
		if s.Active {
			return s
		}
	}
	// Fallback if no sites are active or defined
	if len(c.Sites) > 0 {
		return c.Sites[0]
	}
	return SiteConfig{Name: "default", DataPath: ".", Active: true}
}

// GetSites returns all configured sites.
func (c *HostConfig) GetSites() []SiteConfig {
	if len(c.Sites) > 0 {
		return c.Sites
	}
	return []SiteConfig{c.ActiveSite()}
}
