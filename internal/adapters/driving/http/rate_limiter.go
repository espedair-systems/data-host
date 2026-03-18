/*
 * Driving Adapter: External API / Entry Point.
 * Translates external requests (e.g., HTTP, Auth, Config) into core application calls.
 */
package http

import (
	"data-host/internal/core/domain"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ulule/limiter/v3"
	mgin "github.com/ulule/limiter/v3/drivers/middleware/gin"
	"github.com/ulule/limiter/v3/drivers/store/memory"
)

// NewRateLimiterMiddleware creates a rate limiting middleware based on IP.
func NewRateLimiterMiddleware(config domain.HostConfig) gin.HandlerFunc {
	// Read Rate Limit (100/min)
	readRate := limiter.Rate{
		Limit:  int64(config.RateLimits.ReadRequests),
		Period: time.Minute,
	}
	readStore := memory.NewStore()
	readLimiter := limiter.New(readStore, readRate)
	readMiddleware := mgin.NewMiddleware(readLimiter)

	// Write Rate Limit (10/min)
	writeRate := limiter.Rate{
		Limit:  int64(config.RateLimits.WriteRequests),
		Period: time.Minute,
	}
	writeStore := memory.NewStore()
	writeLimiter := limiter.New(writeStore, writeRate)
	writeMiddleware := mgin.NewMiddleware(writeLimiter)

	return func(c *gin.Context) {
		if config.DevMode {
			c.Next()
			return
		}

		if c.Request.Method == "GET" || c.Request.Method == "OPTIONS" || c.Request.Method == "HEAD" {
			readMiddleware(c)
		} else {
			writeMiddleware(c)
		}
	}
}

// SecurityHeadersMiddleware adds security-related headers to every response.
func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Content-Security-Policy", "default-src 'self'")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Next()
	}
}

// RequestSizeLimiter restricts the size of incoming requests.
func RequestSizeLimiter(limit int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.ContentLength > limit {
			c.AbortWithStatusJSON(http.StatusRequestEntityTooLarge, gin.H{
				"error": "request body too large",
				"limit": fmt.Sprintf("%d bytes", limit),
			})
			return
		}
		c.Next()
	}
}
