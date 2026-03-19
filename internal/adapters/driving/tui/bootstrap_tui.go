/*
PACKAGE: tui (TUI Bootstrapper - Primary Adapter)

ARCHITECTURE ROLE:
- Visualizes the System Bootstrap / Startup sequence.
- Orchestrates stepwise configuration debugging and health checks.
- Final State: Real-time Monitor (REQ Rates, Error tracking).

STATE MACHINE LOGIC:
- States: [Init -> ConfigCheck -> ServiceConnect -> LiveMonitor]
- Transition: Each step must succeed (tea.Cmd) before advancing the 'currentStep' index.
- Debug Mode: Allow manual "stepwise" progression via 'Enter' or 'Space'.

STRICT CONSTRAINTS:
- No Business Logic: Delegate all rules to the 'app' or 'domain' packages.
- Model Purity: The Model should represent UI State, not Database State.
- Functional Updates: 'Update' must return a new Model and a 'tea.Cmd'.

AI DIRECTIVES:
- UI Pattern: Use a 'spinner' or 'progress bar' component for the Bootstrap phase.
- Live Metrics: Use a 'ticker' (time.Tick) in the final state for REQ/Error rate updates.
- Hexagonal Boundary: Call 'app.ValidateConfig()' and 'app.StartServices()' via tea.Cmd.
- Error Handling: If a step fails, halt the TUI and display the specific config error for debugging.
*/
package tui

import (
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"time"

	"data-host/internal/core/domain"
	"data-host/internal/core/ports"

	"github.com/charmbracelet/bubbles/textinput"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

type Step int

const (
	StepInit Step = iota
	StepConfigCheck
	StepServiceConnect
	StepLiveMonitor
)

type logMsg string
type errorMsg string
type route404Msg string
type requestMsg struct{}
type statusMsg int
type tickMsg time.Time
type validationResultMsg []domain.CheckResult

type BootstrapModel struct {
	state         Step
	portInput     textinput.Model
	dataPathInput textinput.Model
	dbPathInput   textinput.Model
	focusIndex    int
	running       bool

	// Ports (Dependencies)
	hostService      ports.HostService
	bootstrapService ports.BootstrapService
	registryRepo     ports.RegistryRepository

	// Viewports
	viewport404            viewport.Model
	viewportLogs           viewport.Model
	viewportBoot           viewport.Model
	viewportDB             viewport.Model
	viewportConfig         viewport.Model
	viewportConfigReadOnly viewport.Model
	viewportCritical       viewport.Model

	// UI State
	errors404     []string
	logs          []string
	validationRes []domain.CheckResult
	configRes     []domain.CheckResult
	dbLogs        []string
	criticalLogs  []string
	width         int
	height        int
	logChan       chan string
	errorChan     chan string
	config        domain.HostConfig

	// Metrics
	requestCount     int
	error404Count    int
	requestRate      float64
	lastRequestTimes []time.Time
	error4xxCounts   map[int]int
	error5xxCounts   map[int]int
}

func NewBootstrapModel(config domain.HostConfig, bs ports.BootstrapService, hs ports.HostService, repo ports.RegistryRepository, logChan chan string, errorChan chan string) BootstrapModel {
	p := textinput.New()
	p.SetValue(strconv.Itoa(config.Port))

	d := textinput.New()
	activeSite := config.ActiveSite()
	d.SetValue(activeSite.DataPath)

	db := textinput.New()
	db.SetValue(config.DatabaseURL)

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

	m := BootstrapModel{
		state:                  StepInit,
		portInput:              p,
		dataPathInput:          d,
		dbPathInput:            db,
		running:                false,
		hostService:            hs,
		bootstrapService:       bs,
		registryRepo:           repo,
		viewport404:            vp404,
		viewportLogs:           vpLogs,
		viewportBoot:           vpBoot,
		viewportDB:             vpDB,
		viewportConfig:         vpConfig,
		viewportConfigReadOnly: vpConfigRO,
		viewportCritical:       viewport.New(0, 0),
		logChan:                logChan,
		errorChan:              errorChan,
		config:                 config,
		error4xxCounts:         make(map[int]int),
		error5xxCounts:         make(map[int]int),
		criticalLogs:           make([]string, 0),
	}

	m.runConfigDiscovery()
	return m
}

func (m *BootstrapModel) runConfigDiscovery() {
	m.configRes = m.bootstrapService.RunConfigDiscovery(&m.config)
	var content strings.Builder
	for _, res := range m.configRes {
		content.WriteString(res.Text + "\n")
	}
	m.viewportConfig.SetContent(content.String())
	m.setReadOnlyConfig()
}

func (m *BootstrapModel) setReadOnlyConfig() {
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

func (m BootstrapModel) Init() tea.Cmd {
	return tea.Batch(textinput.Blink, m.tick(), m.allListeners())
}

func (m BootstrapModel) allListeners() tea.Cmd {
	return tea.Batch(
		listenFor404(m),
		listenForRequests(m),
		listenForStatus(m),
		listenForLogs(m),
		listenForErrors(m),
	)
}

func (m BootstrapModel) tick() tea.Cmd {
	return tea.Tick(time.Second, func(t time.Time) tea.Msg {
		return tickMsg(t)
	})
}

func (m BootstrapModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
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
				m.logChan <- fmt.Sprintf("UI Report saved to %s", filename)
			}
			return m, nil

		case "h":
			if m.running {
				m.hostService.BroadcastMessage("Hello")
			}
			return m, nil

		case "b":

			OpenBrowser(fmt.Sprintf("http://localhost:%d/home", m.config.Port))
			return m, nil

		case "tab", "shift+tab", "up", "down":
			switch m.state {
			case StepLiveMonitor:
				m.viewport404, cmd = m.viewport404.Update(msg)
				cmds = append(cmds, cmd)
				m.viewportLogs, cmd = m.viewportLogs.Update(msg)
				cmds = append(cmds, cmd)
			case StepConfigCheck:
				m.viewportBoot, cmd = m.viewportBoot.Update(msg)
				cmds = append(cmds, cmd)
			case StepServiceConnect:
				m.viewportDB, cmd = m.viewportDB.Update(msg)
				cmds = append(cmds, cmd)
			case StepInit:
				m.viewportConfig, cmd = m.viewportConfig.Update(msg)
				cmds = append(cmds, cmd)
				m.viewportConfigReadOnly, cmd = m.viewportConfigReadOnly.Update(msg)
				cmds = append(cmds, cmd)
			}
			return m, tea.Batch(cmds...)

		case "enter":
			switch m.state {
			case StepInit:
				m.state = StepConfigCheck
				return m, m.runBootChecks()
			case StepConfigCheck:
				m.state = StepServiceConnect
				// Note: Logger init happens in main now or via a specific Command
				return m, m.runDatabaseChecks()
			case StepServiceConnect:
				m.state = StepLiveMonitor
				m.running = true

				// Return command to start the service
				return m, m.startHostService()
			}
		}

	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		m.handleResize()

	case requestMsg:
		m.requestCount++
		m.lastRequestTimes = append(m.lastRequestTimes, time.Now())
		return m, listenForRequests(m)

	case tickMsg:
		now := time.Time(msg)
		m.calculateRequestRate(now)
		return m, m.tick()

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
		m.handleIncomingLog(string(msg))
		return m, listenForLogs(m)

	case statusMsg:
		code := int(msg)
		if code >= 400 && code < 500 {
			m.error4xxCounts[code]++
		} else if code >= 500 && code < 600 {
			m.error5xxCounts[code]++
		}
		return m, listenForStatus(m)

	case validationResultMsg:
		m.validationRes = msg
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

	return m, tea.Batch(cmds...)
}

func (m *BootstrapModel) handleResize() {
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

	// Live Monitor Logic
	m.viewportCritical.Width = m.width - 2
	m.viewportCritical.Height = 6 // Fixed height for critical logs

	reservedHeight := 4 + 12 + 4 + m.viewportCritical.Height + 2 // Header, Metrics, Windows, Spacing, Critical, Footer
	if !m.config.LogFileEnabled {
		vHeight := m.height - reservedHeight
		if vHeight < 3 {
			vHeight = 3
		}
		m.viewportLogs.Width = m.width - 2
		m.viewportLogs.Height = vHeight
	}

	// Secondary views
	m.viewport404.Width = m.width - 2
	m.viewport404.Height = 10
}

func (m *BootstrapModel) calculateRequestRate(now time.Time) {
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
}

func (m *BootstrapModel) handleIncomingLog(l string) {
	l = strings.TrimSpace(l)
	if l == "" {
		return
	}
	lines := strings.Split(l, "\n")
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}
		upper := strings.ToUpper(trimmed)
		isDbLog := strings.Contains(upper, "DATABASE") || strings.Contains(upper, "MIGRATION") || strings.Contains(upper, "GOOSE")

		if m.state == StepServiceConnect || isDbLog {
			m.dbLogs = append(m.dbLogs, trimmed)
		}

		if m.state != StepServiceConnect {
			m.logs = append(m.logs, trimmed)
			if strings.Contains(upper, "ERROR") || strings.Contains(upper, "FATAL") {
				m.criticalLogs = append(m.criticalLogs, trimmed)
			}
		}
	}

	if m.state == StepLiveMonitor {
		if len(m.logs) > 500 {
			m.logs = m.logs[len(m.logs)-500:]
		}
		if len(m.criticalLogs) > 100 {
			m.criticalLogs = m.criticalLogs[len(m.criticalLogs)-100:]
		}
		m.viewportCritical.SetContent(strings.Join(m.criticalLogs, "\n"))
		m.viewportCritical.GotoBottom()
	}

	if m.state == StepServiceConnect {
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

// Service Calls (Complying with AI Directives)

func (m *BootstrapModel) runBootChecks() tea.Cmd {
	return func() tea.Msg {
		results := m.bootstrapService.RunValidationChecks(&m.config)
		return validationResultMsg(results)
	}
}

func (m *BootstrapModel) runDatabaseChecks() tea.Cmd {
	return func() tea.Msg {
		res := m.bootstrapService.RunDatabaseMigrations(&m.config)
		return logMsg(res.Text)
	}
}

func (m *BootstrapModel) startHostService() tea.Cmd {
	return func() tea.Msg {
		if err := m.hostService.Start(m.config, m.registryRepo); err != nil {
			return errorMsg(fmt.Sprintf("Server Error: %v", err))
		}
		return nil
	}
}

func (m BootstrapModel) View() string {
	var s strings.Builder

	switch m.state {
	case StepInit:
		s.WriteString(titleStyle.Render("DATA-HOST - CONFIG BUILD") + "\n\n")
		s.WriteString(lipgloss.NewStyle().Foreground(lipgloss.Color("208")).Bold(true).Render(" [!] NOT RUNNING: Backend service will start after synchronization.") + "\n\n")

		s.WriteString(lipgloss.NewStyle().Foreground(lipgloss.Color("99")).Bold(true).Render(" Active Configuration:") + "\n")
		s.WriteString(m.viewportConfigReadOnly.View() + "\n\n")

		s.WriteString(lipgloss.NewStyle().Foreground(lipgloss.Color("39")).Bold(true).Render(" Discovery Messages:") + "\n")
		s.WriteString(m.viewportConfig.View() + "\n\n")

		s.WriteString(" " + helpStyle.Render("ENTER") + " PROCEED to Validation | " + helpStyle.Render("L") + " Save Log | " + helpStyle.Render("Q") + " Quit\n")

	case StepConfigCheck:
		s.WriteString(titleStyle.Render("DATA-HOST - VALIDATION") + "\n\n")
		s.WriteString("System Pre-flight Checks (Scroll with Arrows/PgUp/PgDn):\n\n")
		s.WriteString(m.viewportBoot.View() + "\n\n")
		s.WriteString(" " + helpStyle.Render("ENTER") + " PROCEED to Database | " + helpStyle.Render("L") + " Save Log | " + helpStyle.Render("Q") + " Quit\n")

	case StepServiceConnect:
		s.WriteString(titleStyle.Render("DATA-HOST - DATABASE") + "\n\n")
		s.WriteString("Database Migrations & Status:\n\n")
		s.WriteString(m.viewportDB.View() + "\n\n")
		s.WriteString(" " + helpStyle.Render("ENTER") + " START Service & Launch Browser | " + helpStyle.Render("L") + " Save Log | " + helpStyle.Render("Q") + " Quit\n")

	case StepLiveMonitor:
		s.WriteString(m.renderLiveMonitor())
	}

	return s.String()
}

func (m BootstrapModel) renderLiveMonitor() string {
	metricsStyle := lipgloss.NewStyle().
		Foreground(lipgloss.Color("228")).
		Background(lipgloss.Color("24")).
		Padding(0, 1).
		MarginRight(1)

	valStyle := lipgloss.NewStyle().Foreground(lipgloss.Color("15")).Bold(true)

	metricsBarParts := []string{
		metricsStyle.Render("REQ RATE: ") + valStyle.Render(fmt.Sprintf("%.1f req/s", m.requestRate)) + "   ",
		metricsStyle.Render("TOT REQUESTS: ") + valStyle.Render(strconv.Itoa(m.requestCount)) + "   ",
	}

	if !m.config.LogFileEnabled {
		metricsBarParts = append(metricsBarParts, metricsStyle.Render("LOGGING TO: ")+valStyle.Render(m.config.LogOutput))
	}

	metricsBar := lipgloss.JoinHorizontal(lipgloss.Top, metricsBarParts...)

	// Error Windows
	leftCodes := []int{400, 401, 403, 404, 405, 408, 410, 413, 429}
	rightCodes := []int{500, 502, 503, 504}

	labels := map[int]string{
		400: "BadReq", 401: "Unauth", 403: "Forbid", 404: "NotFnd",
		405: "Method", 408: "Timeout", 410: "Gone", 413: "Large",
		429: "RateLmt", 500: "ServerErr", 502: "BadGate",
		503: "Busy", 504: "Timeout",
	}

	statusHeaderStyle := lipgloss.NewStyle().Bold(true).Padding(0, 1).MarginBottom(1)
	leftHeader := statusHeaderStyle.Background(lipgloss.Color("202")).Foreground(lipgloss.Color("0")).Render(" WEB ERRORS (4xx) ")
	rightHeader := statusHeaderStyle.Background(lipgloss.Color("196")).Foreground(lipgloss.Color("0")).Render(" SERVER ERRORS (5xx) ")

	renderStatusTable := func(codes []int, counts map[int]int) string {
		var sb strings.Builder
		for _, code := range codes {
			count := counts[code]
			label := labels[code]
			color := "15"
			if count > 0 {
				color = "9" // Red if there are errors
			}
			codeStr := lipgloss.NewStyle().Foreground(lipgloss.Color("39")).Width(4).Render(strconv.Itoa(code))
			labelStr := lipgloss.NewStyle().Foreground(lipgloss.Color("246")).Width(10).Render(label)
			countStr := lipgloss.NewStyle().Foreground(lipgloss.Color(color)).Bold(count > 0).Render(strconv.Itoa(count))
			sb.WriteString(fmt.Sprintf("%s %s: %s\n", codeStr, labelStr, countStr))
		}
		return sb.String()
	}

	winWidth := (m.width / 2) - 4
	if winWidth < 25 {
		winWidth = 25
	}

	winStyle := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		Width(winWidth).
		Height(12).
		Padding(0, 1)

	leftWin := winStyle.BorderForeground(lipgloss.Color("202")).Render(leftHeader + "\n" + renderStatusTable(leftCodes, m.error4xxCounts))
	rightWin := winStyle.BorderForeground(lipgloss.Color("196")).Render(rightHeader + "\n" + renderStatusTable(rightCodes, m.error5xxCounts))

	windows := lipgloss.JoinHorizontal(lipgloss.Top, leftWin, "  ", rightWin)

	uiParts := []string{
		titleStyle.Render("DATA-HOST - RUNNING"),
		metricsBar,
		"\n",
		windows,
		"\n",
		lipgloss.NewStyle().Foreground(lipgloss.Color("196")).Bold(true).Render(" CRITICAL SYSTEM LOGS (ERROR/FATAL):"),
		m.viewportCritical.View(),
		"\n",
	}

	if !m.config.LogFileEnabled {
		uiParts = append(uiParts,
			lipgloss.NewStyle().Foreground(lipgloss.Color("63")).Bold(true).Render(" General Logs:"),
			m.viewportLogs.View(),
		)
	} else {
		uiParts = append(uiParts,
			lipgloss.NewStyle().Foreground(lipgloss.Color("42")).Bold(true).Render(" [SYSTEM ACTIVE]"),
			fmt.Sprintf(" File Logging: %s", m.config.LogFilePath),
			"\n (TUI Log windows hidden to prevent performance overhead)",
		)
	}

	uiParts = append(uiParts, "\n Press Q Stopping | L Save Logs | b Launch Browser")

	return lipgloss.JoinVertical(lipgloss.Left, uiParts...)
}

func (m BootstrapModel) saveLog() string {
	var filename string
	var content strings.Builder
	switch m.state {
	case StepInit:
		filename = "tui_config.log"
		for _, res := range m.configRes {
			content.WriteString(res.Text + "\n")
		}
	case StepConfigCheck:
		filename = "tui_validation.log"
		for _, msg := range m.validationRes {
			status := "[ OK ] "
			if !msg.OK {
				status = "[FAIL] "
			}
			content.WriteString(status + msg.Text + "\n")
		}
	case StepServiceConnect:
		filename = "tui_database.log"
		content.WriteString(strings.Join(m.dbLogs, "\n"))
	case StepLiveMonitor:
		filename = "tui_logging.log"
		content.WriteString(strings.Join(m.logs, "\n"))
	}

	if filename != "" {
		_ = os.WriteFile(filename, []byte(content.String()), 0644)
		return filename
	}
	return ""
}

// Helpers for Bubble Tea Listeners (Moved here or kept private)

func listenFor404(m BootstrapModel) tea.Cmd {
	return func() tea.Msg {
		route := <-m.hostService.GetOn404()
		return route404Msg(route)
	}
}

func listenForRequests(m BootstrapModel) tea.Cmd {
	return func() tea.Msg {
		<-m.hostService.GetOnRequest()
		return requestMsg{}
	}
}

func listenForStatus(m BootstrapModel) tea.Cmd {
	return func() tea.Msg {
		code := <-m.hostService.GetOnStatus()
		return statusMsg(code)
	}
}

func listenForLogs(m BootstrapModel) tea.Cmd {
	return func() tea.Msg {
		l := <-m.logChan
		return logMsg(l)
	}
}

func listenForErrors(m BootstrapModel) tea.Cmd {
	return func() tea.Msg {
		e := <-m.errorChan
		return errorMsg(e)
	}
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

// Public Entry Points for other layers

func OpenBrowser(url string) {
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
		fmt.Printf("Error opening browser: %v\n", err)
	}
}

// LogChan returns the channel for incoming logs
func (m *BootstrapModel) LogChan() chan string {
	return m.logChan
}

// ErrorChan returns the channel for incoming errors
func (m *BootstrapModel) ErrorChan() chan string {
	return m.errorChan
}
