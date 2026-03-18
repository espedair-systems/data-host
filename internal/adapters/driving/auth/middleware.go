/*
 * Driving Adapter: External API / Entry Point.
 * Translates external requests (e.g., HTTP, Auth, Config) into core application calls.
 */
package auth

import (
	"data-host/internal/core/domain"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

// AuthMiddleware checks for a valid JWT token in the Authorization header.
// When devMode is true, all requests are granted admin access automatically.
func AuthMiddleware(tokenProvider AuthProvider, devMode ...bool) gin.HandlerFunc {
	isDevMode := len(devMode) > 0 && devMode[0]

	return func(c *gin.Context) {
		if isDevMode {
			// In dev mode, grant full admin access without a token
			c.Set("claims", &Claims{UserID: "dev", Username: "dev", Role: domain.RoleAdmin})
			c.Set("user_id", "dev")
			c.Set("role", domain.RoleAdmin)
			c.Next()
			return
		}

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "missing authorization header"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authorization header format"})
			c.Abort()
			return
		}

		tokenString := parts[1]
		claims, err := tokenProvider.Authenticate(tokenString)
		if err != nil {
			log.Debug().Err(err).Str("token_prefix", "Bearer ...").Msg("Invalid token")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			c.Abort()
			return
		}

		// Store claims and common fields in context
		c.Set("claims", claims)
		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)

		c.Next()
	}
}

// RequireRole checks if the authenticated user has one of the allowed roles.
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "authentication required"})
			c.Abort()
			return
		}

		userRole := role.(string)
		allowed := false
		for _, r := range allowedRoles {
			if userRole == r {
				allowed = true
				break
			}
		}

		if !allowed {
			log.Warn().
				Str("user_role", userRole).
				Strs("allowed_roles", allowedRoles).
				Str("path", c.Request.URL.Path).
				Msg("Forbidden access attempt")
			c.JSON(http.StatusForbidden, gin.H{"error": "insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}
