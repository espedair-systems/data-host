package http

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"data-host/internal/core/domain"
)

type dproCatalogInput struct {
	Name            string        `json:"name"`
	Description     string        `json:"description"`
	Source          string        `json:"source"`
	GeneratedAtUTC  string        `json:"generated_at_utc"`
	Platform        string        `json:"platform"`
	Products        []dproProduct `json:"products"`
}

type dproProduct struct {
	ProductID           string   `json:"product_id"`
	ProductGroup        string   `json:"product_group"`
	LifecycleStatus     string   `json:"lifecycle_status"`
	Owner               string   `json:"owner"`
	Steward             string   `json:"steward"`
	ProducerSystem      string   `json:"producer_system"`
	PrimaryConsumers    []string `json:"primary_consumers"`
	SLA                 string   `json:"sla"`
	RefreshExpectation  string   `json:"refresh_expectation"`
	ProductName         string   `json:"product_name"`
	Surface             string   `json:"surface"`
	DeliveryType        string   `json:"delivery_type"`
	TransformationTier  string   `json:"transformation_tier"`
	Description         string   `json:"description"`
	ConsumerRequirement string   `json:"consumer_requirement"`
	EvidenceAnchors      []struct {
		Source   string `json:"source"`
		Location string `json:"location"`
		Detail   string `json:"detail"`
	} `json:"evidence_anchors"`
}

func (a *GinAdapter) IngestDataProductCatalog(c *gin.Context) {
	var input dproCatalogInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Data Product Catalog format: " + err.Error()})
		return
	}

	catalog := &domain.DataProductCatalog{
		Name:        input.Name,
		Description: input.Description,
		Source:      input.Source,
		GeneratedAt: input.GeneratedAtUTC,
		Platform:    input.Platform,
	}

	products := make([]domain.DataProduct, 0, len(input.Products))
	for _, p := range input.Products {
		dp := domain.DataProduct{
			ProductID:           p.ProductID,
			ProductGroup:        p.ProductGroup,
			LifecycleStatus:     p.LifecycleStatus,
			Owner:               p.Owner,
			Steward:             p.Steward,
			ProducerSystem:      p.ProducerSystem,
			PrimaryConsumers:    p.PrimaryConsumers,
			SLA:                 p.SLA,
			RefreshExpectation:  p.RefreshExpectation,
			ProductName:         p.ProductName,
			Surface:             p.Surface,
			DeliveryType:        p.DeliveryType,
			TransformationTier:  p.TransformationTier,
			Description:         p.Description,
			ConsumerRequirement: p.ConsumerRequirement,
		}
		for _, ea := range p.EvidenceAnchors {
			dp.EvidenceAnchors = append(dp.EvidenceAnchors, domain.DataProductAnchor{
				Source:   ea.Source,
				Location: ea.Location,
				Detail:   ea.Detail,
			})
		}
		products = append(products, dp)
	}

	if err := a.repo.SaveDataProductCatalog(catalog, products); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save data product catalog: " + err.Error()})
		return
	}

	// Archive the file
	jsonBytes, _ := json.Marshal(input)
	hasher := sha256.New()
	hasher.Write(jsonBytes)
	fileHash := hex.EncodeToString(hasher.Sum(nil))

	var fileName, filePath string
	if a.config.ArchivePath != "" {
		archiveDir := a.config.ArchivePath
		if err := os.MkdirAll(archiveDir, 0755); err == nil {
			fileName = fmt.Sprintf("dpro_%s_%d.json", catalog.Name, time.Now().Unix())
			filePath = filepath.Join(archiveDir, fileName)
			_ = os.WriteFile(filePath, jsonBytes, 0644)
		}
	}

	_ = a.repo.SaveFileArchive(domain.FileArchive{
		Name:        catalog.Name,
		FileName:    fileName,
		Path:        filePath,
		Type:        "data-product",
		Description: catalog.Description,
		Hash:        fileHash,
		Status:      "synced",
	})

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Data Product Catalog ingested successfully"})
}

func (a *GinAdapter) GetDataProductCatalogs(c *gin.Context) {
	catalogs, err := a.repo.GetDataProductCatalogs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get data product catalogs: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, catalogs)
}

func (a *GinAdapter) GetDataProductCatalog(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	catalog, err := a.repo.GetDataProductCatalogByID(id)
	if err != nil || catalog == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Catalog not found"})
		return
	}
	c.JSON(http.StatusOK, catalog)
}

func (a *GinAdapter) GetDataProductProducts(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	products, err := a.repo.GetDataProductProducts(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get products: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, products)
}
