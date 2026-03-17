package http

import (
	"data-host/artifacts"
	"data-host/internal/core/domain"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/coder/websocket"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
	"github.com/xeipuuv/gojsonschema"
)

// Login godoc
// @Summary      System login
// @Description  Authenticate with username and password to get a JWT token
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        request body      domain.LoginRequest  true  "Login credentials"
// @Success      200     {object}  map[string]interface{}
// @Failure      401     {object}  domain.ErrorResponse
// @Failure      500     {object}  domain.ErrorResponse
// @Router       /auth/login [post]
func (a *GinAdapter) Login(c *gin.Context) {
	var req domain.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.ErrorResponse{
			Error:   "Bad Request",
			Message: "invalid request body",
			Code:    http.StatusBadRequest,
		})
		return
	}

	if a.userService == nil {
		c.JSON(http.StatusServiceUnavailable, domain.ErrorResponse{
			Error:   "Service Unavailable",
			Message: "user management is not active in this environment",
			Code:    http.StatusServiceUnavailable,
		})
		return
	}

	user, err := a.userService.Authenticate(req.Username, req.Password)
	if err != nil {
		log.Warn().Str("username", req.Username).Msg("Failed login attempt")
		c.JSON(http.StatusUnauthorized, domain.ErrorResponse{
			Error:   "Unauthorized",
			Message: "invalid credentials",
			Code:    http.StatusUnauthorized,
		})
		return
	}

	token, err := a.authProvider.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: "failed to generate token",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":      token,
		"expires_in": a.authProvider.GetExpiryDuration(),
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"role":     user.Role,
		},
	})
}

// Health godoc
// @Summary      Health check
// @Description  Get the current health status of the API
// @Tags         System
// @Produce      json
// @Success      200  {object}  map[string]string
// @Router       /health [get]
func (a *GinAdapter) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "healthy",
		"version": "1.0.0",
		"docs":    "/swagger/index.html",
	})
}

// GetSchemaTree godoc
// @Summary      Get schema tree
// @Description  Retrieve the hierarchical structure of data schemas
// @Tags         Schemas
// @Produce      json
// @Success      200  {array}   domain.SchemaNode
// @Failure      500  {object}  domain.ErrorResponse
// @Router       /schemas/tree [get]
func (a *GinAdapter) GetSchemaTree(c *gin.Context) {
	tree, err := a.repo.GetSchemaTree()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, tree)
}

// GetServiceTree godoc
// @Summary      Get service tree
// @Description  Retrieve the hierarchical structure of hosted services
// @Tags         Services
// @Produce      json
// @Success      200  {array}   domain.SchemaNode
// @Failure      500  {object}  domain.ErrorResponse
// @Router       /services/tree [get]
func (a *GinAdapter) GetServiceTree(c *gin.Context) {
	tree, err := a.repo.GetServiceTree()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, tree)
}

// GetGuidelines godoc
// @Summary      Get guidelines
// @Description  Retrieve list of system guidelines
// @Tags         Guidelines
// @Produce      json
// @Success      200  {array}   domain.MDXItem
// @Failure      500  {object}  domain.ErrorResponse
// @Router       /guidelines [get]
func (a *GinAdapter) GetGuidelines(c *gin.Context) {
	items, err := a.repo.GetGuidelines()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, items)
}

// GetTraining godoc
// @Summary      Get training items
// @Description  Retrieve list of available training modules
// @Tags         Training
// @Produce      json
// @Success      200  {array}   domain.MDXItem
// @Failure      500  {object}  domain.ErrorResponse
// @Router       /training [get]
func (a *GinAdapter) GetTraining(c *gin.Context) {
	items, err := a.repo.GetTrainingItems()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, items)
}

// GetSiteSchemas godoc
// @Summary      Get site schema dashboards
// @Description  Retrieve dashboard metrics and metadata for all schema modules
// @Tags         Site
// @Produce      json
// @Success      200  {array}   domain.SchemaDashboard
// @Failure      500  {object}  domain.ErrorResponse
// @Router       /site/schemas [get]
func (a *GinAdapter) GetSiteSchemas(c *gin.Context) {
	dashboards, err := a.repo.GetAllSchemaDashboards()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, dashboards)
}

// GetSites returns the list of configured sites
func (a *GinAdapter) GetSites(c *gin.Context) {
	sites, err := a.repo.GetSites()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, sites)
}

// SaveSiteConfig saves site details to the database
func (a *GinAdapter) SaveSiteConfig(c *gin.Context) {
	var site domain.SiteConfig
	if err := c.ShouldBindJSON(&site); err != nil {
		c.JSON(http.StatusBadRequest, domain.ErrorResponse{
			Error:   "Invalid Request",
			Message: err.Error(),
			Code:    http.StatusBadRequest,
		})
		return
	}

	log.Info().Str("site", site.Name).Msg("Site registration request received")
	if err := a.repo.SaveSiteConfig(site); err != nil {
		log.Error().Err(err).Str("site", site.Name).Msg("Failed to save site config")
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}

	log.Info().Str("site", site.Name).Msg("Site registered successfully in database")
	c.JSON(http.StatusOK, gin.H{"message": "Site registered successfully", "site": site.Name})
}

// GetBlueprintSchemas godoc
// @Summary      Get blueprint schemas
// @Description  Retrieve list of registered blueprint schemas
// @Tags         Blueprint
// @Produce      json
// @Success      200  {array}   domain.BlueprintSchema
// @Failure      500  {object}  domain.ErrorResponse
// @Router       /blueprint/schemas [get]
func (a *GinAdapter) GetBlueprintSchemas(c *gin.Context) {
	schemas, err := a.repo.GetBlueprintSchemas()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, schemas)
}

func (a *GinAdapter) GetBlueprintTables(c *gin.Context) {
	criteria := make(map[string]string)
	if schemaName := c.Query("schemaName"); schemaName != "" {
		criteria["schemaName"] = schemaName
	}
	if search := c.Query("search"); search != "" {
		criteria["search"] = search
	}

	tables, err := a.repo.GetBlueprintTables(criteria)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, tables)
}

func (a *GinAdapter) GetBlueprintSchema(c *gin.Context) {
	name := c.Param("name")
	schema, err := a.repo.GetFullSchema(name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	if schema == nil {
		c.JSON(http.StatusNotFound, domain.ErrorResponse{
			Error:   "Not Found",
			Message: "schema not found",
			Code:    http.StatusNotFound,
		})
		return
	}

	// Transform to SchemaDashboard for frontend compatibility if needed
	// Actually for now let's just return the FullSchema and fix frontend to handle both
	c.JSON(http.StatusOK, schema)
}

// UpdateTable godoc
// @Summary      Update table schema
// @Description  Update the structure and metadata of a specific table in a module
// @Tags         Site
// @Accept       json
// @Produce      json
// @Param        module  path      string                     true  "Module name"
// @Param        request body      domain.UpdateTableRequest  true  "Table update payload"
// @Success      200     {object}  map[string]string
// @Failure      400     {object}  domain.ErrorResponse
// @Failure      500     {object}  domain.ErrorResponse
// @Router       /site/schemas/{module}/table [post]
func (a *GinAdapter) UpdateTable(c *gin.Context) {
	moduleName := c.Param("module")
	var req domain.UpdateTableRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.ErrorResponse{
			Error:   "Bad Request",
			Message: err.Error(),
			Code:    http.StatusBadRequest,
		})
		return
	}

	detail := domain.TableDetail{
		Name:        req.TableName,
		Description: req.Description,
	}
	for _, col := range req.Columns {
		detail.Columns = append(detail.Columns, domain.ColumnInfo{
			Name: col.Name,
			Type: col.Type,
		})
	}

	if err := a.repo.UpdateTable(moduleName, detail); err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

// GetSelection godoc
// @Summary      Get guideline selection
// @Description  Retrieve the current user selection for guidelines
// @Tags         Site
// @Produce      json
// @Success      200  {object}  interface{}
// @Failure      500  {object}  domain.ErrorResponse
// @Router       /site/selection [get]
func (a *GinAdapter) GetSelection(c *gin.Context) {
	selection, err := a.repo.GetGuidelineSelection()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, selection)
}

// UpdateSelection godoc
// @Summary      Update guideline selection
// @Description  Update the current user selection for guidelines
// @Tags         Site
// @Accept       json
// @Produce      json
// @Param        request body      domain.GuidelineSelectionRequest  true  "Selection update"
// @Success      200     {object}  map[string]string
// @Failure      400     {object}  domain.ErrorResponse
// @Failure      500     {object}  domain.ErrorResponse
// @Router       /site/selection [post]
// ValidateSchema handles schema validation and pre-check
// @Summary Validate and preview schema ingestion
// @Description Validates a schema.json against the registry rules and returns diff if existing
// @Tags Ingestion
// @Accept json
// @Produce json
// @Param schema body domain.FileSchema true "Schema to validate"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /ingestion/validate [post]
func (a *GinAdapter) ValidateSchema(c *gin.Context) {
	var newSchema domain.FileSchema
	if err := c.ShouldBindJSON(&newSchema); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format: " + err.Error()})
		return
	}

	// 1. JSON Schema Validation from embedded FS
	masterData, err := artifacts.Content.ReadFile("schema/services.schema.json")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read embedded master schema"})
		return
	}
	schemaLoader := gojsonschema.NewBytesLoader(masterData)
	documentLoader := gojsonschema.NewGoLoader(newSchema)

	result, err := gojsonschema.Validate(schemaLoader, documentLoader)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Validation system error: " + err.Error()})
		return
	}

	if !result.Valid() {
		var errors []string
		for _, desc := range result.Errors() {
			errors = append(errors, desc.String())
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Schema validation failed", "details": errors})
		return
	}

	// 2. Check existence and build diff preview
	existing, err := a.repo.GetFullSchema(newSchema.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error: " + err.Error()})
		return
	}

	if existing != nil {
		c.JSON(http.StatusOK, gin.H{
			"status":   "conflict",
			"message":  "Schema already exists. Review differences below.",
			"existing": existing,
			"new":      newSchema,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Schema is valid and ready for ingestion.",
		"new":     newSchema,
	})
}

// IngestSchema performs the actual database ingestion
// @Summary Confirm and ingest schema
// @Description Saves the validated schema to the database
// @Tags Ingestion
// @Accept json
// @Produce json
// @Param schema body domain.FileSchema true "Schema to ingest"
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /ingestion/ingest [post]
func (a *GinAdapter) IngestSchema(c *gin.Context) {
	var schema domain.FileSchema
	if err := c.ShouldBindJSON(&schema); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if len(schema.Tables) == 0 {
		if schema.Name == "" {
			schema.Name = "data-host"
		}
		extracted, err := a.repo.ExtractDatabaseSchema(schema.Name, schema.Desc)
		if err == nil && extracted != nil {
			schema = *extracted
		}
	}

	if err := a.repo.SaveFullSchema(schema); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save schema: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Schema ingested successfully"})
}

func (a *GinAdapter) UpdateSelection(c *gin.Context) {
	var req domain.GuidelineSelectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.ErrorResponse{
			Error:   "Bad Request",
			Message: err.Error(),
			Code:    http.StatusBadRequest,
		})
		return
	}
	if err := a.repo.UpdateGuidelineSelection(req.Selection); err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

// GetTrainingSelection godoc
// @Summary      Get training selection
// @Description  Retrieve the current user selection for training items
// @Tags         Site
// @Produce      json
// @Success      200  {object}  interface{}
// @Failure      500  {object}  domain.ErrorResponse
// @Router       /site/training-selection [get]
func (a *GinAdapter) GetTrainingSelection(c *gin.Context) {
	selection, err := a.repo.GetTrainingSelection()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, selection)
}

// UpdateTrainingSelection godoc
// @Summary      Update training selection
// @Description  Update the current user selection for training items
// @Tags         Site
// @Accept       json
// @Produce      json
// @Param        request body      domain.TrainingSelectionRequest  true  "Selection update"
// @Success      200     {object}  map[string]string
// @Failure      400     {object}  domain.ErrorResponse
// @Failure      500     {object}  domain.ErrorResponse
// @Router       /site/training-selection [post]
func (a *GinAdapter) UpdateTrainingSelection(c *gin.Context) {
	var req domain.TrainingSelectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.ErrorResponse{
			Error:   "Bad Request",
			Message: err.Error(),
			Code:    http.StatusBadRequest,
		})
		return
	}
	if err := a.repo.UpdateTrainingSelection(req.Selection); err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

// GetPublishedAssets godoc
// @Summary      Get published assets
// @Description  Retrieve list of schema assets in the data-services/data directory
// @Tags         Site
// @Produce      json
// @Success      200  {array}   domain.PublishedAsset
// @Failure      500  {object}  domain.ErrorResponse
// @Router       /site/published-data [get]
func (a *GinAdapter) GetPublishedAssets(c *gin.Context) {
	assets, err := a.repo.GetPublishedAssets()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, assets)
}

// GetTableAssets godoc
// @Summary      Get matched table assets
// @Description  Retrieve list of assets where registry schema matches data schema
// @Tags         Site
// @Produce      json
// @Success      200  {array}   domain.PublishedAsset
// @Failure      500  {object}  domain.ErrorResponse
// @Router       /site/table-assets [get]
func (a *GinAdapter) GetTableAssets(c *gin.Context) {
	assets, err := a.repo.GetTableAssets()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, assets)
}

// GetRegistryTables godoc
// @Summary      Get tables in registry and DB
// @Description  Retrieve list of tables for an asset with FS and DB status
// @Tags         Site
// @Produce      json
// @Param        asset  path      string  true  "Asset name"
// @Success      200  {array}   domain.RegistryTable
// @Failure      500  {object}  domain.ErrorResponse
// @Router       /site/table-assets/{asset}/tables [get]
func (a *GinAdapter) GetRegistryTables(c *gin.Context) {
	asset := c.Param("asset")
	tables, err := a.repo.GetRegistryTables(asset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, tables)
}

// GetPublishedFile godoc
// @Summary      Get published file
// @Description  Get content of schema.json or collections.json for an asset
// @Tags         Site
// @Produce      json
// @Param        asset  path      string  true  "Asset name"
// @Param        file   path      string  true  "File name (schema.json or collections.json)"
// @Success      200  {object}  interface{}
// @Failure      500  {object}  domain.ErrorResponse
// @Router       /site/published-data/{asset}/{file} [get]
func (a *GinAdapter) GetPublishedFile(c *gin.Context) {
	asset := c.Param("asset")
	file := c.Param("file")
	content, err := a.repo.GetPublishedFile(asset, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	// Content is JSON, so we unmarshal it to return as JSON object
	var val interface{}
	if err := json.Unmarshal(content, &val); err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: "failed to parse file content: " + err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, val)
}

// SavePublishedFile godoc
// @Summary      Save published file
// @Description  Save content of schema.json or collections.json for an asset
// @Tags         Site
// @Accept       json
// @Produce      json
// @Param        asset  path      string  true  "Asset name"
// @Param        file   path      string  true  "File name"
// @Param        body   body      interface{}  true  "JSON content"
// @Success      200  {object}  map[string]string
// @Failure      500  {object}  domain.ErrorResponse
// @Router       /site/published-data/{asset}/{file} [post]
func (a *GinAdapter) SavePublishedFile(c *gin.Context) {
	asset := c.Param("asset")
	file := c.Param("file")

	var content interface{}
	if err := c.ShouldBindJSON(&content); err != nil {
		c.JSON(http.StatusBadRequest, domain.ErrorResponse{
			Error:   "Bad Request",
			Message: err.Error(),
			Code:    http.StatusBadRequest,
		})
		return
	}

	// If it's schema.json, validate it against embedded master schema
	if file == "schema.json" {
		masterData, err := artifacts.Content.ReadFile("schema/services.schema.json")
		if err != nil {
			c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
				Error:   "Validation System Error",
				Message: "failed to read embedded master schema",
				Code:    http.StatusInternalServerError,
			})
			return
		}
		schemaLoader := gojsonschema.NewBytesLoader(masterData)
		documentLoader := gojsonschema.NewGoLoader(content)

		result, err := gojsonschema.Validate(schemaLoader, documentLoader)
		if err != nil {
			c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
				Error:   "Validation System Error",
				Message: "failed to run validation: " + err.Error(),
				Code:    http.StatusInternalServerError,
			})
			return
		}

		if !result.Valid() {
			var errors []string
			for _, desc := range result.Errors() {
				errors = append(errors, desc.String())
			}
			c.JSON(http.StatusBadRequest, domain.ErrorResponse{
				Error:   "Validation Failed",
				Message: "The provided schema does not match the master template",
				Details: errors,
				Code:    http.StatusBadRequest,
			})
			return
		}
	}

	raw, err := json.MarshalIndent(content, "", "    ")
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: "failed to marshal content",
			Code:    http.StatusInternalServerError,
		})
		return
	}

	if err := a.repo.SavePublishedFile(asset, file, raw); err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

// GetMasterSchema godoc
// @Summary      Get master services schema
// @Description  Retrieve the services.schema.json used for validation
// @Tags         Site
// @Produce      json
// @Success      200  {object}  interface{}
// @Failure      500  {object}  domain.ErrorResponse
// @Router       /site/master-schema [get]
func (a *GinAdapter) GetMasterSchema(c *gin.Context) {
	data, err := artifacts.Content.ReadFile("schema/services.schema.json")
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: "failed to read embedded master schema: " + err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}

	var val interface{}
	if err := json.Unmarshal(data, &val); err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: "failed to parse master schema: " + err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, val)
}

// GetSchemaDefinition godoc
// @Summary      Get schema definition
// @Description  Retrieve a specific JSON schema file from the schema directory
// @Tags         Site
// @Produce      json
// @Param        file   path      string  true  "File name"
// @Success      200    {object}  interface{}
// @Failure      403    {object}  domain.ErrorResponse
// @Failure      404    {object}  domain.ErrorResponse
// @Failure      500    {object}  domain.ErrorResponse
// @Router       /site/schema-definition/{file} [get]
func (a *GinAdapter) GetSchemaDefinition(c *gin.Context) {
	file := c.Param("file")
	// Safety check: only allow files ending in .schema.json and no path traversal
	if !strings.HasSuffix(file, ".schema.json") || strings.Contains(file, "..") {
		c.JSON(http.StatusForbidden, domain.ErrorResponse{
			Error:   "Forbidden",
			Message: "Invalid schema file requested",
			Code:    http.StatusForbidden,
		})
		return
	}

	data, err := artifacts.Content.ReadFile("schema/" + file)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.ErrorResponse{
			Error:   "Not Found",
			Message: "schema file not found in artifacts: " + err.Error(),
			Code:    http.StatusNotFound,
		})
		return
	}

	var val interface{}
	if err := json.Unmarshal(data, &val); err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: "failed to parse schema file: " + err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, val)
}

// GetDatabaseStats godoc
// @Summary      Get database statistics
// @Description  Retrieve physical storage and table metrics for the internal SQLite database
// @Tags         System
// @Produce      json
// @Success      200  {object}  domain.DatabaseStats
// @Failure      500  {object}  domain.ErrorResponse
// @Router       /database/stats [get]
func (a *GinAdapter) GetDatabaseStats(c *gin.Context) {
	stats, err := a.repo.GetDatabaseStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, stats)
}

// IngestToFolder saves a schema directly to the filesystem data folder
func (a *GinAdapter) IngestToFolder(c *gin.Context) {
	var schema domain.FileSchema
	if err := c.ShouldBindJSON(&schema); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format: " + err.Error()})
		return
	}

	if schema.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Schema name is required"})
		return
	}

	if len(schema.Tables) == 0 {
		extracted, err := a.repo.ExtractDatabaseSchema(schema.Name, schema.Desc)
		if err == nil && extracted != nil {
			schema = *extracted
		}
	}

	content, err := json.MarshalIndent(schema, "", "  ")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to serialize schema"})
		return
	}

	err = a.repo.SavePublishedFile(schema.Name, "schema.json", content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": fmt.Sprintf("Schema '%s' saved to data-services folder.", schema.Name),
	})
}

// GetWorkflows godoc
// @Summary      Get workflow files
// @Description  Retrieve a list of workflow definition files from the artifacts directory
// @Tags         Design
// @Produce      json
// @Success      200  {array}   domain.DesignFile
// @Failure      500  {object}  domain.ErrorResponse
// @Router       /design/workflows [get]
func (a *GinAdapter) GetWorkflows(c *gin.Context) {
	files, err := a.repo.GetWorkflows()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, files)
}

// GetAstroTemplates godoc
// @Summary      Get Astro template files
// @Description  Retrieve a list of Astro template files from the templates directory
// @Tags         Design
// @Produce      json
// @Success      200  {array}   domain.DesignFile
// @Failure      500  {object}  domain.ErrorResponse
// @Router       /design/astro-templates [get]
func (a *GinAdapter) GetAstroTemplates(c *gin.Context) {
	files, err := a.repo.GetAstroTemplates()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, files)
}

// SystemEvents godoc
// @Summary      System events SSE stream
// @Description  Receive server-sent events like shutdown notifications
// @Tags         System
// @Produce      text/event-stream
// @Success      200
// @Router       /system/events [get]
func (a *GinAdapter) SystemEvents(c *gin.Context) {
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Transfer-Encoding", "chunked")

	// Flush headers immediately
	c.Writer.Flush()

	select {
	case <-c.Request.Context().Done():
		// Client disconnected
		return
	case <-a.shutdownNotify:
		// Send shutdown event
		c.Writer.Write([]byte("event: shutdown\ndata: {\"message\": \"Server is shutting down\"}\n\n"))
		c.Writer.Flush()
		return
	}
}

// WebsocketHandler godoc
// @Summary      System Websocket
// @Description  Websocket connection for real-time broadcasts
// @Tags         System
// @Router       /ws [get]
func (a *GinAdapter) WebsocketHandler(c *gin.Context) {
	socket, err := websocket.Accept(c.Writer, c.Request, &websocket.AcceptOptions{
		InsecureSkipVerify: true,
	})
	if err != nil {
		log.Error().Err(err).Msg("Websocket accept failed")
		return
	}
	defer socket.Close(websocket.StatusGoingAway, "server closing websocket")

	ctx := c.Request.Context()
	socketCtx := socket.CloseRead(ctx)

	clientChan := make(chan string, 100)
	a.clients.Store(clientChan, true)
	defer a.clients.Delete(clientChan)

	for {
		select {
		case <-socketCtx.Done():
			return
		case <-a.shutdownNotify:
			return
		case msg := <-clientChan:
			err := socket.Write(socketCtx, websocket.MessageText, []byte(msg))
			if err != nil {
				return
			}
		}
	}
}

// GetGithubSettings godoc
// @Summary      Get GitHub Settings
// @Description  Retrieve GitHub configuration without exposing the token
// @Tags         Settings
// @Produce      json
// @Success      200  {object}  domain.GithubSettingsResponse
// @Router       /settings/github [get]
func (a *GinAdapter) GetGithubSettings(c *gin.Context) {
	c.JSON(http.StatusOK, domain.GithubSettingsResponse{
		Org:      a.config.Github.Org,
		HasToken: a.config.Github.Token != "",
	})
}

// UpdateGithubSettings godoc
// @Summary      Update GitHub Settings
// @Description  Update GitHub configuration
// @Tags         Settings
// @Accept       json
// @Produce      json
// @Param        request body      domain.GithubSettingsRequest  true  "GitHub Settings"
// @Success      200     {object}  map[string]string
// @Failure      400     {object}  domain.ErrorResponse
// @Router       /settings/github [post]
func (a *GinAdapter) UpdateGithubSettings(c *gin.Context) {
	var req domain.GithubSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.ErrorResponse{
			Error:   "Bad Request",
			Message: "invalid request body",
			Code:    http.StatusBadRequest,
		})
		return
	}

	a.config.Github.Org = req.Org
	if req.Token != "" {
		a.config.Github.Token = req.Token
	}

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}
