package services

import (
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"io"
	"testing"

	"github.com/stretchr/testify/assert"
)

type mockHTTPServer struct {
	started bool
	stopped bool
}

func (m *mockHTTPServer) Start(config domain.HostConfig, repo ports.RegistryRepository) error {
	m.started = true
	return nil
}

func (m *mockHTTPServer) Stop() error {
	m.stopped = true
	return nil
}

func (m *mockHTTPServer) GetOn404() <-chan string {
	return make(chan string)
}

func (m *mockHTTPServer) SetLogOutput(w io.Writer) {}

func TestHostService(t *testing.T) {
	mockServer := &mockHTTPServer{}
	service := NewHostService(mockServer)

	t.Run("Start", func(t *testing.T) {
		err := service.Start(domain.HostConfig{}, nil)
		assert.NoError(t, err)
		assert.True(t, mockServer.started)
	})

	t.Run("Stop", func(t *testing.T) {
		err := service.Stop()
		assert.NoError(t, err)
		assert.True(t, mockServer.stopped)
	})
}
