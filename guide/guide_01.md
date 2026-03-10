# Data Host: Hexagonal Architecture Guide

This project has been restructured following the **Hexagonal Architecture** (Ports and Adapters) pattern to support multiple interfaces (CLI, TUI, and API) while keeping the core logic isolated.

## Project Structure

```text
data-host/
├── cmd/
│   ├── api/          # Web Server entry point (standard)
│   ├── cli/          # Command Line Interface version
│   └── tui/          # Interactive Text User Interface version
├── internal/
│   ├── core/
│   │   ├── domain/   # Business models (HostConfig)
│   │   ├── ports/    # Protocols (HostService, HTTPServer interfaces)
│   │   └── services/ # Domain business logic
│   └── adapters/
│       └── driving/
│           └── http/ # Gin implementation of the web server
├── guide/
│   └── guide_01.md   # This documentation
└── Makefile          # Build and run targets
```

## Key Features

- **Hexagonal Architecture**: Core logic is decoupled from frameworks and transport layers.
- **Multiple Interfaces**:
    - **CLI**: Fast, flag-based control.
    - **TUI**: Premium interactive UI using Bubble Tea.
    - **API**: Standard environment-variable driven execution.
- **MUI-based SPA Frontend**:
    - Modern React SPA built with **Material UI (MUI)**.
    - **Minimal Sidebar**: Focuses on accessibility with just the **Directory** item.
    - **Profile Menu**: Consolidated management items (**Settings**, **Files**, **Mounts**) into a professional dropdown in the top bar.
    - Responsive layout with collapsible sidebar and modern typography.
- **Dual Content Serving**:
    - Root (`/`) maps to a configurable file directory (Data Path).
    - `/home` maps to the frontend SPA distribution.

## Getting Started

### Prerequisites

- Go 1.25+
- Node.js (for frontend distribution build)

### Installation

1. Install Go dependencies:
   ```bash
   go mod tidy
   ```

2. Build all versions:
   ```bash
   make build
   ```

## Usage Instructions

### 1. Running the CLI Version
The CLI version allows you to specify ports and paths via flags.

```bash
# Standard run
make run-cli

# Manual run with custom flags
./data-host-cli --port 9000 --data ./my-files --frontend ./frontend/dist
```

### 2. Running the TUI Version
The TUI provides a visual interface to configure and start/stop the server.

```bash
make run-tui
```
- **Navigation**: `Tab`, `Arrow Up/Down`
- **Actions**: `Enter` to Start/Stop server, `Q` or `Ctrl+C` to quit.

### 3. Running the standard API
Uses environment variables or defaults (Port 8080).

```bash
make run
```

## Makefile Commands

- `make all`: Build and test.
- `make build`: Compile API, CLI, and TUI binaries.
- `make run-cli`: Execute the CLI version immediately.
- `make run-tui`: Execute the TUI version immediately.
- `make test`: Run project tests.
- `make clean`: Remove binaries.

## Configuration (YAML & Viper)

The application now supports configuration via a `config.yaml` file in the root directory.

### Example `config.yaml`
```yaml
port: 8080
frontend_path: "./frontend/dist"
data_path: "/"
```

### Order of Precedence
1. **Command Line Flags**: Overrides everything else (in CLI version).
2. **Environment Variables**: `DATA_HOST_PORT`, `DATA_HOST_FRONTEND_PATH`, etc.
3. **YAML Configuration**: Values defined in `config.yaml`.
4. **Internal Defaults**: Port 8080, etc.
