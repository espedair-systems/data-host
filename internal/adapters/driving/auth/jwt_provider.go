/*
 * Driving Adapter: External API / Entry Point.
 * Translates external requests (e.g., HTTP, Auth, Config) into core application calls.
 */
package auth

import (
	"data-host/internal/core/domain"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/rs/zerolog/log"
)

// JWTProvider implements AuthProvider using JSON Web Tokens.
type JWTProvider struct {
	secret []byte
	expiry time.Duration
}

// NewJWTProvider creates a new JWT authentication provider.
func NewJWTProvider(config domain.HostConfig) AuthProvider {
	expiryMinutes := 60 // Default
	return &JWTProvider{
		secret: []byte(config.JWTSecret),
		expiry: time.Duration(expiryMinutes) * time.Minute,
	}
}

// Authenticate parses and validates a JWT token.
func (j *JWTProvider) Authenticate(tokenString string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Verify signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return j.secret, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// GenerateToken creates a new signed JWT token.
func (j *JWTProvider) GenerateToken(userID, username, role string) (string, error) {
	claims := Claims{
		UserID:   userID,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(j.expiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "datahost",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString(j.secret)
	if err != nil {
		log.Error().Err(err).Msg("Failed to sign token")
		return "", err
	}

	return tokenString, nil
}

// GetExpiryDuration returns token expiry in seconds.
func (j *JWTProvider) GetExpiryDuration() int {
	return int(j.expiry.Seconds())
}
