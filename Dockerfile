# Build Stage: Go API
FROM golang:1.25-alpine AS go_build
RUN apk add --no-cache alpine-sdk

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN mkdir -p dist && CGO_ENABLED=1 GOOS=linux go build -o dist/data-host cmd/api/main.go

# Build/Dev Stage: Frontend
FROM node:20 AS frontend
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/. .
# Default for dev; will be overridden or used as build base
CMD ["npm", "run", "dev", "--", "--host"]

# Build Stage: Frontend Assets
FROM frontend AS frontend_build
RUN npm run build

# Production Stage
FROM alpine:3.20.1 AS prod
RUN apk add --no-cache ca-certificates

WORKDIR /app

# Copy API binary
COPY --from=go_build /app/dist/data-host /app/data-host

# Copy Frontend assets (to be served by Go server at /home)
COPY --from=frontend_build /frontend/dist /app/frontend/dist

# Copy Config
COPY --from=go_build /app/config.yaml /app/config.yaml

# Create directory for data services (expected by config)
RUN mkdir -p /app/data-services

# Default environment variables
ENV PORT=8080
ENV DATA_HOST_PORT=8080
ENV DATA_HOST_FRONTEND_PATH=/app/frontend/dist
ENV DATA_HOST_DATA_PATH=/app/data-services

EXPOSE 8080

CMD ["./data-host"]
