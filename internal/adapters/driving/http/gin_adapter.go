package http

import (
	"context"
	"data-host/internal/adapters/driving/logger"
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "data-host/docs" // Load generated docs
	"data-host/internal/adapters/driving/auth"
	"data-host/internal/core/services"
)

type GinAdapter struct {
	server       *http.Server
	On404        chan string
	LogOutput    io.Writer
	repo         ports.RegistryRepository
	config       domain.HostConfig
	authProvider auth.AuthProvider
	userService  *services.UserService
}

func NewGinAdapter() *GinAdapter {
	return &GinAdapter{
		On404: make(chan string, 100),
	}
}

func (a *GinAdapter) Start(config domain.HostConfig, repo ports.RegistryRepository) error {
	a.config = config
	a.repo = repo
	a.authProvider = auth.NewJWTProvider(config)
	if repo.GetUserRepo() != nil {
		a.userService = services.NewUserService(repo.GetUserRepo())
	}

	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())

	// 1. Basic Security & Logging
	r.Use(logger.HTTPLoggingMiddleware())
	r.Use(SecurityHeadersMiddleware())
	r.Use(RequestSizeLimiter(10 * 1024 * 1024)) // 10MB Limit

	// 2. Rate Limiting (IP based)
	r.Use(NewRateLimiterMiddleware(config))

	// 3. CORS Support (Configurable)
	r.Use(cors.New(cors.Config{
		AllowOrigins:     config.CORSAllowOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	// Swagger UI
	r.GET("/swagger", func(c *gin.Context) {
		c.Redirect(http.StatusMovedPermanently, "/swagger/index.html")
	})
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// API endpoints for internal management
	api := r.Group("/api")
	{
		api.POST("/auth/login", a.Login)
		api.GET("/health", a.Health)
		api.GET("/schemas/tree", a.GetSchemaTree)
		api.GET("/services/tree", a.GetServiceTree)
		api.GET("/guidelines", a.GetGuidelines)
		api.GET("/training", a.GetTraining)
		api.GET("/site/schemas", a.GetSiteSchemas)
		api.GET("/blueprint/schemas", a.GetBlueprintSchemas)

		site := api.Group("/site")
		authMW := auth.AuthMiddleware(a.authProvider)
		{
			site.POST("/schemas/:module/table", authMW, auth.RequireRole(domain.RoleAdmin, domain.RoleEditor), a.UpdateTable)
			site.GET("/selection", a.GetSelection)
			site.POST("/selection", authMW, auth.RequireRole(domain.RoleAdmin), a.UpdateSelection)
			site.GET("/training-selection", a.GetTrainingSelection)
			site.POST("/training-selection", authMW, auth.RequireRole(domain.RoleAdmin), a.UpdateTrainingSelection)
		}

		ingestion := api.Group("/ingestion")
		ingestion.Use(authMW)
		{
			ingestion.POST("/validate", a.ValidateSchema)
			ingestion.POST("/ingest", auth.RequireRole(domain.RoleAdmin), a.IngestSchema)
		}
	}

	// Catch-all handler for everything else (Total Control - No Directory Listings)
	r.NoRoute(func(c *gin.Context) {
		log := logger.FromContext(c)
		path := c.Request.URL.Path

		// PRIORITY 1: Registry Management App (at /home)
		if path == "/home" || strings.HasPrefix(path, "/home/") {
			rel := strings.TrimPrefix(path, "/home")
			if rel == "" {
				rel = "/"
			}
			target := filepath.Join(config.FrontendPath, rel)

			if info, err := os.Stat(target); err == nil && !info.IsDir() {
				c.File(target)
				return
			}

			// SPA Fallback for /home
			indexPath := filepath.Join(config.FrontendPath, "index.html")
			log.Debug().Str("index_path", indexPath).Msg("Match: Registry UI")
			c.File(indexPath)
			return
		}

		// PRIORITY 2: Hosted Site (Astro) at Root /
		normalizedPath := strings.TrimPrefix(path, "/")
		sitePath := filepath.Join(config.DataPath, normalizedPath)

		if info, err := os.Stat(sitePath); err == nil {
			if info.IsDir() {
				indexPath := filepath.Join(sitePath, "index.html")
				if _, errIdx := os.Stat(indexPath); errIdx == nil {
					log.Debug().Str("index_path", indexPath).Msg("Match: Docs Index")
					c.File(indexPath)
					return
				}
			} else {
				log.Debug().Str("site_path", sitePath).Msg("Match: Docs File")
				c.File(sitePath)
				return
			}
		}

		// PRIORITY 3: Check configured Mounts
		for _, mount := range config.Mounts {
			if mount.SourcePath == "" {
				continue
			}
			mountPath := mount.Path
			if !strings.HasPrefix(mountPath, "/") {
				mountPath = "/" + mountPath
			}

			if strings.HasPrefix(path, mountPath) {
				rel := strings.TrimPrefix(path, mountPath)
				targetPath := filepath.Join(mount.SourcePath, rel)

				if info, err := os.Stat(targetPath); err == nil {
					if info.IsDir() {
						indexPath := filepath.Join(targetPath, "index.html")
						if _, errIdx := os.Stat(indexPath); errIdx == nil {
							log.Debug().Str("index_path", indexPath).Msg("Match: Mount Index")
							c.File(indexPath)
							return
						}
					} else {
						log.Debug().Str("target_path", targetPath).Msg("Match: Mount File")
						c.File(targetPath)
						return
					}
				}
			}
		}

		// Final fallback
		c.IndentedJSON(http.StatusNotFound, gin.H{
			"error": "resource not found",
			"path":  path,
		})
	})

	a.server = &http.Server{
		Addr:    fmt.Sprintf(":%d", config.Port),
		Handler: r,
	}

	return a.server.ListenAndServe()
}

func (a *GinAdapter) Stop() error {
	if a.server == nil {
		return nil
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return a.server.Shutdown(ctx)
}

func (a *GinAdapter) GetOn404() <-chan string {
	return a.On404
}

func (a *GinAdapter) SetLogOutput(w io.Writer) {
	a.LogOutput = w
}
