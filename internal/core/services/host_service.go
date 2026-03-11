package services

import (
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"fmt"
	"io"
	"os"
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

func (s *hostService) log(format string, args ...interface{}) {
	w := s.logOutput
	if w == nil {
		w = os.Stdout
	}
	fmt.Fprintf(w, "[Service] "+format+"\n", args...)
}

func (s *hostService) Start(config domain.HostConfig, repo ports.RegistryRepository) error {
	s.log("Starting host service with config: %+v", config)
	return s.httpServer.Start(config, repo)
}

func (s *hostService) Stop() error {
	s.log("Stopping host service")
	return s.httpServer.Stop()
}

func (s *hostService) GetOn404() <-chan string {
	return s.httpServer.GetOn404()
}

func (s *hostService) SetLogOutput(w io.Writer) {
	s.logOutput = w
	s.httpServer.SetLogOutput(w)
}
