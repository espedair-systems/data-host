/*
 * Driving Adapter: External API / Entry Point.
 * Translates external requests (e.g., HTTP, Auth, Config) into core application calls.
 */
package http

import (
	"crypto/sha256"
	"data-host/artifacts"
	"data-host/internal/core/domain"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

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

// GetOrgStructure returns the saved organizational structure
// @Summary Get organizational structure
// @Description Returns the reconstructed organizational chart graph
// @Tags ingestion
// @Produce json
// @Success 200 {object} interface{}
// @Failure 404 {object} domain.ErrorResponse
// @Router /api/ingestion/ingest-org [get]
func (a *GinAdapter) GetOrgStructure(c *gin.Context) {
	org, err := a.repo.GetOrgStructure()
	if err != nil {
		c.JSON(http.StatusNotFound, domain.ErrorResponse{
			Error:   "Not Found",
			Message: "No organizational structure found: " + err.Error(),
			Code:    http.StatusNotFound,
		})
		return
	}
	c.JSON(http.StatusOK, org)
}

// GetDFDStructure returns the saved DFD structure
// @Summary Get DFD structure
// @Description Returns the reconstructed Data Flow Diagram graph
// @Tags ingestion
// @Produce json
// @Success 200 {object} interface{}
// @Failure 404 {object} domain.ErrorResponse
// @Router /api/ingestion/ingest-dfd [get]
func (a *GinAdapter) GetDFDStructure(c *gin.Context) {
	dfd, err := a.repo.GetDFDStructure()
	if err != nil {
		c.JSON(http.StatusNotFound, domain.ErrorResponse{
			Error:   "Not Found",
			Message: "No DFD structure found: " + err.Error(),
			Code:    http.StatusNotFound,
		})
		return
	}
	c.JSON(http.StatusOK, dfd)
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
	// Read raw body to detect type before binding
	body, err := c.GetRawData()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read request body"})
		return
	}

	var rawData map[string]interface{}
	if err := json.Unmarshal(body, &rawData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Malformed JSON format: " + err.Error()})
		return
	}

	isOrg := false
	isDFD := false
	if _, ok := rawData["elements"]; ok {
		// Distinguish based on metadata domain if possible
		if m, ok := rawData["metadata"].(map[string]interface{}); ok {
			domain, _ := m["domain"].(string)
			if domain == "data-flow-diagram" {
				isDFD = true
			} else {
				isOrg = true
			}
		} else {
			// Fallback to org if elements exists but no metadata
			isOrg = true
		}
	}

	isGlossary := false
	isTaxonomy := false
	if _, ok := rawData["taxonomy_type"]; ok {
		isTaxonomy = true
	} else if _, ok := rawData["terms"]; ok {
		isGlossary = true
	}

	isBIM := false
	if _, ok := rawData["entities"]; ok {
		isBIM = true
	}

	isRDM := false
	if _, ok := rawData["datasets"]; ok {
		isRDM = true
	}

	isCMDB := false
	if _, ok := rawData["systems"]; ok {
		if _, ok2 := rawData["databases"]; ok2 {
			isCMDB = true
		}
	}

	schemaPath := "schema/services.schema.json"
	detectedType := "DB_SCHEMA"
	if isOrg {
		schemaPath = "schema/org-schema-raw.json"
		detectedType = "ORG_STRUCTURE"
	} else if isDFD {
		schemaPath = "schema/dfd-schema-raw.json"
		detectedType = "DATA_FLOW_DIAGRAM"
	} else if isGlossary {
		schemaPath = "schema/business-glossary.schema.json"
		detectedType = "BUSINESS_GLOSSARY"
	} else if isBIM {
		schemaPath = "schema/business-information-model.schema.json"
		detectedType = "BUSINESS_INFORMATION_MODEL"
	} else if isRDM {
		schemaPath = "schema/reference-data/reference-data-management.schema.json"
		detectedType = "REFERENCE_DATA_MANAGEMENT"
	} else if isTaxonomy {
		schemaPath = "schema/taxonomy/taxonomy.schema.json"
		detectedType = "TAXONOMY"
	} else if isCMDB {
		schemaPath = "schema/cmdb/cmdb.schema.json"
		detectedType = "CMDB"
	}

	// 1. JSON Schema Validation from embedded FS
	masterData, err := artifacts.Content.ReadFile(schemaPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read master schema"})
		return
	}
	schemaLoader := gojsonschema.NewBytesLoader(masterData)
	documentLoader := gojsonschema.NewBytesLoader(body)

	resultValidate, err := gojsonschema.Validate(schemaLoader, documentLoader)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Validation system error: " + err.Error()})
		return
	}

	if !resultValidate.Valid() {
		var errors []string
		for _, desc := range resultValidate.Errors() {
			errors = append(errors, desc.String())
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": errors})
		return
	}

	// 2. Further processing for DB schemas (diff preview)
	if !isOrg && !isGlossary && !isDFD && !isTaxonomy && !isBIM && !isRDM && !isCMDB {
		var newSchema domain.FileSchema
		_ = json.Unmarshal(body, &newSchema)

		existing, err := a.repo.GetFullSchema(newSchema.Name)
		if err == nil && existing != nil {
			c.JSON(http.StatusOK, gin.H{
				"status":        "conflict",
				"detected_type": detectedType,
				"message":       "Schema already exists. Review differences below.",
				"existing":      existing,
				"new":           newSchema,
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status":        "success",
			"detected_type": detectedType,
			"message":       "Schema is valid and ready for ingestion.",
			"new":           newSchema,
		})
		return
	}

	// For ORG structure, Business Glossary or DFD
	message := "Organizational structure is valid."
	if isGlossary {
		message = "Business glossary is valid and ready for ingestion."
	} else if isBIM {
		message = "Business information model is valid and ready for ingestion."
	} else if isRDM {
		message = "Reference data package is valid and ready for ingestion."
	} else if isDFD {
		message = "Data flow diagram is valid and ready for ingestion."
	} else if isTaxonomy {
		message = "Taxonomy definition is valid and ready for ingestion."
	} else if isCMDB {
		message = "CMDB snapshot is valid and ready for ingestion."
	}

	c.JSON(http.StatusOK, gin.H{
		"status":        "success",
		"detected_type": detectedType,
		"message":       message,
		"new":           rawData,
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
	// Read raw body to detect type
	body, err := c.GetRawData()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read request body"})
		return
	}

	var rawData map[string]interface{}
	json.Unmarshal(body, &rawData)

	// Detect type
	ingestType := "schema"
	isOrg := false
	isDFD := false
	isGlossary := false

	if m, ok := rawData["metadata"].(map[string]interface{}); ok {
		domain, _ := m["domain"].(string)
		if domain == "organization" {
			isOrg = true
		} else if domain == "data-flow-diagram" {
			isDFD = true
		}
	}

	isCMDB := false
	if _, ok := rawData["systems"]; ok {
		if _, ok2 := rawData["databases"]; ok2 {
			isCMDB = true
		}
	}

	isTaxonomy := false
	if _, ok := rawData["taxonomy_type"]; ok {
		isTaxonomy = true
	} else if _, ok := rawData["concepts"]; ok && !isGlossary {
		isTaxonomy = true
	}

	if _, ok := rawData["terms"]; ok && !isTaxonomy {
		isGlossary = true
	}

	isBIM := false
	if _, ok := rawData["entities"]; ok {
		isBIM = true
	}

	isRDM := false
	if _, ok := rawData["datasets"]; ok {
		isRDM = true
	}

	name := "data-host"
	desc := ""

	var schema domain.FileSchema

	if isOrg || isDFD || isGlossary || isBIM || isRDM || isTaxonomy || isCMDB {
		if isOrg {
			ingestType = "org"
			name = "org-structure"
		} else if isDFD {
			ingestType = "dfd"
			name = "dfd-structure"
		} else if isBIM {
			ingestType = "bim"
			name = "business-information-model"
			if m, ok := rawData["name"].(string); ok {
				name = m
			}
		} else if isRDM {
			ingestType = "reference data"
			name = "reference-data-package"
			if n, ok := rawData["name"].(string); ok {
				name = n
			}
		} else if isTaxonomy {
			ingestType = "taxonomy"
			name = "business-taxonomy"
			if n, ok := rawData["name"].(string); ok {
				name = n
			}
		} else if isCMDB {
			ingestType = "cmdb"
			name = "cmdb-snapshot"
			if n, ok := rawData["name"].(string); ok {
				name = n
			}
		} else {
			ingestType = "glossary"
			name = "business-glossary"
		}

		// Extract name from metadata if present
		if m, ok := rawData["metadata"].(map[string]interface{}); ok {
			if title, ok := m["title"].(string); ok {
				name = title
			} else if dom, ok := m["domain"].(string); ok {
				name = dom
			}
			if description, ok := m["description"].(string); ok {
				desc = description
			}
		}

		// Save the structure to the database tables
		var err error
		if isOrg {
			err = a.repo.SaveOrgStructure(rawData)
		} else if isDFD {
			err = a.repo.SaveDFDStructure(rawData)
		} else if isCMDB {
			var snapshot domain.CMDBSnapshot
			if unmarshalErr := json.Unmarshal(body, &snapshot); unmarshalErr == nil {
				err = a.repo.SaveCMDBSnapshot(&snapshot)
			} else {
				err = unmarshalErr
			}
		} else if isGlossary {
			var payload struct {
				Name              string               `json:"name"`
				Description       string               `json:"description"`
				SourceFile        string               `json:"source_file"`
				GeneratedAtUTC    string               `json:"generated_at_utc"`
				Stats             struct {
					OriginalRows      int `json:"original_rows"`
					UniqueTerms       int `json:"unique_terms"`
					DuplicatesRemoved int `json:"duplicates_removed"`
				} `json:"stats"`
				Terms []domain.GlossaryTerm `json:"terms"`
			}
			if unmarshalErr := json.Unmarshal(body, &payload); unmarshalErr == nil {
				glossary := &domain.BusinessGlossary{
					Name:              payload.Name,
					Description:       payload.Description,
					SourceFile:        payload.SourceFile,
					GeneratedAtUTC:    payload.GeneratedAtUTC,
					OriginalRows:      payload.Stats.OriginalRows,
					UniqueTerms:       payload.Stats.UniqueTerms,
					DuplicatesRemoved: payload.Stats.DuplicatesRemoved,
				}
				err = a.repo.SaveBusinessGlossary(glossary, payload.Terms)
			} else {
				err = unmarshalErr
			}
		} else if isBIM {
			var model domain.BusinessInformationModel
			if unmarshalErr := json.Unmarshal(body, &model); unmarshalErr == nil {
				err = a.repo.SaveBIM(&model)
			} else {
				err = unmarshalErr
			}
		} else if isRDM {
			var pkg domain.ReferenceDataPackage
			if unmarshalErr := json.Unmarshal(body, &pkg); unmarshalErr == nil {
				err = a.repo.SaveReferenceData(&pkg)
			} else {
				err = unmarshalErr
			}
		} else if isTaxonomy {
			err = a.repo.SaveTaxonomy(rawData)
		}

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save data: " + err.Error()})
			return
		}

		// Calculate Hash
		hasher := sha256.New()
		hasher.Write(body)
		fileHash := hex.EncodeToString(hasher.Sum(nil))

		// 1. Archive to filesystem if path is configured
		var fileName, filePath string
		if a.config.ArchivePath != "" {
			archiveDir := a.config.ArchivePath
			if err := os.MkdirAll(archiveDir, 0755); err == nil {
				ts := time.Now().Unix()
				if isOrg {
					fileName = fmt.Sprintf("%s_%d.org.json", name, ts)
				} else if isDFD {
					fileName = fmt.Sprintf("%s_%d.dfd.json", name, ts)
				} else if isRDM {
					fileName = fmt.Sprintf("%s_%d.rdm.json", name, ts)
				} else if isTaxonomy {
					fileName = fmt.Sprintf("%s_%d.tax.json", name, ts)
				} else if isCMDB {
					fileName = fmt.Sprintf("%s_%d.cmdb.json", name, ts)
				} else {
					fileName = fmt.Sprintf("%s_%d.%s.json", name, ts, ingestType)
				}
				filePath = filepath.Join(archiveDir, fileName)
				_ = os.WriteFile(filePath, body, 0644)
			}
		}

		_ = a.repo.SaveFileArchive(domain.FileArchive{
			Name:        name,
			FileName:    fileName,
			Path:        filePath,
			Type:        ingestType,
			Description: desc,
			Hash:        fileHash,
			Status:      "synced",
		})

		c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Data ingested successfully"})
		return
	} else {
		if err := json.Unmarshal(body, &schema); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid schema format"})
			return
		}

		if len(schema.Tables) == 0 {
			if schema.Name == "" {
				if schema.FileName != "" {
					tname := strings.TrimSuffix(schema.FileName, filepath.Ext(schema.FileName))
					schema.Name = tname
				} else {
					schema.Name = "data-host"
				}
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
		name = schema.Name
		desc = schema.Desc
	}

	// Calculate Hash
	hasher := sha256.New()
	hasher.Write(body)
	fileHash := hex.EncodeToString(hasher.Sum(nil))

	// 1. Archive to filesystem if path is configured
	var fileName, filePath string
	if a.config.ArchivePath != "" {
		archiveDir := a.config.ArchivePath
		if err := os.MkdirAll(archiveDir, 0755); err == nil {
			ts := time.Now().Unix()
			if isOrg {
				fileName = fmt.Sprintf("%s_%d.org.json", name, ts)
			} else if isDFD {
				fileName = fmt.Sprintf("%s_%d.dfd.json", name, ts)
			} else if isRDM {
				fileName = fmt.Sprintf("%s_%d.rdm.json", name, ts)
			} else if isTaxonomy {
				fileName = fmt.Sprintf("%s_%d.tax.json", name, ts)
			} else {
				if schema.FileName != "" {
					fileName = fmt.Sprintf("%d_%s", ts, schema.FileName)
				} else {
					fileName = fmt.Sprintf("%s_%d.schema.json", schema.Name, ts)
				}
			}
			filePath = filepath.Join(archiveDir, fileName)
			_ = os.WriteFile(filePath, body, 0644)
			log.Info().Str("path", filePath).Msg("file archived to filesystem")
		}
	}

	// 2. Record in file_archive (Database)
	_ = a.repo.SaveFileArchive(domain.FileArchive{
		Name:        name,
		FileName:    fileName,
		Path:        filePath,
		Type:        ingestType,
		Description: desc,
		Hash:        fileHash,
		Status:      "synced",
	})

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "File ingested successfully"})
}

// IngestOrg performs ingestion for organizational structure data
// @Summary Ingest organizational structure
// @Description Saves the organization structure JSON to the archive
// @Tags Ingestion
// @Accept json
// @Produce json
// @Param data body interface{} true "Org structure data"
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /ingestion/ingest-org [post]
func (a *GinAdapter) IngestOrg(c *gin.Context) {
	var payload interface{}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format: " + err.Error()})
		return
	}

	// Extract name from metadata if present
	name := "org-structure"
	desc := "Organizational Structure Data"

	if m, ok := payload.(map[string]interface{}); ok {
		if meta, ok := m["metadata"].(map[string]interface{}); ok {
			if title, ok := meta["title"].(string); ok {
				name = title
			} else if dom, ok := meta["domain"].(string); ok {
				name = dom
			}
			if organization, ok := meta["organization"].(string); ok {
				name = organization
			}
			if description, ok := meta["description"].(string); ok {
				desc = description
			}
		}
		if fname, ok := m["fileName"].(string); ok {
			name = strings.TrimSuffix(fname, filepath.Ext(fname))
		}
	}

	// Save the organizational structure to the database tables
	if err := a.repo.SaveOrgStructure(payload); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save organization structure: " + err.Error()})
		return
	}

	// JSON formatting for storage
	jsonBytes, _ := json.Marshal(payload)
	hasher := sha256.New()
	hasher.Write(jsonBytes)
	fileHash := hex.EncodeToString(hasher.Sum(nil))

	// 1. Archive to filesystem if path is configured
	var fileName, filePath string
	if a.config.ArchivePath != "" {
		archiveDir := a.config.ArchivePath
		if err := os.MkdirAll(archiveDir, 0755); err == nil {
			if m, ok := payload.(map[string]interface{}); ok {
				if fname, ok := m["fileName"].(string); ok {
					fileName = fmt.Sprintf("%d_%s", time.Now().Unix(), fname)
				}
			}
			if fileName == "" {
				fileName = fmt.Sprintf("%s_%d.org.json", name, time.Now().Unix())
			}
			filePath = filepath.Join(archiveDir, fileName)
			if raw, err := json.MarshalIndent(payload, "", "  "); err == nil {
				_ = os.WriteFile(filePath, raw, 0644)
				log.Info().Str("path", filePath).Msg("org structure archived to filesystem")
			}
		}
	}

	// 2. Record in file_archive (Database)
	_ = a.repo.SaveFileArchive(domain.FileArchive{
		Name:        name,
		FileName:    fileName,
		Path:        filePath,
		Type:        "ORG",
		Description: desc,
		Hash:        fileHash,
		Status:      "synced",
	})

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Org structure ingested successfully"})
}

// IngestDFD performs ingestion for Data Flow Diagram structure data
// @Summary Ingest DFD structure
// @Description Saves the DFD structure JSON to the archive and updates the DFD tables
// @Tags Ingestion
// @Accept json
// @Produce json
// @Param data body interface{} true "DFD structure data"
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /ingestion/ingest-dfd [post]
func (a *GinAdapter) IngestDFD(c *gin.Context) {
	var payload interface{}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format: " + err.Error()})
		return
	}

	// Extract name from metadata if present
	name := "dfd-structure"
	desc := "Data Flow Diagram Context Data"

	if m, ok := payload.(map[string]interface{}); ok {
		if meta, ok := m["metadata"].(map[string]interface{}); ok {
			if title, ok := meta["title"].(string); ok {
				name = title
			} else if dom, ok := meta["domain"].(string); ok {
				name = dom
			}
			if description, ok := meta["description"].(string); ok {
				desc = description
			}
		}
		if fname, ok := m["fileName"].(string); ok {
			name = strings.TrimSuffix(fname, filepath.Ext(fname))
		}
	}

	// Save the DFD structure to the database tables
	if err := a.repo.SaveDFDStructure(payload); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save DFD structure: " + err.Error()})
		return
	}

	// JSON formatting for storage
	jsonBytes, _ := json.Marshal(payload)
	hasher := sha256.New()
	hasher.Write(jsonBytes)
	fileHash := hex.EncodeToString(hasher.Sum(nil))

	// 1. Archive to filesystem if path is configured
	var fileName, filePath string
	if a.config.ArchivePath != "" {
		archiveDir := a.config.ArchivePath
		if err := os.MkdirAll(archiveDir, 0755); err == nil {
			if m, ok := payload.(map[string]interface{}); ok {
				if fname, ok := m["fileName"].(string); ok {
					fileName = fmt.Sprintf("%d_%s", time.Now().Unix(), fname)
				}
			}
			if fileName == "" {
				fileName = fmt.Sprintf("%s_%d.dfd.json", name, time.Now().Unix())
			}
			filePath = filepath.Join(archiveDir, fileName)
			if raw, err := json.MarshalIndent(payload, "", "  "); err == nil {
				_ = os.WriteFile(filePath, raw, 0644)
				log.Info().Str("path", filePath).Msg("dfd structure archived to filesystem")
			}
		}
	}

	// 2. Record in file_archive (Database)
	_ = a.repo.SaveFileArchive(domain.FileArchive{
		Name:        name,
		FileName:    fileName,
		Path:        filePath,
		Type:        "DFD",
		Description: desc,
		Hash:        fileHash,
		Status:      "synced",
	})

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "DFD structure ingested successfully"})
}

// GetFileArchives godoc
// @Summary      Get archived files
// @Description  Retrieve list of files from the file_archive table
// @Tags         Ingestion
// @Produce      json
// @Success      200  {array}   domain.FileArchive
// @Failure      500  {object}  domain.ErrorResponse
// @Router       /ingestion/archives [get]
func (a *GinAdapter) GetFileArchives(c *gin.Context) {
	archives, err := a.repo.GetFileArchives()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, archives)
}

// DeleteFileArchive godoc
// @Summary      Delete a file archive entry
// @Description  Remove an entry from the file archive based on ID
// @Tags         Ingestion
// @Param        id   path      int  true  "Archive ID"
// @Success      200  {object}  map[string]string
// @Failure      400  {object}  domain.ErrorResponse
// @Failure      500  {object}  domain.ErrorResponse
// @Router       /ingestion/archives/{id} [delete]
func (a *GinAdapter) DeleteFileArchive(c *gin.Context) {
	idStr := c.Param("id")
	var id int
	if _, err := fmt.Sscanf(idStr, "%d", &id); err != nil {
		c.JSON(http.StatusBadRequest, domain.ErrorResponse{
			Error:   "Bad Request",
			Message: "invalid archive ID",
			Code:    http.StatusBadRequest,
		})
		return
	}

	if err := a.repo.DeleteFileArchive(id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success"})
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

	var val map[string]interface{}
	if err := json.Unmarshal(data, &val); err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: "failed to parse master schema: " + err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	val["erd_limit"] = a.config.ERDLimit
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

	// Record in audit log
	_ = a.repo.SaveFileArchive(domain.FileArchive{
		Name:        schema.Name,
		Type:        "LOCAL_INGEST",
		Description: fmt.Sprintf("Extracted from nominated database: %s", schema.Name),
		Status:      "SUCCESS",
		Hash:        fmt.Sprintf("sha256:%x", []byte(schema.Name+time.Now().String())), // Simple hash placeholder
	})

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

// GetTableData godoc
// @Summary      Get table data
// @Description  Retrieve rows and columns from a specific table with pagination
// @Tags         Site
// @Produce      json
// @Param        table   path      string  true   "Table Name"
// @Param        limit   query     int     false  "Limit (default 50)"
// @Param        offset  query     int     false  "Offset (default 0)"
// @Success      200     {object}  domain.TableData
// @Failure      400     {object}  domain.ErrorResponse
// @Failure      500     {object}  domain.ErrorResponse
// @Router       /site/tables/{table}/data [get]
func (a *GinAdapter) GetTableData(c *gin.Context) {
	tableName := c.Param("table")
	limitStr := c.DefaultQuery("limit", "50")
	offsetStr := c.DefaultQuery("offset", "0")

	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	data, err := a.repo.GetTableData(tableName, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}

	count, _ := a.repo.GetTableCount(tableName)

	c.JSON(http.StatusOK, gin.H{
		"columns": data.Columns,
		"rows":    data.Rows,
		"total":   count,
		"limit":   limit,
		"offset":  offset,
	})
}

// GetGlossaries returns the list of all business glossaries
func (a *GinAdapter) GetGlossaries(c *gin.Context) {
	glossaries, err := a.repo.GetGlossaries()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, glossaries)
}

// GetGlossary returns a specific glossary by ID
func (a *GinAdapter) GetGlossary(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.ErrorResponse{
			Error:   "Bad Request",
			Message: "invalid glossary ID",
			Code:    http.StatusBadRequest,
		})
		return
	}

	glossary, err := a.repo.GetGlossaryByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	if glossary == nil {
		c.JSON(http.StatusNotFound, domain.ErrorResponse{
			Error:   "Not Found",
			Message: "glossary not found",
			Code:    http.StatusNotFound,
		})
		return
	}
	c.JSON(http.StatusOK, glossary)
}

// GetGlossaryTerms returns terms for a specific glossary
func (a *GinAdapter) GetGlossaryTerms(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.ErrorResponse{
			Error:   "Bad Request",
			Message: "invalid glossary ID",
			Code:    http.StatusBadRequest,
		})
		return
	}

	terms, err := a.repo.GetGlossaryTerms(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, terms)
}

// GetGlossaryTerm returns a specific term by asset ID
func (a *GinAdapter) GetGlossaryTerm(c *gin.Context) {
	assetID := c.Param("asset_id")
	term, err := a.repo.GetGlossaryTermByID(assetID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	if term == nil {
		c.JSON(http.StatusNotFound, domain.ErrorResponse{
			Error:   "Not Found",
			Message: "term not found",
			Code:    http.StatusNotFound,
		})
		return
	}
	c.JSON(http.StatusOK, term)
}

// IngestBusinessGlossary handles the ingestion of a business glossary JSON
func (a *GinAdapter) IngestBusinessGlossary(c *gin.Context) {
	var payload struct {
		Name              string               `json:"name"`
		Description       string               `json:"description"`
		SourceFile        string               `json:"source_file"`
		GeneratedAtUTC    string               `json:"generated_at_utc"`
		Stats             struct {
			OriginalRows      int `json:"original_rows"`
			UniqueTerms       int `json:"unique_terms"`
			DuplicatesRemoved int `json:"duplicates_removed"`
		} `json:"stats"`
		Terms []domain.GlossaryTerm `json:"terms"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, domain.ErrorResponse{
			Error:   "Bad Request",
			Message: err.Error(),
			Code:    http.StatusBadRequest,
		})
		return
	}

	glossary := &domain.BusinessGlossary{
		Name:              payload.Name,
		Description:       payload.Description,
		SourceFile:        payload.SourceFile,
		GeneratedAtUTC:    payload.GeneratedAtUTC,
		OriginalRows:      payload.Stats.OriginalRows,
		UniqueTerms:       payload.Stats.UniqueTerms,
		DuplicatesRemoved: payload.Stats.DuplicatesRemoved,
	}

	if err := a.repo.SaveBusinessGlossary(glossary, payload.Terms); err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Business glossary ingested successfully", "id": glossary.ID})
}

// DeleteGlossary deletes a glossary and its terms
func (a *GinAdapter) DeleteGlossary(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.ErrorResponse{
			Error:   "Bad Request",
			Message: "invalid glossary ID",
			Code:    http.StatusBadRequest,
		})
		return
	}

	if err := a.repo.DeleteGlossary(id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Glossary deleted"})
}

// GetBIMModels returns all Business Information Models
func (a *GinAdapter) GetBIMModels(c *gin.Context) {
	models, err := a.repo.GetBIMModels()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, models)
}

// GetBIMModel returns a single Business Information Model by ID
func (a *GinAdapter) GetBIMModel(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.ErrorResponse{
			Error:   "Bad Request",
			Message: "invalid BIM model ID",
			Code:    http.StatusBadRequest,
		})
		return
	}

	model, err := a.repo.GetBIMModelByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	if model == nil {
		c.JSON(http.StatusNotFound, domain.ErrorResponse{
			Error:   "Not Found",
			Message: "BIM model not found",
			Code:    http.StatusNotFound,
		})
		return
	}
	c.JSON(http.StatusOK, model)
}

// GetBIMEntities returns all entities for a BIM model
func (a *GinAdapter) GetBIMEntities(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.ErrorResponse{
			Error:   "Bad Request",
			Message: "invalid BIM model ID",
			Code:    http.StatusBadRequest,
		})
		return
	}

	entities, err := a.repo.GetBIMEntities(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, entities)
}

// DeleteBIM deletes a Business Information Model and its entities
func (a *GinAdapter) DeleteBIM(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.ErrorResponse{
			Error:   "Bad Request",
			Message: "invalid BIM model ID",
			Code:    http.StatusBadRequest,
		})
		return
	}

	if err := a.repo.DeleteBIM(id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "BIM model deleted"})
}

func (a *GinAdapter) GetReferenceDataPackages(c *gin.Context) {
	pkgs, err := a.repo.GetReferenceDataPackages()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, pkgs)
}

func (a *GinAdapter) GetReferenceDataPackage(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.ErrorResponse{
			Error:   "Bad Request",
			Message: "invalid RDM package ID",
			Code:    http.StatusBadRequest,
		})
		return
	}

	pkg, err := a.repo.GetReferenceDataPackage(id)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.ErrorResponse{
			Error:   "Not Found",
			Message: "RDM package not found",
			Code:    http.StatusNotFound,
		})
		return
	}
	c.JSON(http.StatusOK, pkg)
}

func (a *GinAdapter) GetReferenceDatasets(c *gin.Context) {
	datasets, err := a.repo.GetReferenceDatasets()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, datasets)
}

func (a *GinAdapter) DeleteReferenceData(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.ErrorResponse{
			Error:   "Bad Request",
			Message: "invalid RDM package ID",
			Code:    http.StatusBadRequest,
		})
		return
	}

	if err := a.repo.DeleteReferenceData(id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.ErrorResponse{
			Error:   "Internal Server Error",
			Message: err.Error(),
			Code:    http.StatusInternalServerError,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "RDM package deleted"})
}
