package http

import (
	"bytes"
	"data-host/internal/adapters/driven/repository"
	"data-host/internal/adapters/driving/auth"
	"data-host/internal/core/domain"
	testutils "data-host/internal/testing"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupIngestionTestRouter(t *testing.T) *gin.Engine {
	gin.SetMode(gin.TestMode)
	db := testutils.SetupTestDB(t)
	hostConfig := domain.HostConfig{
		JWTSecret: "test-secret-key-at-least-32-characters-long",
	}
	repo, _ := repository.NewSQLiteRepository(db, hostConfig)

	adapter := NewGinAdapter()
	adapter.repo = repo
	adapter.config = hostConfig
	adapter.authProvider = auth.NewJWTProvider(hostConfig)

	r := gin.New()
	api := r.Group("/api")
	{
		ingestion := api.Group("/ingestion")
		{
			ingestion.POST("/validate", adapter.ValidateSchema)
		}
	}
	return r
}

func TestValidateSchema(t *testing.T) {
	router := setupIngestionTestRouter(t)

	t.Run("Validate DB Schema success", func(t *testing.T) {
		body := map[string]interface{}{
			"name": "test-db",
			"tables": []map[string]interface{}{
				{
					"name": "users",
					"type": "BASE TABLE",
					"columns": []map[string]interface{}{
						{"name": "id", "type": "integer", "nullable": false},
					},
				},
			},
		}
		jsonBody, _ := json.Marshal(body)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/ingestion/validate", bytes.NewReader(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var resp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)
		assert.Equal(t, "success", resp["status"])
		assert.Equal(t, "DB_SCHEMA", resp["detected_type"])
	})

	t.Run("Validate ORG Structure success", func(t *testing.T) {
		body := map[string]interface{}{
			"metadata": map[string]interface{}{
				"domain":  "espedair.io",
				"version": "1.0",
				"title":   "Test Org",
			},
			"elements": map[string]interface{}{
				"nodes": []interface{}{},
				"edges": []interface{}{},
			},
		}
		jsonBody, _ := json.Marshal(body)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/ingestion/validate", bytes.NewReader(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var resp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)
		assert.Equal(t, "success", resp["status"])
		assert.Equal(t, "ORG_STRUCTURE", resp["detected_type"])
	})

	t.Run("Validate ORG Structure failure (missing metadata)", func(t *testing.T) {
		body := map[string]interface{}{
			"elements": map[string]interface{}{
				"nodes": []interface{}{},
			},
		}
		jsonBody, _ := json.Marshal(body)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/ingestion/validate", bytes.NewReader(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		// It should fail or be detected as DB_SCHEMA and then fail validation
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}
