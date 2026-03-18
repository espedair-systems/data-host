/*
 * Ports: Primary and Secondary interface definitions.
 * Defines the boundaries of the core application.
 */
package ports

import "data-host/internal/core/domain"

type ConfigProvider interface {
	Load() (domain.HostConfig, error)
}
