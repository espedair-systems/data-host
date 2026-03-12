package auth

import (
	"data-host/internal/core/domain"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestJWTProvider(t *testing.T) {
	secret := "test-secret-at-least-thirty-two-chars"
	config := domain.HostConfig{JWTSecret: secret}
	provider := NewJWTProvider(config)

	t.Run("generate and validate token", func(t *testing.T) {
		userID := "user-1"
		username := "admin"
		role := "admin"

		token, err := provider.GenerateToken(userID, username, role)
		require.NoError(t, err)
		assert.NotEmpty(t, token)

		claims, err := provider.Authenticate(token)
		require.NoError(t, err)
		require.NotNil(t, claims)
		assert.Equal(t, userID, claims.UserID)
		assert.Equal(t, username, claims.Username)
		assert.Equal(t, role, claims.Role)
	})

	t.Run("invalid token", func(t *testing.T) {
		_, err := provider.Authenticate("invalid.token.here")
		assert.Error(t, err)
	})

	t.Run("expired token", func(t *testing.T) {
		// Create a provider with 0 or negative expiry for testing
		expiredProvider := &JWTProvider{
			secret: []byte(secret),
			expiry: -1 * time.Hour,
		}

		token, err := expiredProvider.GenerateToken("u1", "n1", "r1")
		require.NoError(t, err)

		_, err = provider.Authenticate(token)
		assert.Error(t, err, "should fail because token is expired")
	})

	t.Run("wrong signing secret", func(t *testing.T) {
		token, _ := provider.GenerateToken("u1", "n1", "r1")

		wrongProvider := NewJWTProvider(domain.HostConfig{JWTSecret: "completely-different-secret-key-000"})
		_, err := wrongProvider.Authenticate(token)
		assert.Error(t, err, "should fail because secret is different")
	})
}
