# Simple Makefile for a Go project

.DEFAULT_GOAL := help

help: ## Display this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Setup the development environment (install dependencies, run migrations)
	@echo "Setting up development environment..."
	@echo "Installing Go dependencies..."
	@go mod download
	@echo "Installing Frontend dependencies..."
	@npm install --prefix ./frontend
	@echo "Running database migrations..."
	@$(MAKE) migrate-up
	@echo "Setup complete! Run 'make help' for available commands."

# Build the application
all: build test ## Build and test the application

build: build-frontend ## Build the API, CLI, and TUI for current platform
	@mkdir -p dist
	@echo "Building API..."
	@CGO_ENABLED=1 go build -o dist/data-host ./cmd/api
	@echo "Building CLI..."
	@go build -o dist/data-host-cli ./cmd/cli
	@echo "Building TUI..."
	@go build -o dist/data-host-tui ./cmd/tui

build-linux: build-linux-amd64 build-linux-arm64 ## Build for Linux (amd64 and arm64)

build-linux-amd64: build-frontend
	@mkdir -p dist/linux_amd64
	@echo "Building for Linux (amd64)..."
	@CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o dist/linux_amd64/data-host ./cmd/api
	@CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o dist/linux_amd64/data-host-cli ./cmd/cli
	@CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o dist/linux_amd64/data-host-tui ./cmd/tui

build-linux-arm64: build-frontend
	@mkdir -p dist/linux_arm64
	@echo "Building for Linux (arm64)..."
	@CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o dist/linux_arm64/data-host ./cmd/api
	@CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o dist/linux_arm64/data-host-cli ./cmd/cli
	@CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o dist/linux_arm64/data-host-tui ./cmd/tui

build-windows: build-windows-amd64 ## Build for Windows (amd64)

build-windows-amd64: build-frontend
	@mkdir -p dist/windows_amd64
	@echo "Building for Windows (amd64)..."
	@CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o dist/windows_amd64/data-host.exe ./cmd/api
	@CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o dist/windows_amd64/data-host-cli.exe ./cmd/cli
	@CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o dist/windows_amd64/data-host-tui.exe ./cmd/tui

build-mac: build-mac-amd64 build-mac-arm64 ## Build for macOS (Intel and Apple Silicon)

build-mac-amd64: build-frontend
	@mkdir -p dist/mac_amd64
	@echo "Building for macOS (amd64)..."
	@CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -o dist/mac_amd64/data-host ./cmd/api
	@CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -o dist/mac_amd64/data-host-cli ./cmd/cli
	@CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -o dist/mac_amd64/data-host-tui ./cmd/tui

build-mac-arm64: build-frontend
	@mkdir -p dist/mac_arm64
	@echo "Building for macOS (arm64)..."
	@CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -o dist/mac_arm64/data-host ./cmd/api
	@CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -o dist/mac_arm64/data-host-cli ./cmd/cli
	@CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -o dist/mac_arm64/data-host-tui ./cmd/tui

build-all: build-linux build-windows build-mac ## Build for all supported platforms

push: build-linux-amd64 ## Push the AMD linux TUI binary to the test environment
	@mkdir -p /home/jonk/projects/DATA_HOST/TEST/
	@cp dist/linux_amd64/data-host-tui /home/jonk/projects/DATA_HOST/TEST/
	@echo "TUI Binary pushed to /home/jonk/projects/DATA_HOST/TEST/"

docker-bundle: docker-stage ## Build binary, UI, and package as Docker image
	@echo "Creating Docker image..."
	docker build -t data-host:latest -f docker/Dockerfile docker/
	@echo "Docker image 'data-host:latest' is ready."

docker-stage: build ## Stage all artifacts into the docker directory
	@echo "Staging artifacts..."
	@mkdir -p docker/bin docker/ui docker/data
	@cp dist/data-host docker/bin/
	@cp -r dist/frontend/* docker/ui/
	@if [ -f data-services/dist.zip ]; then \
		unzip -o data-services/dist.zip -d docker/data/; \
	else \
		echo "Warning: data-services/dist.zip not found. Run 'make zip-to-host' in data-services first."; \
	fi
	@cp config.yaml docker/
	@echo "Artifacts staged in docker/ directory."

build-frontend: ## Build the frontend assets
	@echo "Building Frontend..."
	@npm install --prefix ./frontend
	@npm run build --prefix ./frontend
	@mkdir -p dist/frontend
	@cp -r frontend/dist/* dist/frontend/

# Run the application
run: ## Run the API server
	@go run ./cmd/api

run-cli: ## Run the CLI tool
	@go run ./cmd/cli

run-tui: ## Run the TUI application
	@go run ./cmd/tui

run-frontend: ## Run the frontend dev server
	@npm run dev --prefix ./frontend

storybook: ## Run Storybook
	@npm run storybook --prefix ./frontend

build-storybook: ## Build Storybook
	@npm run build-storybook --prefix ./frontend
# Create DB container
docker-run: ## Start the Docker containers (API + DB)
	@if docker compose up --build 2>/dev/null; then \
		: ; \
	else \
		echo "Falling back to Docker Compose V1"; \
		docker-compose up --build; \
	fi

# Shutdown DB container
docker-down: ## Stop the Docker containers
	@if docker compose down 2>/dev/null; then \
		: ; \
	else \
		echo "Falling back to Docker Compose V1"; \
		docker-compose down; \
	fi

# Test the application
test: ## Run all tests
	@echo "Running tests..."
	@go test -v -race -timeout 30s ./...

test-coverage: ## Run tests with coverage
	@echo "Running tests with coverage..."
	@go test -v -race -covermode=atomic -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

test-unit: ## Run only unit tests
	@echo "Running unit tests..."
	@go test -v -short ./...

test-integration: ## Run integration tests
	@echo "Running integration tests..."
	@go test -v ./internal/adapters/driving/http/...

test-ci: ## Run tests in CI mode (fail fast, no cache)
	@echo "Running tests (CI)..."
	@go test -v -race -timeout 10s -count=1 ./...

clean: ## Remove build artifacts
	@echo "Cleaning dist and docker-staged directories..."
	@rm -rf dist
	@rm -rf docker/bin docker/ui docker/data docker/config.yaml

# Live Reload
watch: ## Run API with live reload (requires air)
	@if command -v air > /dev/null; then \
            air; \
            echo "Watching...";\
        else \
            read -p "Go's 'air' is not installed on your machine. Do you want to install it? [Y/n] " choice; \
            if [ "$$choice" != "n" ] && [ "$$choice" != "N" ]; then \
                go install github.com/air-verse/air@latest; \
                air; \
                echo "Watching...";\
            else \
                echo "You chose not to install air. Exiting..."; \
                exit 1; \
            fi; \
        fi

# Security Scanning
scan: ## Scan dependencies for vulnerabilities using osv-scanner
	@echo "Scanning for vulnerabilities..."
	@osv-scanner -r .

# DB Migrations
migrate-up: ## Run database migrations up
	@goose -dir internal/database/migrations/sqlite sqlite blueprint.db up -allow-missing

migrate-down: ## Run database migrations down
	@goose -dir internal/database/migrations/sqlite sqlite blueprint.db down -allow-missing

.PHONY: all build run test clean watch scan migrate-up migrate-down help push docker-bundle docker-stage build-frontend run-cli run-tui run-frontend storybook build-storybook docker-run docker-down build-linux build-windows build-mac build-all build-linux-amd64 build-linux-arm64 build-windows-amd64 build-mac-amd64 build-mac-arm64 setup
