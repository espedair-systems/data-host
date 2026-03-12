package auth

import (
	"data-host/internal/core/domain"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestAuthMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)
	secret := "test-secret-at-least-thirty-two-chars"
	provider := NewJWTProvider(domain.HostConfig{JWTSecret: secret})
	middleware := AuthMiddleware(provider)

	t.Run("missing header", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request, _ = http.NewRequest("GET", "/test", nil)

		middleware(c)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
		assert.True(t, c.IsAborted())
	})

	t.Run("invalid format", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request, _ = http.NewRequest("GET", "/test", nil)
		c.Request.Header.Set("Authorization", "InvalidFormat token")

		middleware(c)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("valid token", func(t *testing.T) {
		token, _ := provider.GenerateToken("u1", "admin", "admin")

		w := httptest.NewRecorder()
		_, r := gin.CreateTestContext(w)

		var capturedRole interface{}
		r.GET("/test", middleware, func(c *gin.Context) {
			capturedRole, _ = c.Get("role")
			c.Status(http.StatusOK)
		})

		req, _ := http.NewRequest("GET", "/test", nil)
		req.Header.Set("Authorization", "Bearer "+token)

		r.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Equal(t, "admin", capturedRole)
	})
}

func TestRequireRole(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("authorized role", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Set("role", "admin")

		RequireRole("admin", "editor")(c)

		assert.False(t, c.IsAborted())
	})

	t.Run("unauthorized role", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request, _ = http.NewRequest("GET", "/forbidden", nil)
		c.Set("role", "viewer")

		RequireRole("admin")(c)

		assert.Equal(t, http.StatusForbidden, w.Code)
		assert.True(t, c.IsAborted())
	})

	t.Run("missing context role", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)

		RequireRole("admin")(c)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
		assert.True(t, c.IsAborted())
	})
}
