package main

import (
	"archive/zip"
	configAdapter "data-host/internal/adapters/driven/config"
	"data-host/internal/adapters/driven/repository"
	"data-host/internal/adapters/driving/http"
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"data-host/internal/core/services"
	"data-host/internal/database"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"

	"github.com/charmbracelet/bubbles/textinput"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

type logMsg string
type route404Msg string

type model struct {
	portInput         textinput.Model
	frontendPathInput textinput.Model
	dataPathInput     textinput.Model
	dbPathInput       textinput.Model
	focusIndex        int
	running           bool
	hostService       ports.HostService
	viewport404       viewport.Model
	viewportLogs      viewport.Model
	errors404         []string
	logs              []string
	width             int
	height            int
	logChan           chan string
}

type chanWriter struct {
	channel chan<- string
}

func (w *chanWriter) Write(p []byte) (n int, err error) {
	w.channel <- string(p)
	return len(p), nil
}

func initialModel() model {
	configLoader := configAdapter.NewViperAdapter("config", "yaml", ".")
	config, err := configLoader.Load()
	if err != nil {
		config = domain.HostConfig{
			Port:         8080,
			FrontendPath: "./frontend/dist",
			DataPath:     "/",
			DatabaseURL:  "blueprint.db",
		}
	}

	p := textinput.New()
	p.SetValue(strconv.Itoa(config.Port))
	p.Focus()

	f := textinput.New()
	f.SetValue(config.FrontendPath)

	d := textinput.New()
	d.SetValue(config.DataPath)

	db := textinput.New()
	db.SetValue(config.DatabaseURL)

	httpAdapter := http.NewGinAdapter()

	vp404 := viewport.New(0, 0)
	vp404.Style = lipgloss.NewStyle().Border(lipgloss.RoundedBorder()).BorderForeground(lipgloss.Color("202"))

	vpLogs := viewport.New(0, 0)
	vpLogs.Style = lipgloss.NewStyle().Border(lipgloss.RoundedBorder()).BorderForeground(lipgloss.Color("63"))

	return model{
		portInput:         p,
		frontendPathInput: f,
		dataPathInput:     d,
		dbPathInput:       db,
		hostService:       services.NewHostService(httpAdapter),
		viewport404:       vp404,
		viewportLogs:      vpLogs,
		logChan:           make(chan string, 100),
	}
}

func (m model) Init() tea.Cmd {
	return textinput.Blink
}

func openBrowser(url string) {
	var err error
	switch runtime.GOOS {
	case "linux":
		err = exec.Command("xdg-open", url).Start()
	case "windows":
		err = exec.Command("rundll32", "url.dll,FileProtocolHandler", url).Start()
	case "darwin":
		err = exec.Command("open", url).Start()
	}
	if err != nil {
		log.Printf("Error opening browser: %v", err)
	}
}

func listenForEvents(m model) tea.Cmd {
	return func() tea.Msg {
		select {
		case route := <-m.hostService.GetOn404():
			return route404Msg(route)
		case l := <-m.logChan:
			return logMsg(l)
		}
	}
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmd tea.Cmd
	var cmds []tea.Cmd

	switch msg := msg.(type) {
	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q":
			if m.running {
				_ = m.hostService.Stop()
			}
			return m, tea.Quit

		case "tab", "shift+tab", "up", "down":
			if m.running {
				m.viewport404, cmd = m.viewport404.Update(msg)
				cmds = append(cmds, cmd)
				m.viewportLogs, cmd = m.viewportLogs.Update(msg)
				cmds = append(cmds, cmd)
				return m, tea.Batch(cmds...)
			}

			s := msg.String()
			if s == "up" || s == "shift+tab" {
				m.focusIndex--
			} else {
				m.focusIndex++
			}
			if m.focusIndex > 3 {
				m.focusIndex = 0
			} else if m.focusIndex < 0 {
				m.focusIndex = 3
			}
			m.portInput.Blur()
			m.frontendPathInput.Blur()
			m.dataPathInput.Blur()
			m.dbPathInput.Blur()
			switch m.focusIndex {
			case 0:
				cmds = append(cmds, m.portInput.Focus())
			case 1:
				cmds = append(cmds, m.frontendPathInput.Focus())
			case 2:
				cmds = append(cmds, m.dataPathInput.Focus())
			case 3:
				cmds = append(cmds, m.dbPathInput.Focus())
			}

		case "enter":
			if !m.running {
				port, _ := strconv.Atoi(m.portInput.Value())
				config := domain.HostConfig{
					Port:         port,
					FrontendPath: m.frontendPathInput.Value(),
					DataPath:     m.dataPathInput.Value(),
					DatabaseURL:  m.dbPathInput.Value(),
				}

				var repo ports.RegistryRepository
				appEnv := os.Getenv("APP_ENV")
				if appEnv == "production" || appEnv == "publish" {
					repo = repository.NewFilesystemRepository(config)
				} else {
					db := database.New(config.DatabaseURL)
					repo, _ = repository.NewSQLiteRepository(db.GetDB(), config)
				}

				m.hostService.SetLogOutput(&chanWriter{channel: m.logChan})
				m.running = true
				go func(lc chan string) {
					if err := m.hostService.Start(config, repo); err != nil {
						lc <- fmt.Sprintf("[Fatal] Server Error: %v", err)
					}
				}(m.logChan)

				openBrowser(fmt.Sprintf("http://localhost:%d/home", port))
				return m, listenForEvents(m)
			}
		}

	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		// Title (1) + Title Margin (1) + Labels (2) + Borders (4) + Footer (1) = 9
		// Using 11 to be safe and avoid any potential wrapping issues
		vHeight := (m.height - 11) / 2
		if vHeight < 1 {
			vHeight = 1
		}
		m.viewport404.Width = m.width - 2
		m.viewport404.Height = vHeight
		m.viewportLogs.Width = m.width - 2
		m.viewportLogs.Height = vHeight

	case route404Msg:
		m.errors404 = append(m.errors404, string(msg))
		m.viewport404.SetContent(strings.Join(m.errors404, "\n"))
		m.viewport404.GotoBottom()
		return m, listenForEvents(m)

	case logMsg:
		l := strings.TrimSpace(string(msg))
		if l != "" {
			// Handle multi-line log messages
			lines := strings.Split(l, "\n")
			for _, line := range lines {
				trimmed := strings.TrimSpace(line)
				if trimmed != "" {
					m.logs = append(m.logs, trimmed)
				}
			}
			// Keep log history reasonable
			if len(m.logs) > 500 {
				m.logs = m.logs[len(m.logs)-500:]
			}
			m.viewportLogs.SetContent(strings.Join(m.logs, "\n"))
			m.viewportLogs.GotoBottom()
		}
		return m, listenForEvents(m)
	}

	if !m.running {
		m.portInput, cmd = m.portInput.Update(msg)
		cmds = append(cmds, cmd)
		m.frontendPathInput, cmd = m.frontendPathInput.Update(msg)
		cmds = append(cmds, cmd)
		m.dataPathInput, cmd = m.dataPathInput.Update(msg)
		cmds = append(cmds, cmd)
		m.dbPathInput, cmd = m.dbPathInput.Update(msg)
		cmds = append(cmds, cmd)
	}

	return m, tea.Batch(cmds...)
}

func (m model) View() string {
	if !m.running {
		var s strings.Builder
		s.WriteString(titleStyle.Render("DATA-HOST") + "\n\n")
		s.WriteString("Configure and start the service:\n\n")

		renderInput := func(label string, input textinput.Model, index int) {
			if m.focusIndex == index {
				s.WriteString(focusedStyle.Render("> "+label+": ") + input.View() + "\n")
			} else {
				s.WriteString("  " + label + ": " + input.View() + "\n")
			}
		}

		renderInput("Port", m.portInput, 0)
		renderInput("Frontend Path", m.frontendPathInput, 1)
		renderInput("Data Path", m.dataPathInput, 2)
		renderInput("Database Path", m.dbPathInput, 3)

		s.WriteString("\n" + statusStopped.Render("STOPPED") + "\n\n")
		s.WriteString("Press Enter to START and launch browser\n")
		s.WriteString("Press Q or Ctrl+C to quit\n")
		return s.String()
	}

	return lipgloss.JoinVertical(lipgloss.Left,
		titleStyle.Render("DATA-HOST - RUNNING"),
		lipgloss.NewStyle().Foreground(lipgloss.Color("202")).Bold(true).Render(" 404 Errors (History):"),
		m.viewport404.View(),
		lipgloss.NewStyle().Foreground(lipgloss.Color("63")).Bold(true).Render(" Server Logs:"),
		m.viewportLogs.View(),
		" Press Q or Ctrl+C to stop and quit | Use Up/Down/Arrows to scroll",
	)
}

var (
	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#FAFAFA")).
			Background(lipgloss.Color("#7D56F4")).
			Padding(0, 1).
			MarginBottom(1)

	focusedStyle  = lipgloss.NewStyle().Foreground(lipgloss.Color("205"))
	statusStopped = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#FF0000")).
			Padding(0, 1)
)

func unzip(src string, dest string) error {
	r, err := zip.OpenReader(src)
	if err != nil {
		return err
	}
	defer r.Close()

	for _, f := range r.File {
		fpath := filepath.Join(dest, f.Name)

		// Check for ZipSlip vulnerability
		if !strings.HasPrefix(fpath, filepath.Clean(dest)+string(os.PathSeparator)) {
			return fmt.Errorf("%s: illegal file path", fpath)
		}

		if f.FileInfo().IsDir() {
			os.MkdirAll(fpath, os.ModePerm)
			continue
		}

		if err = os.MkdirAll(filepath.Dir(fpath), os.ModePerm); err != nil {
			return err
		}

		outFile, err := os.OpenFile(fpath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			return err
		}

		rc, err := f.Open()
		if err != nil {
			return err
		}

		_, err = io.Copy(outFile, rc)

		outFile.Close()
		rc.Close()

		if err != nil {
			return err
		}
	}
	return nil
}

func main() {
	// Check for dist.zip in data-service or data-services
	targets := []string{"./data-service/dist.zip", "./data-services/dist.zip"}
	for _, zipPath := range targets {
		if _, err := os.Stat(zipPath); err == nil {
			dest := filepath.Dir(zipPath)
			fmt.Printf("Found %s, unzipping to %s...\n", zipPath, dest)
			if err := unzip(zipPath, dest); err != nil {
				fmt.Printf("Error unzipping %s: %v\n", zipPath, err)
			} else {
				fmt.Printf("Successfully unzipped %s\n", zipPath)
			}
			// Only unzip the first one found
			break
		}
	}

	p := tea.NewProgram(initialModel(), tea.WithAltScreen(), tea.WithMouseCellMotion())
	if _, err := p.Run(); err != nil {
		fmt.Printf("Error running TUI: %v", err)
		os.Exit(1)
	}
}
