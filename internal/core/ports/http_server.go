/*
 * Ports: Primary and Secondary interface definitions.
 * Defines the boundaries of the core application.
 */
package ports

import (
	"data-host/internal/core/domain"
	"io"
)

type HTTPServer interface {
	Start(config domain.HostConfig, repo RegistryRepository) error
	Stop() error
	GetOn404() <-chan string
	GetOnRequest() <-chan struct{}
	GetOnStatus() <-chan int
	SetLogOutput(w io.Writer)
	BroadcastMessage(msg string)
}
