package ports

import (
	"data-host/internal/core/domain"
	"io"
)

type HTTPServer interface {
	Start(config domain.HostConfig, repo RegistryRepository) error
	Stop() error
	GetOn404() <-chan string
	SetLogOutput(w io.Writer)
}
