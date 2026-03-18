/*
 * Application Layer: Business Use Cases.
 * Coordinates domain objects to perform specific application tasks.
 */
package services

import (
	"data-host/artifacts"
	appConfig "data-host/internal/adapters/driving/config"
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"data-host/internal/database"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"strings"
)

type bootstrapService struct{}

func NewBootstrapService() ports.BootstrapService {
	return &bootstrapService{}
}

func (s *bootstrapService) ExtractTemplates(config *domain.HostConfig) domain.CheckResult {
	dest := config.LocalArtifactsDir
	if dest == "" {
		dest = "./artifacts"
	}

	// Create artifacts/templates specifically if it doesn't exist
	templatesDir := filepath.Join(dest, "templates")
	if err := os.MkdirAll(templatesDir, 0755); err != nil {
		return domain.CheckResult{OK: false, Text: fmt.Sprintf("[FAIL] Failed to create template directory: %v", err)}
	}

	// Extract everything (this includes templates)
	if err := artifacts.ExtractTo(dest); err != nil {
		return domain.CheckResult{OK: false, Text: fmt.Sprintf("[FAIL] Failed to extract templates: %v", err)}
	}

	return domain.CheckResult{OK: true, Text: fmt.Sprintf("[ OK ] Templates extracted/verified in %s", templatesDir)}
}

func (s *bootstrapService) EnsureConfigFile(path string) (bool, domain.CheckResult) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		defaultCfg := appConfig.GetDefaults()

		// Perform initial site discovery to populate the new config
		discovered, _, _ := s.discoverSites(defaultCfg.SitePath)
		if len(discovered) > 0 {
			defaultCfg.Sites = discovered
		}

		if err := appConfig.SaveWithComments(path, defaultCfg); err != nil {
			return false, domain.CheckResult{OK: false, Text: fmt.Sprintf("Error generating default config: %v", err)}
		}
		return true, domain.CheckResult{OK: true, Text: fmt.Sprintf("Default configuration generated at '%s' with %d discovered sites.", path, len(discovered))}
	}
	return false, domain.CheckResult{OK: true, Text: fmt.Sprintf("Configuration file '%s' found", path)}
}

func (s *bootstrapService) RunConfigDiscovery(config *domain.HostConfig) []domain.CheckResult {
	if strings.ToUpper(config.Deploy) == "IDE" {
		return []domain.CheckResult{{OK: true, Text: "Deployment mode 'IDE' detected. Using fixed site configuration from config.yaml."}}
	}

	var results []CheckResultBuilder
	results = append(results, CheckResultBuilder{OK: true, Text: fmt.Sprintf("Searching for Astro sites in %s directory...", config.SitePath)})

	discoveredSites, found, logs := s.discoverSites(config.SitePath)
	for _, logMsg := range logs {
		results = append(results, CheckResultBuilder{OK: true, Text: logMsg})
	}

	if found > 0 {
		newSites := []domain.SiteConfig{}
		// Keep existing sites that aren't the example placeholder
		for _, s := range config.Sites {
			if s.Name != "example-site" {
				newSites = append(newSites, s)
			} else {
				results = append(results, CheckResultBuilder{OK: true, Text: "[INFO] Removing placeholder 'example-site'"})
			}
		}

		// Merge discovered sites
		for _, ds := range discoveredSites {
			exists := false
			for _, s := range newSites {
				if s.Name == ds.Name {
					exists = true
					break
				}
			}
			if !exists {
				newSites = append(newSites, ds)
				results = append(results, CheckResultBuilder{OK: true, Text: fmt.Sprintf("  Added %s to configuration", ds.Name)})
			}
		}
		config.Sites = newSites
	}

	if found == 0 {
		results = append(results, CheckResultBuilder{OK: true, Text: "[WARN] No Astro sites discovered."})
	} else {
		results = append(results, CheckResultBuilder{OK: true, Text: fmt.Sprintf("[ OK ] %d sites discovered and ready for use.", found)})
	}

	return toResults(results)
}

func (s *bootstrapService) discoverSites(sitesDir string) ([]domain.SiteConfig, int, []string) {
	var discovered []domain.SiteConfig
	var logs []string
	found := 0

	if sitesDir == "" {
		cwd, _ := os.Getwd()
		sitesDir = filepath.Join(cwd, "sites")
	}

	if _, err := os.Stat(sitesDir); os.IsNotExist(err) {
		return discovered, 0, []string{fmt.Sprintf("[WARN] Site directory '%s' not found. Skipping auto-discovery.", sitesDir)}
	}

	entries, err := os.ReadDir(sitesDir)
	if err != nil {
		return discovered, 0, []string{fmt.Sprintf("[FAIL] Failed to read directory '%s': %v", sitesDir, err)}
	}

	for _, entry := range entries {
		if entry.IsDir() {
			siteRoot := filepath.Join(sitesDir, entry.Name())
			name := entry.Name()
			found++
			logs = append(logs, fmt.Sprintf("[FOUND] Site Directory: %s", name))

			discovered = append(discovered, domain.SiteConfig{
				Name:        name,
				DataPath:    siteRoot,
				MountPath:   "/host/" + name,
				MountSource: siteRoot,
				MountDist:   filepath.Join(siteRoot, "dist"),
				Active:      true,
			})
			logs = append(logs, fmt.Sprintf("  Mapped %s to /host/%s", name, name))
		}
	}

	return discovered, found, logs
}

func (s *bootstrapService) RunValidationChecks(config *domain.HostConfig) []domain.CheckResult {
	var results []CheckResultBuilder

	cwd, _ := os.Getwd()
	results = append(results, CheckResultBuilder{OK: true, Text: "Initializing Data-Host Validation Sequence..."})
	results = append(results, CheckResultBuilder{OK: true, Text: fmt.Sprintf("Working Directory: %s", cwd)})

	// Port check
	ln, err := net.Listen("tcp", fmt.Sprintf(":%d", config.Port))
	if err != nil {
		results = append(results, CheckResultBuilder{OK: false, Text: fmt.Sprintf("Port %d is NOT available: %v", config.Port, err)})
	} else {
		results = append(results, CheckResultBuilder{OK: true, Text: fmt.Sprintf("Port %d is available", config.Port)})
		ln.Close()
	}

	// Frontend Path
	staticPaths := []string{"./frontend/dist", "dist/frontend", "./ui"}
	foundStatic := false
	for _, p := range staticPaths {
		if _, err := os.Stat(p); err == nil {
			results = append(results, CheckResultBuilder{OK: true, Text: fmt.Sprintf("Static assets found on disk: %s", p)})
			foundStatic = true
			break
		}
	}
	if !foundStatic {
		results = append(results, CheckResultBuilder{OK: true, Text: "Using embedded static assets (No local 'dist' found)"})
	}

	// Site-specific Data Path Validation
	activeSites := 0
	for _, site := range config.Sites {
		if !site.Active {
			continue
		}
		activeSites++
		results = append(results, CheckResultBuilder{OK: true, Text: fmt.Sprintf("Validating Site: %s", site.Name)})

		if _, err := os.Stat(site.DataPath); os.IsNotExist(err) {
			results = append(results, CheckResultBuilder{OK: false, Text: fmt.Sprintf("  [FAIL] Data path does NOT exist: %s", site.DataPath)})
		} else {
			results = append(results, CheckResultBuilder{OK: true, Text: fmt.Sprintf("  [ OK ] Data path found: %s", site.DataPath)})
			dataPath := filepath.Join(site.DataPath, "data")
			if _, err := os.Stat(dataPath); os.IsNotExist(err) {
				results = append(results, CheckResultBuilder{OK: false, Text: fmt.Sprintf("  [FAIL] Schema data directory NOT found: %s", dataPath)})
			} else {
				entries, _ := os.ReadDir(dataPath)
				var schemas []string
				for _, e := range entries {
					if e.IsDir() {
						schemas = append(schemas, e.Name())
					}
				}
				results = append(results, CheckResultBuilder{OK: true, Text: fmt.Sprintf("  [ OK ] Schema data directory found with %d entries", len(schemas))})
			}
		}
	}

	if activeSites == 0 {
		results = append(results, CheckResultBuilder{OK: false, Text: "No active sites found in configuration"})
	}

	// Database
	if _, err := os.Stat(filepath.Dir(config.DatabaseURL)); os.IsNotExist(err) {
		results = append(results, CheckResultBuilder{OK: false, Text: fmt.Sprintf("Database directory does NOT exist: %s", filepath.Dir(config.DatabaseURL))})
	} else {
		results = append(results, CheckResultBuilder{OK: true, Text: "Database directory is persistent"})
	}

	// Auth
	if len(config.JWTSecret) < 32 {
		msg := "JWT Secret is too short (min 32 chars)"
		if config.DevMode {
			results = append(results, CheckResultBuilder{OK: true, Text: fmt.Sprintf("%s - WARN (Bypassed in Dev Mode)", msg)})
		} else {
			results = append(results, CheckResultBuilder{OK: false, Text: msg})
		}
	} else {
		results = append(results, CheckResultBuilder{OK: true, Text: "JWT Security initialized"})
	}

	// Logging Configuration Status
	logStatus := "Log to File: DISABLED"
	if config.LogFileEnabled {
		logStatus = fmt.Sprintf("Log to File: ENABLED -> %s", config.LogFilePath)
	}
	results = append(results, CheckResultBuilder{OK: true, Text: logStatus})

	return toResults(results)
}

func (s *bootstrapService) RunDatabaseMigrations(config *domain.HostConfig) domain.CheckResult {
	_ = os.Setenv("MIGRATE_ON_STARTUP", "true")
	db := database.New(config.DatabaseURL)
	err := database.RunMigrations(db.GetDB())
	if err != nil {
		return domain.CheckResult{OK: false, Text: fmt.Sprintf("[FAIL] Migration error: %v", err)}
	}
	return domain.CheckResult{OK: true, Text: "[ OK ] Database initialization finished."}
}

type CheckResultBuilder struct {
	OK   bool
	Text string
}

func toResults(builders []CheckResultBuilder) []domain.CheckResult {
	res := make([]domain.CheckResult, len(builders))
	for i, b := range builders {
		res[i] = domain.CheckResult{OK: b.OK, Text: b.Text}
	}
	return res
}
