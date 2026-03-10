# Simple Makefile for a Go project

.DEFAULT_GOAL := help

help: ## Display this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Build the application
all: build test ## Build and test the application

build: build-frontend ## Build the API, CLI, and TUI
	@mkdir -p dist
	@echo "Building API..."
	@CGO_ENABLED=1 GOOS=linux go build -o dist/data-host cmd/api/main.go
	@echo "Building CLI..."
	@go build -o dist/data-host-cli cmd/cli/main.go
	@echo "Building TUI..."
	@go build -o dist/data-host-tui cmd/tui/main.go

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
	@go run cmd/api/main.go

run-cli: ## Run the CLI tool
	@go run cmd/cli/main.go

run-tui: ## Run the TUI application
	@go run cmd/tui/main.go

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
test: ## Run tests
	@echo "Testing..."
	@go test ./... -v

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
	@goose -dir migrations/sqlite sqlite3 blueprint.db up

migrate-down: ## Run database migrations down
	@goose -dir migrations/sqlite sqlite3 blueprint.db down

.PHONY: all build run test clean watch scan migrate-up migrate-down help docker-bundle docker-stage build-frontend run-cli run-tui run-frontend storybook build-storybook docker-run docker-down
