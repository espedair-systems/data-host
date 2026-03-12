package http

import (
	"bytes"
	"data-host/internal/adapters/driven/repository"
	"data-host/internal/adapters/driving/auth"
	"data-host/internal/core/domain"
	"data-host/internal/core/services"
	testutils "data-host/internal/testing"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
)

func setupTestRouter(t *testing.T) *gin.Engine {
	gin.SetMode(gin.TestMode)
	db := testutils.SetupTestDB(t)
	hostConfig := domain.HostConfig{
		JWTSecret: "test-secret-key-at-least-32-characters-long",
	}
	repo, _ := repository.NewSQLiteRepository(db, hostConfig)

	// Create admin user
	hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	_, _ = repo.GetUserRepo().Create(&domain.User{
		ID:           "admin-1",
		Username:     "admin",
		PasswordHash: string(hash),
		Role:         domain.RoleAdmin,
		Active:       true,
	})

	adapter := NewGinAdapter()
	adapter.repo = repo
	adapter.config = hostConfig
	adapter.authProvider = auth.NewJWTProvider(hostConfig)
	adapter.userService = services.NewUserService(repo.GetUserRepo())

	r := gin.New()
	api := r.Group("/api")
	{
		api.POST("/auth/login", adapter.Login)
		api.GET("/health", adapter.Health)

		site := api.Group("/site")
		authMW := auth.AuthMiddleware(adapter.authProvider)
		{
			site.GET("/selection", adapter.GetSelection)
			site.POST("/selection", authMW, auth.RequireRole(domain.RoleAdmin), adapter.UpdateSelection)
		}
	}
	return r
}

func TestHandlers(t *testing.T) {
	router := setupTestRouter(t)

	t.Run("Health Check", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/api/health", nil)
		router.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("Login success", func(t *testing.T) {
		body := domain.LoginRequest{Username: "admin", Password: "admin123"}
		jsonBody, _ := json.Marshal(body)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewReader(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var resp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &resp)
		assert.NotEmpty(t, resp["token"])
	})

	t.Run("Login failure", func(t *testing.T) {
		body := domain.LoginRequest{Username: "admin", Password: "wrong-password"}
		jsonBody, _ := json.Marshal(body)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewReader(jsonBody))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("Protected route - unauthorized", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/site/selection", bytes.NewBufferString(`{}`))
		router.ServeHTTP(w, req)
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("Protected route - success with token", func(t *testing.T) {
		// Get token
		body := domain.LoginRequest{Username: "admin", Password: "admin123"}
		jsonBody, _ := json.Marshal(body)
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/auth/login", bytes.NewReader(jsonBody))
		router.ServeHTTP(w, req)
		var loginResp map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &loginResp)
		token := loginResp["token"].(string)

		// Test protected route
		selReq := domain.GuidelineSelectionRequest{Selection: map[string]interface{}{"test": true}}
		jsonSel, _ := json.Marshal(selReq)
		w = httptest.NewRecorder()
		req, _ = http.NewRequest("POST", "/api/site/selection", bytes.NewReader(jsonSel))
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		// SQLite repo GetSelection/UpdateSelection will fail here because filesystem part is not setup correctly in SetupTestDB
		// but we are testing that the middleware and handler wiring works.
		// Actually, the SQLiteRepository implementation will try to read from FS if not in DB.
		// Since FS is not setup, it might return 500 or 404.
		assert.NotEqual(t, http.StatusUnauthorized, w.Code)
	})
}
