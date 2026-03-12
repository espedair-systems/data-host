package services

import (
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"io"

	"github.com/rs/zerolog/log"
)

type hostService struct {
	httpServer ports.HTTPServer
	logOutput  io.Writer
}

func NewHostService(httpServer ports.HTTPServer) ports.HostService {
	return &hostService{
		httpServer: httpServer,
	}
}

func (s *hostService) Start(config domain.HostConfig, repo ports.RegistryRepository) error {
	log.Debug().Interface("config", config).Msg("Starting host service")
	return s.httpServer.Start(config, repo)
}

func (s *hostService) Stop() error {
	log.Debug().Msg("Stopping host service")
	return s.httpServer.Stop()
}

func (s *hostService) GetOn404() <-chan string {
	return s.httpServer.GetOn404()
}

func (s *hostService) SetLogOutput(w io.Writer) {
	s.logOutput = w
	s.httpServer.SetLogOutput(w)
}
