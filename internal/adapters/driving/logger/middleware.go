package logger

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

// HTTPLoggingMiddleware logs all HTTP requests.
func HTTPLoggingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Generate request ID
		requestID := uuid.New().String()

		// Create logger with request context
		requestLogger := log.With().
			Str("request_id", requestID).
			Str("method", c.Request.Method).
			Str("path", c.Request.URL.Path).
			Logger()

		c.Set("logger", requestLogger)
		c.Set("request_id", requestID)

		// Add header for response
		c.Header("X-Request-ID", requestID)

		// Record start time
		startTime := time.Now()

		// Process request
		c.Next()

		// Log response
		duration := time.Since(startTime)
		requestLogger.Info().
			Int("status", c.Writer.Status()).
			Int("size", c.Writer.Size()).
			Dur("duration_ms", duration).
			Msg("HTTP request completed")
	}
}

// FromContext retrieves the logger from the Gin context.
// If not found, it returns the global logger.
func FromContext(c *gin.Context) zerolog.Logger {
	if l, ok := c.Get("logger"); ok {
		if logger, ok := l.(zerolog.Logger); ok {
			return logger
		}
	}
	return log.Logger
}
