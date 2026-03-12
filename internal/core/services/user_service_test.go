package services

import (
	"data-host/internal/adapters/driven/repository"
	"data-host/internal/core/domain"
	testutils "data-host/internal/testing"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

func TestUserServiceAuthenticate(t *testing.T) {
	db := testutils.SetupTestDB(t)
	userRepo := repository.NewSQLiteUserRepository(db)
	service := NewUserService(userRepo)

	password := "password123"
	hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	// Seed a user
	_, err := userRepo.Create(&domain.User{
		ID:           "test-1",
		Username:     "testuser",
		PasswordHash: string(hash),
		Role:         domain.RoleAdmin,
		Active:       true,
	})
	require.NoError(t, err)

	tests := []struct {
		name       string
		username   string
		password   string
		wantErr    bool
		errMessage string
	}{
		{
			name:     "valid credentials",
			username: "testuser",
			password: "password123",
			wantErr:  false,
		},
		{
			name:       "invalid password",
			username:   "testuser",
			password:   "wrongpass",
			wantErr:    true,
			errMessage: "invalid credentials",
		},
		{
			name:       "user not found",
			username:   "nonexistent",
			password:   "any",
			wantErr:    true,
			errMessage: "invalid credentials",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			user, err := service.Authenticate(tt.username, tt.password)
			if tt.wantErr {
				require.Error(t, err)
				assert.Nil(t, user)
				assert.Contains(t, err.Error(), tt.errMessage)
			} else {
				require.NoError(t, err)
				require.NotNil(t, user)
				assert.Equal(t, tt.username, user.Username)
			}
		})
	}
}

func TestUserServiceCreateUser(t *testing.T) {
	db := testutils.SetupTestDB(t)
	userRepo := repository.NewSQLiteUserRepository(db)
	service := NewUserService(userRepo)

	t.Run("create valid user", func(t *testing.T) {
		user, err := service.CreateUser("newuser", "pass123", "email@example.com", domain.RoleViewer)
		require.NoError(t, err)
		require.NotNil(t, user)
		assert.Equal(t, "newuser", user.Username)
		assert.Equal(t, domain.RoleViewer, user.Role)
		assert.NotEmpty(t, user.PasswordHash)

		// Verify password hash
		err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte("pass123"))
		assert.NoError(t, err)
	})

	t.Run("duplicate username", func(t *testing.T) {
		_, err := service.CreateUser("dup", "pass", "1@e.com", domain.RoleViewer)
		require.NoError(t, err)

		_, err = service.CreateUser("dup", "pass2", "2@e.com", domain.RoleViewer)
		require.Error(t, err)
	})
}
