FROM alpine:3.20.1

# Install runtime dependencies
RUN apk add --no-cache ca-certificates unzip

WORKDIR /app

# 1. Copy the binary
COPY bin/data-host ./data-host

# 2. Copy the Registry UI
COPY ui ./frontend/dist

# 3. Copy the site data
COPY data ./data-services/

# 5. Copy configuration
COPY config.yaml ./config.yaml

# Configuration Environment Variables
ENV PORT=8080
ENV APP_ENV=production
ENV DATA_HOST_PORT=8080
ENV DATA_HOST_FRONTEND_PATH=/app/frontend/dist
ENV DATA_HOST_DATA_PATH=/app/data-services

# Ensure binary is executable
RUN chmod +x ./data-host

EXPOSE 8080

# Start the application
CMD ["./data-host"]
