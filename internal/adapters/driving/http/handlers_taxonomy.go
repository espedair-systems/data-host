package http

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	
	"strconv"
	
	"data-host/internal/core/domain"
)

func (a *GinAdapter) IngestTaxonomy(c *gin.Context) {
	var payload interface{}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format: " + err.Error()})
		return
	}

	name := "business-taxonomy"
	desc := "Taxonomy Data"

	if m, ok := payload.(map[string]interface{}); ok {
		if nm, ok := m["name"].(string); ok {
			name = nm
		} else if title, ok := m["title"].(string); ok {
			name = title
		}
		if d, ok := m["description"].(string); ok {
			desc = d
		}
	}

	if err := a.repo.SaveTaxonomy(payload); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save taxonomy: " + err.Error()})
		return
	}

	jsonBytes, _ := json.Marshal(payload)
	hasher := sha256.New()
	hasher.Write(jsonBytes)
	fileHash := hex.EncodeToString(hasher.Sum(nil))

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
				fileName = fmt.Sprintf("%s_%d.tax.json", name, time.Now().Unix())
			}
			filePath = filepath.Join(archiveDir, fileName)
			if raw, err := json.MarshalIndent(payload, "", "  "); err == nil {
				_ = os.WriteFile(filePath, raw, 0644)
			}
		}
	}

	_ = a.repo.SaveFileArchive(domain.FileArchive{
		Name:        name,
		FileName:    fileName,
		Path:        filePath,
		Type:        "taxonomy",
		Description: desc,
		Hash:        fileHash,
		Status:      "synced",
	})

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Taxonomy ingested successfully"})
}

func (a *GinAdapter) GetTaxonomies(c *gin.Context) {
	taxonomies, err := a.repo.GetTaxonomies()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get taxonomies: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, taxonomies)
}
func (a *GinAdapter) GetTaxonomy(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	taxonomy, err := a.repo.GetTaxonomyByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Taxonomy not found"})
		return
	}
	c.JSON(http.StatusOK, taxonomy)
}

func (a *GinAdapter) GetTaxonomyTerms(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	terms, err := a.repo.GetTaxonomyTerms(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get taxonomy terms: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, terms)
}
