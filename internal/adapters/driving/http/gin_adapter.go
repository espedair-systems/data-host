package http

import (
	"context"
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"io"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type GinAdapter struct {
	server    *http.Server
	On404     chan string
	LogOutput io.Writer
}

func (a *GinAdapter) log(format string, args ...interface{}) {
	if a.LogOutput != nil {
		fmt.Fprintf(a.LogOutput, "[Router] "+format+"\n", args...)
	}
}

func NewGinAdapter() *GinAdapter {
	return &GinAdapter{
		On404: make(chan string, 100),
	}
}

func (a *GinAdapter) Start(config domain.HostConfig, repo ports.RegistryRepository) error {
	gin.DisableConsoleColor()
	if a.LogOutput != nil {
		gin.DefaultWriter = a.LogOutput
	}
	r := gin.Default()

	// CORS Support
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:8080"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	// API endpoints for internal management
	r.GET("/api/config", func(c *gin.Context) {
		c.JSON(http.StatusOK, config)
	})

	r.GET("/api/schemas/tree", func(c *gin.Context) {
		tree, err := repo.GetSchemaTree()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, tree)
	})

	r.GET("/api/services/tree", func(c *gin.Context) {
		tree, err := repo.GetServiceTree()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, tree)
	})

	r.GET("/api/guidelines", func(c *gin.Context) {
		items, err := repo.GetGuidelines()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, items)
	})

	r.GET("/api/training", func(c *gin.Context) {
		items, err := repo.GetTrainingItems()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, items)
	})

	r.GET("/api/site/schemas", func(c *gin.Context) {
		dashboards, err := repo.GetAllSchemaDashboards()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, dashboards)
	})

	r.GET("/api/blueprint/schemas", func(c *gin.Context) {
		schemas, err := repo.GetBlueprintSchemas()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, schemas)
	})

	r.POST("/api/site/schemas/:module/table", func(c *gin.Context) {
		moduleName := c.Param("module")
		var update domain.TableDetail
		if err := c.ShouldBindJSON(&update); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err := repo.UpdateTable(moduleName, update); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "success"})
	})

	r.GET("/api/site/selection", func(c *gin.Context) {
		selection, err := repo.GetGuidelineSelection()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, selection)
	})

	r.POST("/api/site/selection", func(c *gin.Context) {
		var selection interface{}
		if err := c.BindJSON(&selection); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
			return
		}
		if err := repo.UpdateGuidelineSelection(selection); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "success"})
	})

	r.GET("/api/site/training-selection", func(c *gin.Context) {
		selection, err := repo.GetTrainingSelection()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, selection)
	})

	r.POST("/api/site/training-selection", func(c *gin.Context) {
		var selection interface{}
		if err := c.BindJSON(&selection); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
			return
		}
		if err := repo.UpdateTrainingSelection(selection); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "success"})
	})

	// Catch-all handler for everything else (Total Control - No Directory Listings)
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		// Only log non-static asset requests to avoid noise
		if !strings.Contains(path, ".") {
			a.log("Processing path: %s", path)
		}

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
			a.log("Match: Registry UI -> %s", indexPath)
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
					a.log("Match: Docs Index -> %s", indexPath)
					c.File(indexPath)
					return
				}
			} else {
				a.log("Match: Docs File -> %s", sitePath)
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
							a.log("Match: Mount Index -> %s", indexPath)
							c.File(indexPath)
							return
						}
					} else {
						a.log("Match: Mount File -> %s", targetPath)
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
