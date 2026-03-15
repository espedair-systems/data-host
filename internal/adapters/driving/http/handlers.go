package http

import (
	"data-host/internal/core/domain"
	"net/http"

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

	// 1. JSON Schema Validation
	schemaPath := "schema/services.schema.json"
	schemaLoader := gojsonschema.NewReferenceLoader("file://" + schemaPath)
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
