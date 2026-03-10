# Data Host: Configuration Management Guide (Viper)

This guide covers the implementation of the configuration system using **Viper**, integrated into the project's **Hexagonal Architecture**.

## Architectural Implementation

The configuration system is implemented as a **Driven Adapter**, allowing the application to be agnostic of how configuration is stored (YAML, JSON, Env, etc.).

### 1. The Port (`internal/core/ports/config_provider.go`)
An interface that defines the contract for loading configuration.
```go
type ConfigProvider interface {
    Load() (domain.HostConfig, error)
}
```

### 2. The Adapter (`internal/adapters/driven/config/viper_adapter.go`)
The implementation using the Viper library (`github.com/spf13/viper`). It handles the logic of reading from files and merging with environment variables.

### 3. Usage in Entry Points
- **API/CLI**: Loads configuration at startup.
- **TUI**: Loads configuration to pre-fill input fields.
- **CLI Flags**: The CLI uses `cobra` to parse flags, which take the highest precedence and override Viper's loaded values.

## Configuration Source & Precedence

The application determines settings in the following order (Highest to Lowest):

1.  **Command Line Flags** (e.g., `--port 9000`)
2.  **Environment Variables** (prefixed with `DATA_HOST_`, e.g., `DATA_HOST_PORT=8888`)
3.  **Config File** (`config.yaml` in the root directory)
4.  **Internal Defaults** (Port: 8080, Frontend: `./frontend/dist`, Data: `/`)

## YAML Configuration File

A default `config.yaml` is provided in the root:

```yaml
port: 8080
frontend_path: "./frontend/dist"
data_path: "/"
```

## Environment Variables

Viper automatically maps environment variables to configuration keys. The prefix is `DATA_HOST`.

- `port` -> `DATA_HOST_PORT`
- `frontend_path` -> `DATA_HOST_FRONTEND_PATH`
- `data_path` -> `DATA_HOST_DATA_PATH`

## Developer Notes

To add a new configuration setting:
1.  Update the `HostConfig` struct in `internal/core/domain/host_config.go`.
2.  Update the `Load()` method in `internal/adapters/driven/config/viper_adapter.go` to map the new key.
3.  (Optional) Add a default value and update the sample `config.yaml`.
