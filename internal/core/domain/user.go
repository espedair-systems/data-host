package domain

import "time"

// User roles
const (
	RoleAdmin  = "admin"
	RoleEditor = "editor"
	RoleViewer = "viewer"
)

// User represents a system user
// @Description User record
type User struct {
	ID           string    `json:"id" example:"user-123"`
	Username     string    `json:"username" example:"admin"`
	PasswordHash string    `json:"-"` // Never expose hash in JSON
	Email        string    `json:"email" example:"admin@example.com"`
	Role         string    `json:"role" example:"admin" enums:"admin,editor,viewer"`
	Active       bool      `json:"active" example:"true"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// HasPermission checks if the user has one of the required roles
func (u *User) HasPermission(requiredRoles ...string) bool {
	for _, role := range requiredRoles {
		if u.Role == role {
			return true
		}
	}
	return false
}
