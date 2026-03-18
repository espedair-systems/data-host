/*
 * Entry Point: Application Bootstrap.
 * Responsible for initializing dependencies and starting the application.
 */
package main

import (
	"data-host/internal/adapters/driven/repository"
	"data-host/internal/adapters/driving/http"
	"data-host/internal/adapters/driving/logger"
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"data-host/internal/core/services"
	"data-host/internal/database"
	"fmt"
	"log"
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/charmbracelet/bubbles/textinput"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

type state int

const (
	stateConfig state = iota
	stateValidation
	stateDatabase
	stateLogging
)

type logMsg string
type errorMsg string
type route404Msg string
type requestMsg struct{}
type tickMsg time.Time

type model struct {
	state                  state
	portInput              textinput.Model
	dataPathInput          textinput.Model
	dbPathInput            textinput.Model
	focusIndex             int
	running                bool
	hostService            ports.HostService
	bootstrap              ports.BootstrapService
	viewport404            viewport.Model
	viewportLogs           viewport.Model
	viewportBoot           viewport.Model
	viewportDB             viewport.Model
	viewportConfig         viewport.Model
	viewportConfigReadOnly viewport.Model
	errors404              []string
	logs                   []string
	validationRes          []domain.CheckResult
	configRes              []domain.CheckResult
	dbLogs                 []string
	width                  int
	height                 int
	logChan                chan string
	errorChan              chan string
	config                 domain.HostConfig

	// Metrics
	requestCount     int
	error404Count    int
	requestRate      float64
	lastRequestTimes []time.Time
}

type chanWriter struct {
	channel chan<- string
}

func (w *chanWriter) Write(p []byte) (n int, err error) {
	w.channel <- string(p)
	return len(p), nil
}

func initialModel(config domain.HostConfig) model {
	p := textinput.New()
	p.SetValue(strconv.Itoa(config.Port))

	d := textinput.New()
	activeSite := config.ActiveSite()
	d.SetValue(activeSite.DataPath)

	db := textinput.New()
	db.SetValue(config.DatabaseURL)

	httpAdapter := http.NewGinAdapter()

	vp404 := viewport.New(0, 0)
	vp404.Style = lipgloss.NewStyle().Border(lipgloss.RoundedBorder()).BorderForeground(lipgloss.Color("202"))

	vpLogs := viewport.New(0, 0)
	vpLogs.Style = lipgloss.NewStyle().Border(lipgloss.RoundedBorder()).BorderForeground(lipgloss.Color("63"))

	vpBoot := viewport.New(0, 0)
	vpBoot.Style = lipgloss.NewStyle().Border(lipgloss.RoundedBorder()).BorderForeground(lipgloss.Color("86"))

	vpDB := viewport.New(0, 0)
	vpDB.Style = lipgloss.NewStyle().Border(lipgloss.RoundedBorder()).BorderForeground(lipgloss.Color("214"))

	vpConfig := viewport.New(0, 0)
	vpConfig.Style = lipgloss.NewStyle().Border(lipgloss.RoundedBorder()).BorderForeground(lipgloss.Color("39"))

	vpConfigRO := viewport.New(0, 0)
	vpConfigRO.Style = lipgloss.NewStyle().Border(lipgloss.RoundedBorder()).BorderForeground(lipgloss.Color("99"))

	m := model{
		state:                  stateConfig,
		portInput:              p,
		dataPathInput:          d,
		dbPathInput:            db,
		running:                false,
		hostService:            services.NewHostService(httpAdapter),
		bootstrap:              services.NewBootstrapService(),
		viewport404:            vp404,
		viewportLogs:           vpLogs,
		viewportBoot:           vpBoot,
		viewportDB:             vpDB,
		viewportConfig:         vpConfig,
		viewportConfigReadOnly: vpConfigRO,
		logChan:                make(chan string, 100),
		errorChan:              make(chan string, 100),
		config:                 config,
	}

	m.runConfigDiscovery()
	return m
}

func (m *model) runBootChecks() {
	m.validationRes = m.bootstrap.RunValidationChecks(&m.config)

	var content strings.Builder
	failCount := 0
	for _, msg := range m.validationRes {
		prefix := lipgloss.NewStyle().Foreground(lipgloss.Color("10")).Render("[ OK ] ")
		textStyle := lipgloss.NewStyle().Foreground(lipgloss.Color("15"))
		if !msg.OK {
			prefix = lipgloss.NewStyle().Foreground(lipgloss.Color("9")).Bold(true).Render("[FAIL] ")
			textStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("9"))
			failCount++
		}
		content.WriteString(prefix + textStyle.Render(msg.Text) + "\n")
	}

	header := lipgloss.NewStyle().Foreground(lipgloss.Color("11")).Bold(true).Render(fmt.Sprintf("Results: %d Passed, %d Failed", len(m.validationRes)-failCount, failCount))
	m.viewportBoot.SetContent(header + "\n\n" + content.String())
}

func (m *model) runConfigDiscovery() {
	m.configRes = m.bootstrap.RunConfigDiscovery(&m.config)
	var content strings.Builder
	for _, res := range m.configRes {
		content.WriteString(res.Text + "\n")
	}
	m.viewportConfig.SetContent(content.String())
	m.setReadOnlyConfig()
}

func (m *model) setReadOnlyConfig() {
	var sb strings.Builder
	c := m.config
	sb.WriteString(fmt.Sprintf(" Database URL:      %s\n", c.DatabaseURL))
	sb.WriteString(fmt.Sprintf(" Site Path:         %s\n", c.SitePath))
	sb.WriteString(fmt.Sprintf(" Generate Path:     %s\n", c.GeneratePath))
	sb.WriteString(fmt.Sprintf(" Local Artifacts:   %s\n", c.LocalArtifactsDir))
	sb.WriteString(fmt.Sprintf(" Deploy Mode:       %s\n", c.Deploy))
	sb.WriteString(fmt.Sprintf(" Port:              %d\n", c.Port))
	sb.WriteString(fmt.Sprintf(" Rate Limits:       Read=%d, Write=%d\n", c.RateLimits.ReadRequests, c.RateLimits.WriteRequests))
	sb.WriteString(fmt.Sprintf(" Log Settings:      Level=%s, Format=%s, Output=%s\n", c.LogLevel, c.LogFormat, c.LogOutput))
	if c.LogFileEnabled {
		sb.WriteString(fmt.Sprintf(" File Logging:      Path=%s, MaxSize=%dMB, MaxBackups=%d, MaxAge=%d days\n",
			c.LogFilePath, c.LogMaxSize, c.LogMaxBackups, c.LogMaxAge))
	}

	if strings.ToUpper(c.Deploy) == "IDE" {
		sb.WriteString("\n Configured Sites (IDE Mode):\n")
		for _, site := range c.Sites {
			sb.WriteString(fmt.Sprintf("  - %s (%s) -> %s\n", site.Name, site.Type, site.PublishURL))
		}
	}

	m.viewportConfigReadOnly.SetContent(sb.String())
}

func (m model) allListeners() tea.Cmd {
	return tea.Batch(
		listenFor404(m),
		listenForRequests(m),
		listenForLogs(m),
		listenForErrors(m),
	)
}

func (m model) Init() tea.Cmd {
	return tea.Batch(textinput.Blink, tick(), m.allListeners())
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

func (m model) saveLog() string {
	var filename string
	var content strings.Builder
	switch m.state {
	case stateConfig:
		filename = "tui_config.log"
		for _, res := range m.configRes {
			content.WriteString(res.Text + "\n")
		}
	case stateValidation:
		filename = "tui_validation.log"
		for _, msg := range m.validationRes {
			status := "[ OK ] "
			if !msg.OK {
				status = "[FAIL] "
			}
			content.WriteString(status + msg.Text + "\n")
		}
	case stateDatabase:
		filename = "tui_database.log"
		content.WriteString(strings.Join(m.dbLogs, "\n"))
	case stateLogging:
		filename = "tui_logging.log"
		content.WriteString(strings.Join(m.logs, "\n"))
	}

	if filename != "" {
		_ = os.WriteFile(filename, []byte(content.String()), 0644)
		return filename
	}
	return ""
}

func listenFor404(m model) tea.Cmd {
	return func() tea.Msg {
		route := <-m.hostService.GetOn404()
		return route404Msg(route)
	}
}

func listenForRequests(m model) tea.Cmd {
	return func() tea.Msg {
		<-m.hostService.GetOnRequest()
		return requestMsg{}
	}
}

func listenForLogs(m model) tea.Cmd {
	return func() tea.Msg {
		l := <-m.logChan
		return logMsg(l)
	}
}

func listenForErrors(m model) tea.Cmd {
	return func() tea.Msg {
		e := <-m.errorChan
		return errorMsg(e)
	}
}

func tick() tea.Cmd {
	return tea.Tick(time.Second, func(t time.Time) tea.Msg {
		return tickMsg(t)
	})
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

		case "l":
			filename := m.saveLog()
			if filename != "" {
				if m.state == stateLogging || m.state == stateDatabase {
					m.logChan <- fmt.Sprintf("UI Report saved to %s", filename)
				}
			}
			return m, nil

		case "h":
			if m.running {
				m.hostService.BroadcastMessage("Hello")
				m.logChan <- "Broadcasted 'Hello' message to clients"
			}
			return m, nil

		case "tab", "shift+tab", "up", "down":
			if m.state == stateLogging {
				m.viewport404, cmd = m.viewport404.Update(msg)
				cmds = append(cmds, cmd)
				m.viewportLogs, cmd = m.viewportLogs.Update(msg)
				cmds = append(cmds, cmd)
				return m, tea.Batch(cmds...)
			}

			if m.state == stateValidation {
				m.viewportBoot, cmd = m.viewportBoot.Update(msg)
				return m, cmd
			}

			if m.state == stateDatabase {
				m.viewportDB, cmd = m.viewportDB.Update(msg)
				return m, cmd
			}

			if m.state == stateConfig {
				m.viewportConfig, cmd = m.viewportConfig.Update(msg)
				cmds = append(cmds, cmd)
				m.viewportConfigReadOnly, cmd = m.viewportConfigReadOnly.Update(msg)
				cmds = append(cmds, cmd)
				return m, tea.Batch(cmds...)
			}

		case "enter":
			if m.state == stateConfig {
				m.state = stateValidation
				m.runBootChecks()
				return m, nil
			}

			if m.state == stateValidation {
				m.state = stateDatabase
				logger.InitTUI(m.config, &logger.TUIWriter{
					TopWindow:    &chanWriter{channel: m.logChan},
					BottomWindow: &chanWriter{channel: m.logChan},
				})
				return m, m.runDatabaseChecks()
			}

			if m.state == stateDatabase {
				config := m.config

				var repo ports.RegistryRepository
				appEnv := os.Getenv("APP_ENV")
				if appEnv == "production" || appEnv == "publish" {
					repo = repository.NewFilesystemRepository(config)
				} else {
					db := database.New(config.DatabaseURL)
					repo, _ = repository.NewSQLiteRepository(db.GetDB(), config)
				}

				logger.InitTUI(config, &logger.TUIWriter{
					TopWindow:    &chanWriter{channel: m.errorChan},
					BottomWindow: &chanWriter{channel: m.logChan},
				})

				m.running = true
				m.state = stateLogging
				go func(lc chan string) {
					if err := m.hostService.Start(config, repo); err != nil {
						lc <- fmt.Sprintf("[Fatal] Server Error: %v", err)
					}
				}(m.logChan)

				openBrowser(fmt.Sprintf("http://localhost:%d/home", config.Port))
				return m, nil
			}
		}

	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height

		m.viewportBoot.Width = m.width - 2
		m.viewportBoot.Height = m.height - 12

		m.viewportDB.Width = m.width - 2
		m.viewportDB.Height = m.height - 12

		m.viewportConfig.Width = m.width - 2
		m.viewportConfigReadOnly.Width = m.width - 2

		vHeightConfig := (m.height - 14) / 2
		if vHeightConfig < 1 {
			vHeightConfig = 1
		}
		m.viewportConfig.Height = vHeightConfig
		m.viewportConfigReadOnly.Height = vHeightConfig

		// Adjusted for metrics bar and potential log window removal
		reservedHeight := 10
		if m.config.LogFileEnabled {
			vHeight := m.height - reservedHeight
			if vHeight < 1 {
				vHeight = 1
			}
			m.viewport404.Width = m.width - 2
			m.viewport404.Height = vHeight
		} else {
			reservedHeight = 14
			vHeight := (m.height - reservedHeight) / 2
			// Ensure minimum heights to prevent viewport panics
			if vHeight < 1 {
				vHeight = 1
			}
			m.viewport404.Width = m.width - 2
			m.viewport404.Height = vHeight
			m.viewportLogs.Width = m.width - 2
			m.viewportLogs.Height = vHeight
		}

	case requestMsg:
		m.requestCount++
		m.lastRequestTimes = append(m.lastRequestTimes, time.Now())
		return m, listenForRequests(m)

	case tickMsg:
		// Calculate rate over last 10 seconds
		now := time.Time(msg)
		cutoff := now.Add(-10 * time.Second)
		valid := 0
		for _, t := range m.lastRequestTimes {
			if t.After(cutoff) {
				valid++
			}
		}
		m.requestRate = float64(valid) / 10.0
		if valid < len(m.lastRequestTimes) {
			m.lastRequestTimes = m.lastRequestTimes[len(m.lastRequestTimes)-valid:]
		}
		return m, tick()

	case route404Msg:
		m.error404Count++
		m.errors404 = append(m.errors404, string(msg))
		if !m.config.LogFileEnabled && m.viewport404.Height > 0 {
			m.viewport404.SetContent(strings.Join(m.errors404, "\n"))
			m.viewport404.GotoBottom()
		}
		return m, listenFor404(m)

	case errorMsg:
		m.errors404 = append(m.errors404, "[ERROR] "+string(msg))
		if !m.config.LogFileEnabled && m.viewport404.Height > 0 {
			m.viewport404.SetContent(strings.Join(m.errors404, "\n"))
			m.viewport404.GotoBottom()
		}
		return m, listenForErrors(m)

	case logMsg:
		l := strings.TrimSpace(string(msg))
		if l != "" {
			lines := strings.Split(l, "\n")
			for _, line := range lines {
				trimmed := strings.TrimSpace(line)
				if trimmed == "" {
					continue
				}
				if m.state == stateDatabase {
					m.dbLogs = append(m.dbLogs, trimmed)
				} else {
					m.logs = append(m.logs, trimmed)
				}
			}

			if m.state == stateDatabase {
				if len(m.dbLogs) > 500 {
					m.dbLogs = m.dbLogs[len(m.dbLogs)-500:]
				}
				m.viewportDB.SetContent(strings.Join(m.dbLogs, "\n"))
				if m.viewportDB.Height > 0 {
					m.viewportDB.GotoBottom()
				}
			} else if !m.config.LogFileEnabled {
				if len(m.logs) > 500 {
					m.logs = m.logs[len(m.logs)-500:]
				}
				m.viewportLogs.SetContent(strings.Join(m.logs, "\n"))
				if m.viewportLogs.Height > 0 {
					m.viewportLogs.GotoBottom()
				}
			}
		}
		return m, listenForLogs(m)
	}

	return m, tea.Batch(cmds...)
}

func (m model) runDatabaseChecks() tea.Cmd {
	return func() tea.Msg {
		res := m.bootstrap.RunDatabaseMigrations(&m.config)
		return logMsg(res.Text)
	}
}

func (m model) View() string {
	var s strings.Builder

	switch m.state {
	case stateConfig:
		s.WriteString(titleStyle.Render("DATA-HOST - CONFIG BUILD") + "\n\n")
		s.WriteString(lipgloss.NewStyle().Foreground(lipgloss.Color("208")).Bold(true).Render(" [!] NOT RUNNING: Backend service will start after synchronization.") + "\n\n")

		s.WriteString(lipgloss.NewStyle().Foreground(lipgloss.Color("99")).Bold(true).Render(" Active Configuration:") + "\n")
		s.WriteString(m.viewportConfigReadOnly.View() + "\n\n")

		s.WriteString(lipgloss.NewStyle().Foreground(lipgloss.Color("39")).Bold(true).Render(" Discovery Messages:") + "\n")
		s.WriteString(m.viewportConfig.View() + "\n\n")

		s.WriteString(" " + helpStyle.Render("ENTER") + " PROCEED to Validation | " + helpStyle.Render("L") + " Save Log | " + helpStyle.Render("Q") + " Quit\n")
		return s.String()

	case stateValidation:
		s.WriteString(titleStyle.Render("DATA-HOST - VALIDATION") + "\n\n")
		s.WriteString("System Pre-flight Checks (Scroll with Arrows/PgUp/PgDn):\n\n")
		s.WriteString(m.viewportBoot.View() + "\n\n")
		s.WriteString(" " + helpStyle.Render("ENTER") + " PROCEED to Database\n")
		s.WriteString(" " + helpStyle.Render("L") + " Save validation log\n")
		s.WriteString(" " + helpStyle.Render("Q") + " Quit\n")
		return s.String()

	case stateDatabase:
		s.WriteString(titleStyle.Render("DATA-HOST - DATABASE") + "\n\n")
		s.WriteString("Database Migrations & Status:\n\n")
		s.WriteString(m.viewportDB.View() + "\n\n")
		s.WriteString(" " + helpStyle.Render("ENTER") + " START Service & Launch Browser\n")
		s.WriteString(" " + helpStyle.Render("L") + " Save database log\n")
		s.WriteString(" " + helpStyle.Render("Q") + " Quit\n")
		return s.String()

	case stateLogging:
		// Metrics Dashboard Bar
		metricsStyle := lipgloss.NewStyle().
			Foreground(lipgloss.Color("228")).
			Background(lipgloss.Color("24")).
			Padding(0, 1).
			MarginRight(1)

		valStyle := lipgloss.NewStyle().Foreground(lipgloss.Color("15")).Bold(true)

		metricsBarParts := []string{
			metricsStyle.Render("REQ RATE: ") + valStyle.Render(fmt.Sprintf("%.1f req/s", m.requestRate)) + "   ",
			metricsStyle.Render("TOT REQUESTS: ") + valStyle.Render(strconv.Itoa(m.requestCount)) + "   ",
			metricsStyle.Render("404 ERRORS: ") + valStyle.Render(strconv.Itoa(m.error404Count)) + "   ",
		}

		if !m.config.LogFileEnabled {
			metricsBarParts = append(metricsBarParts, metricsStyle.Render("LOGGING TO: ")+valStyle.Render(m.config.LogOutput))
		}

		metricsBar := lipgloss.JoinHorizontal(lipgloss.Top, metricsBarParts...)

		// Unified View Construction
		uiParts := []string{
			titleStyle.Render("DATA-HOST - RUNNING"),
			metricsBar,
			"\n",
		}

		if !m.config.LogFileEnabled {
			uiParts = append(uiParts,
				lipgloss.NewStyle().Foreground(lipgloss.Color("202")).Bold(true).Render(" 404 Errors (History):"),
				m.viewport404.View(),
				"\n",
				lipgloss.NewStyle().Foreground(lipgloss.Color("63")).Bold(true).Render(" Server Logs:"),
				m.viewportLogs.View(),
			)
		} else {
			// Minimal view when logging to file
			uiParts = append(uiParts,
				lipgloss.NewStyle().Foreground(lipgloss.Color("42")).Bold(true).Render(" [SYSTEM ACTIVE]"),
				fmt.Sprintf(" File Logging: %s", m.config.LogFilePath),
				"\n (TUI Log windows hidden to prevent performance overhead)",
			)
		}

		uiParts = append(uiParts, "\n Press Q Stopping | L Save Logs | Use Arrows to scroll")

		return lipgloss.JoinVertical(lipgloss.Left, uiParts...)
	}
	return ""
}

var (
	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#FAFAFA")).
			Background(lipgloss.Color("#7D56F4")).
			Padding(0, 1).
			MarginBottom(1)

	helpStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("10")).
			Bold(true)
)
