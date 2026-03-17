# Configuration Guide

## Overview
Configuration is loaded in this order (later items override earlier ones):
1. Built-in defaults
2. `config.yaml` file (or path set by `CONFIG_FILE` env var)
3. Environment variables (prefixed with `DATA_HOST_`)

## Configuration Options

| Variable | YAML Key | Type | Default | Valid Values | Description |
|----------|----------|------|---------|--------------|-------------|
| `DATA_HOST_PORT` | `port` | int | `8080` | `1-65535` | Server port |
| `DATA_HOST_FRONTEND_PATH` | `frontend_path` | string | `./frontend/dist` | Path | Path to frontend dist files |
| `DATA_HOST_DATA_PATH` | `data_path` | string | `/` | Path | Path to hosted data services |
| `DATA_HOST_DATABASE_URL` | `database_url` | string | `blueprint.db` | Filename/URL | Path to SQLite database file |
| `DATA_HOST_DEBUG` | `debug` | bool | `false` | `true`, `false` | Enable debug mode (pretty logs) |
| `DATA_HOST_LOG_LEVEL` | `log_level` | string | `INFO` | `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL` | Logging verbosity |
| `DATA_HOST_LOG_FORMAT` | `log_format` | string | `json` | `json`, `pretty` | Output format |
| `DATA_HOST_LOG_OUTPUT` | `log_output` | string | `stdout` | `stdout`, `stderr`, file path | Log destination |
| `CORS_ALLOW_ORIGINS` | `cors_allow_origins` | string list | `localhost` | Comma-separated list | Allowed CORS origins |
| `RATE_LIMIT_READ` | `rate_limits.read_requests` | int | `100` | `>0` | Read requests per minute per IP |
| `RATE_LIMIT_WRITE` | `rate_limits.write_requests` | int | `10` | `>0` | Write requests per minute per IP |
| `JWT_SECRET` | `jwt_secret` | string | - | `min 32 chars` | Secret key for JWT signing |

## Mount Points (YAML Only)

Mount points allow mapping additional file paths to the server.

Example:
```yaml
mounts:
  - path: "/registry"
    source_path: "../data-services/dist"
```

## Validation
The application performs strict validation on startup. If any required fields are missing or values are out of range (e.g. port > 65535), the application will exit immediately with a list of errors.
