package ports

import (
	"data-host/internal/core/domain"
)

type BootstrapService interface {
	EnsureConfigFile(path string) (bool, domain.CheckResult)
	RunConfigDiscovery(config *domain.HostConfig) []domain.CheckResult
	RunValidationChecks(config *domain.HostConfig) []domain.CheckResult
	RunDatabaseMigrations(config *domain.HostConfig) domain.CheckResult
	ExtractTemplates(config *domain.HostConfig) domain.CheckResult
}
