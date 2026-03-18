/*
 * Ports: Primary and Secondary interface definitions.
 * Defines the boundaries of the core application.
 */
package ports

import (
	"data-host/internal/core/domain"
	"io"
)

type HostService interface {
	Start(config domain.HostConfig, repo RegistryRepository) error
	Stop() error
	GetOn404() <-chan string
	GetOnRequest() <-chan struct{}
	SetLogOutput(w io.Writer)
	BroadcastMessage(msg string)
}
