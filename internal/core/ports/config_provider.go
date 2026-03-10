package ports

import "data-host/internal/core/domain"

type ConfigProvider interface {
	Load() (domain.HostConfig, error)
}
