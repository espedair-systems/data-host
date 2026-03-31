package http

import (
	"crypto/sha256"
	"data-host/internal/core/domain"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// IngestCMDBSnapshot handles the HTTP POST request to ingest a new CMDB inventory snapshot.
// It parses the JSON body into a domain.CMDBSnapshot, persists it to the repository,
// archives the original content, and records the event in the file archive.
func (a *GinAdapter) IngestCMDBSnapshot(c *gin.Context) {
	var snapshot domain.CMDBSnapshot
	if err := c.ShouldBindJSON(&snapshot); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid CMDB Snapshot format: " + err.Error()})
		return
	}

	if err := a.repo.SaveCMDBSnapshot(&snapshot); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save CMDB snapshot: " + err.Error()})
		return
	}

	// Archive the file
	jsonBytes, _ := json.Marshal(snapshot)
	hasher := sha256.New()
	hasher.Write(jsonBytes)
	fileHash := hex.EncodeToString(hasher.Sum(nil))

	var fileName, filePath string
	if a.config.ArchivePath != "" {
		archiveDir := a.config.ArchivePath
		if err := os.MkdirAll(archiveDir, 0755); err == nil {
			fileName = fmt.Sprintf("cmdb_%s_%s_%d.json", snapshot.SnapshotName, snapshot.SnapshotVersion, time.Now().Unix())
			filePath = filepath.Join(archiveDir, fileName)
			_ = os.WriteFile(filePath, jsonBytes, 0644)
		}
	}

	_ = a.repo.SaveFileArchive(domain.FileArchive{
		Name:        snapshot.SnapshotName + " " + snapshot.SnapshotVersion,
		FileName:    fileName,
		Path:        filePath,
		Type:        "cmdb",
		Description: snapshot.Description,
		Hash:        fileHash,
		Status:      "synced",
	})

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "CMDB Snapshot ingested successfully"})
}

// GetCMDBSnapshots handles the HTTP GET request to retrieve a list of all available CMDB snapshots.
func (a *GinAdapter) GetCMDBSnapshots(c *gin.Context) {
	snapshots, err := a.repo.GetCMDBSnapshots()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get CMDB snapshots: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, snapshots)
}

// GetCMDBSnapshot handles the HTTP GET request to retrieve metadata and summary stats for a specific snapshot.
func (a *GinAdapter) GetCMDBSnapshot(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	snapshot, err := a.repo.GetCMDBSnapshotByID(id)
	if err != nil || snapshot == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "CMDB Snapshot not found"})
		return
	}
	c.JSON(http.StatusOK, snapshot)
}

// GetCMDBOwners handles the HTTP GET request to retrieve all owners associated with a specific snapshot.
func (a *GinAdapter) GetCMDBOwners(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	owners, err := a.repo.GetCMDBOwners(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get owners: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, owners)
}

// GetCMDBSystems handles the HTTP GET request to retrieve all systems defined in a specific snapshot.
func (a *GinAdapter) GetCMDBSystems(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	systems, err := a.repo.GetCMDBSystems(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get systems: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, systems)
}

// GetCMDBDatabases handles the HTTP GET request to retrieve all databases defined in a specific snapshot.
func (a *GinAdapter) GetCMDBDatabases(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	databases, err := a.repo.GetCMDBDatabases(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get databases: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, databases)
}

// GetCMDBRelationships handles the HTTP GET request to retrieve all inter-entity relationships in a specific snapshot.
func (a *GinAdapter) GetCMDBRelationships(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	relationships, err := a.repo.GetCMDBRelationships(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get relationships: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, relationships)
}

// DeleteCMDBSnapshot handles the HTTP DELETE request to remove a snapshot and join tables (cascade delete).
func (a *GinAdapter) DeleteCMDBSnapshot(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	if err := a.repo.DeleteCMDBSnapshot(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete snapshot: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success", "message": "Snapshot deleted successfully"})
}
