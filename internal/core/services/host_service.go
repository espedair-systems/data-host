package services

import (
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"fmt"
	"io"
)

type hostService struct {
	httpServer ports.HTTPServer
}

func NewHostService(httpServer ports.HTTPServer) ports.HostService {
	return &hostService{
		httpServer: httpServer,
	}
}

func (s *hostService) Start(config domain.HostConfig, repo ports.RegistryRepository) error {
	fmt.Printf("Starting host service with config: %+v\n", config)
	return s.httpServer.Start(config, repo)
}

func (s *hostService) Stop() error {
	fmt.Println("Stopping host service")
	return s.httpServer.Stop()
}

func (s *hostService) GetOn404() <-chan string {
	return s.httpServer.GetOn404()
}

func (s *hostService) SetLogOutput(w io.Writer) {
	s.httpServer.SetLogOutput(w)
}
