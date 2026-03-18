/*
 * Driving Adapter: External API / Entry Point.
 * Translates external requests (e.g., HTTP, Auth, Config) into core application calls.
 */
package auth

import (
	"errors"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrInvalidToken = errors.New("invalid or expired token")
	ErrUnauthorized = errors.New("unauthorized access")
)

// AuthProvider defines the interface for authentication mechanisms.
type AuthProvider interface {
	// Authenticate validates the provided token and returns user info or error.
	Authenticate(token string) (*Claims, error)
	// GenerateToken creates a new token for the given user attributes.
	GenerateToken(userID, username, role string) (string, error)
	// GetExpiryDuration returns token expiry in seconds
	GetExpiryDuration() int
}

// Claims represents the data stored within a secure token.
type Claims struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}
