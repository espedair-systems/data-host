/*
 * Driving Adapter: External API / Entry Point.
 * Translates external requests (e.g., HTTP, Auth, Config) into core application calls.
 */
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
	"sync"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	_ "data-host/docs" // Load generated docs
	"data-host/frontend"
	"data-host/internal/adapters/driving/auth"
	"data-host/internal/core/services"
)

type GinAdapter struct {
	server            *http.Server
	On404             chan string
	OnRequest         chan struct{}
	OnStatus          chan int
	LogOutput         io.Writer
	repo              ports.RegistryRepository
	config            domain.HostConfig
	authProvider      auth.AuthProvider
	userService       *services.UserService
	generationService *services.GenerationService
	shutdownNotify    chan struct{}
	clients           sync.Map
}

func NewGinAdapter() *GinAdapter {
	return &GinAdapter{
		On404:          make(chan string, 100),
		OnRequest:      make(chan struct{}, 1000),
		OnStatus:       make(chan int, 1000),
		shutdownNotify: make(chan struct{}),
	}
}

func (a *GinAdapter) Start(config domain.HostConfig, repo ports.RegistryRepository) error {
	a.config = config
	a.repo = repo
	a.authProvider = auth.NewJWTProvider(config)
	if repo.GetUserRepo() != nil {
		a.userService = services.NewUserService(repo.GetUserRepo())
	}
	a.generationService = services.NewGenerationService(repo)

	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())

	// 1. Basic Security & Logging
	r.Use(a.RequestTrackerMiddleware())
	r.Use(logger.HTTPLoggingMiddleware())
	r.Use(SecurityHeadersMiddleware())
	r.Use(RequestSizeLimiter(10 * 1024 * 1024)) // 10MB Limit

	// 2. Rate Limiting (IP based)
	r.Use(NewRateLimiterMiddleware(config))

	// 3. CORS Support (Configurable)
	corsConfig := cors.Config{
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}

	if len(config.CORSAllowOrigins) > 0 {
		corsConfig.AllowOrigins = config.CORSAllowOrigins
	} else {
		// Fallback for development: allow all origins
		corsConfig.AllowAllOrigins = true
	}
	r.Use(cors.New(corsConfig))

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
		api.GET("/database/stats", a.GetDatabaseStats)
		api.GET("/schemas/tree", a.GetSchemaTree)
		api.GET("/services/tree", a.GetServiceTree)
		api.GET("/guidelines", a.GetGuidelines)
		api.GET("/training", a.GetTraining)
		api.GET("/site/schemas", a.GetSiteSchemas)
		api.GET("/blueprint/schemas", a.GetBlueprintSchemas)
		api.GET("/blueprint/schemas/:name", a.GetBlueprintSchema)
		api.GET("/blueprint/tables", a.GetBlueprintTables)
		api.GET("/design/workflows", a.GetWorkflows)
		api.GET("/design/astro-templates", a.GetAstroTemplates)
		api.GET("/system/events", a.SystemEvents)
		api.GET("/ws", a.WebsocketHandler)

		settings := api.Group("/settings")
		{
			settings.GET("/github", a.GetGithubSettings)
			settings.POST("/github", a.UpdateGithubSettings)
		}

		site := api.Group("/site")
		authMW := auth.AuthMiddleware(a.authProvider, a.config.DevMode)
		{
			site.GET("/config", a.GetSites)
			site.POST("/config", authMW, auth.RequireRole(domain.RoleAdmin), a.SaveSiteConfig)
			site.POST("/schemas/:module/table", authMW, auth.RequireRole(domain.RoleAdmin, domain.RoleEditor), a.UpdateTable)
			site.GET("/selection", a.GetSelection)
			site.POST("/selection", authMW, auth.RequireRole(domain.RoleAdmin), a.UpdateSelection)
			site.GET("/training-selection", a.GetTrainingSelection)
			site.POST("/training-selection", authMW, auth.RequireRole(domain.RoleAdmin), a.UpdateTrainingSelection)
			site.GET("/published-data", a.GetPublishedAssets)
			site.GET("/master-schema", a.GetMasterSchema)
			site.GET("/published-data/:asset/:file", a.GetPublishedFile)
			site.GET("/table-assets", a.GetTableAssets)
			site.GET("/table-assets/:asset/tables", a.GetRegistryTables)
			site.GET("/tables/:table/data", a.GetTableData)
			site.GET("/schema-definition/:file", a.GetSchemaDefinition)
			site.POST("/published-data/:asset/:file", authMW, auth.RequireRole(domain.RoleAdmin, domain.RoleEditor), a.SavePublishedFile)
		}

		ingestion := api.Group("/ingestion")
		ingestion.Use(authMW)
		{
			ingestion.POST("/validate", a.ValidateSchema)
			ingestion.POST("/ingest", auth.RequireRole(domain.RoleAdmin), a.IngestSchema)
			ingestion.POST("/full", auth.RequireRole(domain.RoleAdmin), a.IngestSchema)
			ingestion.POST("/ingest-org", auth.RequireRole(domain.RoleAdmin), a.IngestOrg)
			ingestion.POST("/ingest-dfd", auth.RequireRole(domain.RoleAdmin), a.IngestDFD)
			ingestion.POST("/ingest-tax", auth.RequireRole(domain.RoleAdmin), a.IngestTaxonomy)
			ingestion.GET("/ingest-org", a.GetOrgStructure)
			ingestion.GET("/ingest-dfd", a.GetDFDStructure)
			ingestion.GET("/archives", a.GetFileArchives)
			ingestion.DELETE("/archives/:id", auth.RequireRole(domain.RoleAdmin), a.DeleteFileArchive)
			ingestion.POST("/ingest-to-local-folder", auth.RequireRole(domain.RoleAdmin), a.IngestToFolder)
			ingestion.POST("/generate/:asset", auth.RequireRole(domain.RoleAdmin), a.GenerateAsset)
			ingestion.GET("/generate/:asset/plan", auth.RequireRole(domain.RoleAdmin), a.GetGenerationPlan)
		}

		glossary := api.Group("/glossary")
		{
			glossary.GET("/list", a.GetGlossaries)
			glossary.GET("/:id", a.GetGlossary)
			glossary.GET("/:id/terms", a.GetGlossaryTerms)
			glossary.GET("/terms/:asset_id", a.GetGlossaryTerm)
			glossary.POST("/ingest", authMW, auth.RequireRole(domain.RoleAdmin), a.IngestBusinessGlossary)
			glossary.DELETE("/:id", authMW, auth.RequireRole(domain.RoleAdmin), a.DeleteGlossary)
		}

		bim := api.Group("/bim")
		{
			bim.GET("/list", a.GetBIMModels)
			bim.GET("/:id", a.GetBIMModel)
			bim.GET("/:id/entities", a.GetBIMEntities)
			bim.DELETE("/:id", authMW, auth.RequireRole(domain.RoleAdmin), a.DeleteBIM)
		}

		rdm := api.Group("/rdm")
		{
			rdm.GET("/list", a.GetReferenceDataPackages)
			rdm.GET("/datasets", a.GetReferenceDatasets)
			rdm.GET("/:id", a.GetReferenceDataPackage)
			rdm.DELETE("/:id", authMW, auth.RequireRole(domain.RoleAdmin), a.DeleteReferenceData)
		}
	}

	// Catch-all handler for everything else (Total Control - No Directory Listings)
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path

		// PRIORITY 1: Check Configured Site Mounts (Specific Paths)
		var sites []domain.SiteConfig
		if strings.ToUpper(config.Deploy) == "IDE" {
			sites = config.Sites
		} else {
			// In other modes, dynamic discovery is preferred
			if s, err := a.repo.GetSites(); err == nil {
				sites = s
			} else {
				sites = config.Sites
			}
		}

		for _, site := range sites {
			mountPath := site.MountPath
			if mountPath == "" || mountPath == "/" {
				continue
			}
			if !strings.HasPrefix(mountPath, "/") {
				mountPath = "/" + mountPath
			}

			if strings.HasPrefix(path, mountPath) {
				rel := strings.TrimPrefix(path, mountPath)
				if rel == "" {
					rel = "/"
				}

				// Always prioritize the 'dist' folder for Astro sites
				mountSource := site.MountDist
				if mountSource == "" {
					// Fallback to source + dist if MountDist not explicitly set
					mountSource = filepath.Join(site.DataPath, "dist")
				}

				targetPath := filepath.Join(mountSource, rel)
				if info, err := os.Stat(targetPath); err == nil {
					if info.IsDir() {
						indexPath := filepath.Join(targetPath, "index.html")
						if _, errIdx := os.Stat(indexPath); errIdx == nil {
							c.File(indexPath)
							return
						}
					} else {
						c.File(targetPath)
						return
					}
				}
			}
		}

		// PRIORITY 2: Smart Frontend Redirects
		if path == "/" || path == "/home" {
			c.Redirect(http.StatusTemporaryRedirect, "/home/")
			return
		}

		// PRIORITY 3: Registry Management App (at /home/)
		if strings.HasPrefix(path, "/home/") {
			rel := strings.TrimPrefix(path, "/home/")
			if rel == "" || rel == "index.html" {
				// Serve index.html content directly to avoid redirects
				if data, err := frontend.FS.ReadFile("dist/index.html"); err == nil {
					c.Data(200, "text/html; charset=utf-8", data)
					return
				}
			}

			// Try common local disk paths first (for development)
			staticDirs := []string{"./frontend/dist", "dist/frontend", "./ui"}
			for _, dir := range staticDirs {
				target := filepath.Join(dir, rel)
				if info, err := os.Stat(target); err == nil && !info.IsDir() {
					c.File(target)
					return
				}
			}

			// Fallback to embedded frontend
			embedPath := "dist/" + rel
			embedPath = filepath.ToSlash(filepath.Clean(embedPath))
			embedPath = strings.TrimPrefix(embedPath, "/")

			if data, err := frontend.FS.ReadFile(embedPath); err == nil {
				// Detect content type
				contentType := "application/octet-stream"
				if strings.HasSuffix(embedPath, ".html") {
					contentType = "text/html; charset=utf-8"
				} else if strings.HasSuffix(embedPath, ".js") {
					contentType = "application/javascript"
				} else if strings.HasSuffix(embedPath, ".css") {
					contentType = "text/css"
				} else if strings.HasSuffix(embedPath, ".svg") {
					contentType = "image/svg+xml"
				} else if strings.HasSuffix(embedPath, ".png") {
					contentType = "image/png"
				}
				c.Data(200, contentType, data)
				return
			}

			// SPA Fallback for /home/ (Serve index.html for unknown sub-routes)
			if data, err := frontend.FS.ReadFile("dist/index.html"); err == nil {
				c.Data(200, "text/html; charset=utf-8", data)
				return
			}
		}

		// PRIORITY 4: Implicit /home/ prefix for scratchpad (for shorter URLs)
		if strings.HasPrefix(path, "/scratchpad") {
			c.Redirect(http.StatusTemporaryRedirect, "/home"+path)
			return
		}

		// Final fallback: Signal 404 to TUI and return JSON
		select {
		case a.On404 <- path:
		default:
		}
		c.IndentedJSON(http.StatusNotFound, gin.H{
			"error": "resource not found",
			"path":  path,
		})
	})

	a.server = &http.Server{
		Addr:    fmt.Sprintf(":%d", config.Port),
		Handler: r,
	}

	log.Info().Int("port", config.Port).Msg("HTTP Server starting")
	return a.server.ListenAndServe()
}

func (a *GinAdapter) Stop() error {
	close(a.shutdownNotify)

	if a.server == nil {
		return nil
	}
	// Give SSE clients a moment to receive the shutdown message
	time.Sleep(500 * time.Millisecond)
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return a.server.Shutdown(ctx)
}

func (a *GinAdapter) GetOn404() <-chan string {
	return a.On404
}

func (a *GinAdapter) GetOnRequest() <-chan struct{} {
	return a.OnRequest
}

func (a *GinAdapter) GetOnStatus() <-chan int {
	return a.OnStatus
}

func (a *GinAdapter) SetLogOutput(w io.Writer) {
	a.LogOutput = w
}

func (a *GinAdapter) BroadcastMessage(msg string) {
	a.clients.Range(func(key, value interface{}) bool {
		ch := key.(chan string)
		select {
		case ch <- msg:
		default:
			// Optionally close channel or ignore if blocked
		}
		return true
	})
}

// RequestTrackerMiddleware sends a signal for every incoming request
func (a *GinAdapter) RequestTrackerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		select {
		case a.OnRequest <- struct{}{}:
		default:
			// Don't block if channel is full
		}
		c.Next()
		status := c.Writer.Status()
		select {
		case a.OnStatus <- status:
		default:
		}
	}
}
func (a *GinAdapter) SaveOrgStructure(c *gin.Context) {
	log.Info().Msg("Received request to save organizational structure")
	var payload interface{}
	if err := c.ShouldBindJSON(&payload); err != nil {
		log.Error().Err(err).Msg("Invalid org structure payload")
		c.JSON(400, domain.AppResponse{OK: false, Text: "invalid payload: " + err.Error()})
		return
	}

	// Persist to repository
	if err := a.repo.SaveOrgStructure(payload); err != nil {
		log.Error().Err(err).Msg("Failed to save org structure to repository")
		c.JSON(500, domain.AppResponse{OK: false, Text: "failed to save to repository: " + err.Error()})
		return
	}

	// Audit logging (simulated via standard logger for now)
	log.Info().Interface("payload_preview", payload).Msg("ORGANIZATION_STRUCTURE_UPDATED")

	c.JSON(200, domain.AppResponse{OK: true, Text: "organizational structure saved successfully"})
}
func (a *GinAdapter) GenerateAsset(c *gin.Context) {
	asset := c.Param("asset")
	if asset == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "asset name is required"})
		return
	}

	dryRun := c.Query("dry_run") == "true"

	var req services.GenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("invalid request body: %v", err)})
		return
	}

	if err := a.generationService.GenerateSchemaPage(&a.config, asset, req.Files, dryRun); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to generate page: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Page generated successfully",
		"asset":   asset,
		"dry_run": dryRun,
		"path":    filepath.Join(a.config.GeneratePath, asset, "schema"),
	})
}

func (a *GinAdapter) GetGenerationPlan(c *gin.Context) {
	asset := c.Param("asset")
	if asset == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "asset name is required"})
		return
	}

	plan := a.generationService.GetGenerationPlan(&a.config, asset)
	c.JSON(http.StatusOK, plan)
}
