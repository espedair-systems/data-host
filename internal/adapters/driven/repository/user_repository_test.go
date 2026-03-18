/*
 * Driven Adapter: Infrastructure / Implementation.
 * Implements outbound ports for external systems like databases or filesystems.
 */
package repository

import (
	"data-host/internal/core/domain"
	testutils "data-host/internal/testing"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestUserRepository(t *testing.T) {
	db := testutils.SetupTestDB(t)
	repo := NewSQLiteUserRepository(db)

	t.Run("Create and Get user", func(t *testing.T) {
		u := &domain.User{
			ID:           "u1",
			Username:     "test1",
			PasswordHash: "hash1",
			Role:         "admin",
			Active:       true,
		}

		res, err := repo.Create(u)
		require.NoError(t, err)
		assert.Equal(t, u.Username, res.Username)

		got, err := repo.GetByUsername("test1")
		require.NoError(t, err)
		assert.Equal(t, u.ID, got.ID)

		gotID, err := repo.GetByID("u1")
		require.NoError(t, err)
		assert.Equal(t, u.Username, gotID.Username)
	})

	t.Run("Update user", func(t *testing.T) {
		u, _ := repo.GetByUsername("test1")
		u.Email = "new@email.com"
		err := repo.Update(u)
		require.NoError(t, err)

		got, _ := repo.GetByID(u.ID)
		assert.Equal(t, "new@email.com", got.Email)
	})

	t.Run("Delete user", func(t *testing.T) {
		err := repo.Delete("u1")
		require.NoError(t, err)

		_, err = repo.GetByID("u1")
		assert.Error(t, err)
	})
}
