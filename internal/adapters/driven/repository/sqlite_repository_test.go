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

func TestSQLiteRepository(t *testing.T) {
	db := testutils.SetupTestDB(t)
	hostConfig := domain.HostConfig{}
	repo, err := NewSQLiteRepository(db, hostConfig)
	require.NoError(t, err)

	t.Run("UpdateTable and apply overrides", func(t *testing.T) {
		module := "finance"
		table := domain.TableDetail{
			Name:        "transactions",
			Type:        "table",
			Description: "updated description",
			Columns: []domain.ColumnInfo{
				{Name: "id", Type: "int"},
			},
		}

		err := repo.UpdateTable(module, table)
		require.NoError(t, err)
	})

	t.Run("Save and Get Config directly via helper", func(t *testing.T) {
		// SQLiteRepository is a struct, but returned as interface.
		// We cast it back to access private methods for testing purpose.
		r := repo.(*SQLiteRepository)

		key := "guidelines"
		val := map[string]interface{}{"selected": []string{"g1"}}

		err = r.saveConfig(key, val)
		require.NoError(t, err)

		got, err := r.getConfig(key)
		require.NoError(t, err)
		assert.Equal(t, float64(1), float64(len(got.(map[string]interface{})["selected"].([]interface{}))))
	})
}
