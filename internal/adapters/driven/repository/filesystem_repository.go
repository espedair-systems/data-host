/*
 * Driven Adapter: Infrastructure / Implementation.
 * Implements outbound ports for external systems like databases or filesystems.
 */
package repository

import (
	"data-host/artifacts"
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"encoding/json"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/goccy/go-yaml"
	"github.com/rs/zerolog/log"
	"github.com/xeipuuv/gojsonschema"
)

type FilesystemRepository struct {
	config domain.HostConfig
}

func NewFilesystemRepository(config domain.HostConfig) ports.RegistryRepository {
	return &FilesystemRepository{config: config}
}

func (r *FilesystemRepository) GetSchemaTree() ([]domain.SchemaNode, error) {
	dataPath := filepath.Join(r.getProjectRoot(), "data")
	return buildFilteredTree(dataPath, true)
}

func (r *FilesystemRepository) GetServiceTree() ([]domain.SchemaNode, error) {
	return buildFilteredTree(r.getProjectRoot(), false)
}

func (r *FilesystemRepository) GetGuidelines() ([]domain.MDXItem, error) {
	target := filepath.Join(r.getProjectRoot(), "guidelines")
	return listMDXContent(target)
}

func (r *FilesystemRepository) GetTrainingItems() ([]domain.MDXItem, error) {
	target := filepath.Join(r.getProjectRoot(), "training")
	return listMDXContent(target)
}

func (r *FilesystemRepository) UpdateTable(moduleName string, update domain.TableDetail) error {
	dataRoot := filepath.Join(r.getProjectRoot(), "data")
	schemaFile := filepath.Join(dataRoot, moduleName, "schema.json")

	data, err := os.ReadFile(schemaFile)
	if err != nil {
		return fmt.Errorf("failed to read schema file: %w", err)
	}

	var finalData map[string]interface{}
	if err := json.Unmarshal(data, &finalData); err != nil {
		return fmt.Errorf("failed to parse schema: %w", err)
	}

	tables, ok := finalData["tables"].([]interface{})
	if !ok {
		return fmt.Errorf("tables field not found or not an array")
	}

	found := false
	for i, t := range tables {
		tableMap, ok := t.(map[string]interface{})
		if !ok {
			continue
		}
		if name, ok := tableMap["name"].(string); ok && name == update.Name {
			tableMap["type"] = update.Type
			tableMap["comment"] = update.Description

			cols := make([]map[string]interface{}, 0, len(update.Columns))
			for _, col := range update.Columns {
				cols = append(cols, map[string]interface{}{
					"name":     col.Name,
					"type":     col.Type,
					"comment":  col.Description,
					"nullable": true,
				})
			}
			tableMap["columns"] = cols
			tables[i] = tableMap
			found = true
			break
		}
	}

	if !found {
		return fmt.Errorf("table not found")
	}

	output, _ := json.MarshalIndent(finalData, "", "    ")
	return os.WriteFile(schemaFile, output, 0644)
}

func (r *FilesystemRepository) GetGuidelineSelection() (interface{}, error) {
	path := filepath.Join(r.getProjectRoot(), "src", "config", "guidelines.json")
	return readJSON(path)
}

func (r *FilesystemRepository) UpdateGuidelineSelection(selection interface{}) error {
	path := filepath.Join(r.getProjectRoot(), "src", "config", "guidelines.json")
	return writeJSON(path, selection)
}

func (r *FilesystemRepository) GetTrainingSelection() (interface{}, error) {
	path := filepath.Join(r.getProjectRoot(), "src", "config", "training.json")
	return readJSON(path)
}

func (r *FilesystemRepository) UpdateTrainingSelection(selection interface{}) error {
	path := filepath.Join(r.getProjectRoot(), "src", "config", "training.json")
	return writeJSON(path, selection)
}

func (r *FilesystemRepository) GetBlueprintSchemas() ([]domain.BlueprintSchema, error) {
	return []domain.BlueprintSchema{}, nil
}

func (r *FilesystemRepository) GetBlueprintTables(criteria map[string]string) ([]domain.BlueprintTableSummary, error) {
	return []domain.BlueprintTableSummary{}, nil
}

func (r *FilesystemRepository) GetFullSchema(name string) (*domain.FileSchema, error) {
	return nil, fmt.Errorf("GetFullSchema not implemented in filesystem mode")
}

func (r *FilesystemRepository) SaveFullSchema(schema domain.FileSchema) error {
	return fmt.Errorf("SaveFullSchema not implemented in filesystem mode")
}

func (r *FilesystemRepository) GetUserRepo() ports.UserRepository {
	return nil
}

func (r *FilesystemRepository) GetDatabaseStats() (domain.DatabaseStats, error) {
	return domain.DatabaseStats{}, nil
}

func (r *FilesystemRepository) GetTableData(tableName string, limit, offset int) (domain.TableData, error) {
	return domain.TableData{}, fmt.Errorf("GetTableData not supported in filesystem mode")
}

func (r *FilesystemRepository) GetTableCount(tableName string) (int64, error) {
	return 0, fmt.Errorf("GetTableCount not supported in filesystem mode")
}

func (r *FilesystemRepository) ExtractDatabaseSchema(name, desc string) (*domain.FileSchema, error) {
	return nil, fmt.Errorf("ExtractDatabaseSchema not supported in filesystem mode")
}

func (r *FilesystemRepository) GetPublishedAssets() ([]domain.PublishedAsset, error) {
	// The master schema is now embedded
	masterData, err := artifacts.Content.ReadFile("schema/services.schema.json")
	if err != nil {
		return nil, fmt.Errorf("failed to read embedded master schema: %w", err)
	}
	schemaLoader := gojsonschema.NewBytesLoader(masterData)

	var assets []domain.PublishedAsset
	sites := r.config.Sites
	if len(sites) == 0 {
		// Attempt to use ActiveSite fallback if no sites are explicitly defined in slice
		sites = []domain.SiteConfig{r.config.ActiveSite()}
	}

	for _, site := range sites {
		dataRoot := filepath.Join(site.DataPath, "data")
		log.Debug().Str("site", site.Name).Str("dataRoot", dataRoot).Msg("Scanning for published assets")

		entries, err := os.ReadDir(dataRoot)
		if err != nil {
			log.Warn().Str("dataRoot", dataRoot).Err(err).Msg("Failed to read site data root")
			continue
		}

		for _, entry := range entries {
			if entry.IsDir() {
				name := entry.Name()
				assetPath := filepath.Join(dataRoot, name)
				asset := domain.PublishedAsset{
					Name:           name,
					SchemaPath:     filepath.Join(assetPath, "schema.json"),
					CollectionPath: filepath.Join(assetPath, "collections.json"),
					IsValid:        true,
				}

				if data, err := os.ReadFile(asset.SchemaPath); err == nil {
					asset.HasSchema = true
					info, _ := os.Stat(asset.SchemaPath)
					asset.LastModified = info.ModTime().Format(time.RFC3339)

					// Extract stats and name
					var sData struct {
						Name      string        `json:"name"`
						Tables    []interface{} `json:"tables"`
						Relations []interface{} `json:"relations"`
					}
					if err := json.Unmarshal(data, &sData); err == nil {
						asset.InternalName = sData.Name
						asset.TableCount = len(sData.Tables)
						asset.RelationCount = len(sData.Relations)
					}

					// Validation
					documentLoader := gojsonschema.NewStringLoader(string(data))
					result, err := gojsonschema.Validate(schemaLoader, documentLoader)
					if err == nil {
						asset.IsValid = result.Valid()
						if !result.Valid() {
							for _, desc := range result.Errors() {
								asset.ValidationErr = append(asset.ValidationErr, desc.String())
							}
						}
					} else {
						asset.IsValid = false
						asset.ValidationErr = []string{err.Error()}
					}
				} else {
					asset.IsValid = false
					asset.ValidationErr = []string{"schema.json missing or unreadable"}
				}

				if _, err := os.Stat(asset.CollectionPath); err == nil {
					asset.HasCollections = true
				}

				assets = append(assets, asset)
			}
		}
	}

	// Also check the legacy root/data if not already covered
	legacyRoot := filepath.Join(r.getProjectRoot(), "data")
	if !isPathCovered(legacyRoot, sites) {
		if entries, err := os.ReadDir(legacyRoot); err == nil {
			for _, entry := range entries {
				if entry.IsDir() {
					// Add logic to avoid duplicates if name exists
					exists := false
					for _, a := range assets {
						if a.Name == entry.Name() {
							exists = true
							break
						}
					}
					if exists {
						continue
					}

					name := entry.Name()
					assetPath := filepath.Join(legacyRoot, name)
					asset := domain.PublishedAsset{
						Name:           name,
						SchemaPath:     filepath.Join(assetPath, "schema.json"),
						CollectionPath: filepath.Join(assetPath, "collections.json"),
						IsValid:        true,
					}
					// (Re-using same logic here is repetitive, maybe refactor later if needed)
					if _, err := os.ReadFile(asset.SchemaPath); err == nil {
						asset.HasSchema = true
						info, _ := os.Stat(asset.SchemaPath)
						asset.LastModified = info.ModTime().Format(time.RFC3339)
						assets = append(assets, asset)
					}
				}
			}
		}
	}

	return assets, nil
}

func isPathCovered(path string, sites []domain.SiteConfig) bool {
	for _, s := range sites {
		if filepath.Join(s.DataPath, "data") == path {
			return true
		}
	}
	return false
}

func (r *FilesystemRepository) GetTableAssets() ([]domain.PublishedAsset, error) {
	var allAssets []domain.PublishedAsset
	sites := r.config.Sites
	if len(sites) == 0 {
		sites = []domain.SiteConfig{r.config.ActiveSite()}
	}

	for _, site := range sites {
		dataRoot := filepath.Join(site.DataPath, "data")
		registryRoot := filepath.Join(site.DataPath, "src", "content", "docs", "registry", "schema")

		entries, err := os.ReadDir(registryRoot)
		if err != nil {
			continue
		}

		for _, entry := range entries {
			if entry.IsDir() {
				name := entry.Name()
				schemaPath := filepath.Join(dataRoot, name, "schema.json")

				// Check if associated schema.json exists in data folder
				if data, err := os.ReadFile(schemaPath); err == nil {
					asset := domain.PublishedAsset{
						Name:       name,
						HasSchema:  true,
						SchemaPath: schemaPath,
						IsValid:    true,
					}
					// Extract internal name
					var sData struct {
						Name string `json:"name"`
					}
					if err := json.Unmarshal(data, &sData); err == nil {
						asset.InternalName = sData.Name
					}
					allAssets = append(allAssets, asset)
				}
			}
		}
	}
	return allAssets, nil
}

func (r *FilesystemRepository) GetRegistryTables(assetName string) ([]domain.RegistryTable, error) {
	sites := r.config.Sites
	if len(sites) == 0 {
		sites = []domain.SiteConfig{r.config.ActiveSite()}
	}

	var tablesRoot string
	for _, site := range sites {
		path := filepath.Join(site.DataPath, "src", "content", "docs", "registry", "schema", assetName, "tables")
		if _, err := os.Stat(path); err == nil {
			tablesRoot = path
			break
		}
	}

	if tablesRoot == "" {
		// Fallback
		tablesRoot = filepath.Join(r.getProjectRoot(), "src", "content", "docs", "registry", "schema", assetName, "tables")
	}

	entries, err := os.ReadDir(tablesRoot)
	if err != nil {
		if os.IsNotExist(err) {
			return []domain.RegistryTable{}, nil
		}
		return nil, err
	}

	var tables []domain.RegistryTable
	for _, entry := range entries {
		if entry.IsDir() {
			tables = append(tables, domain.RegistryTable{
				Name: entry.Name(),
				InFS: true,
			})
		}
	}

	return tables, nil
}

func (r *FilesystemRepository) getProjectRoot() string {
	site := r.config.ActiveSite()
	if site.MountSource != "" {
		return site.MountSource
	}
	return site.DataPath
}

func (r *FilesystemRepository) GetWorkflows() ([]domain.DesignFile, error) {
	return r.listEmbeddedFiles("workflows")
}

func (r *FilesystemRepository) GetAstroTemplates() ([]domain.DesignFile, error) {
	// 1. Get embedded
	embeddedFiles, err := r.listEmbeddedFiles("templates")
	if err != nil {
		log.Warn().Err(err).Msg("Failed to list embedded templates")
		embeddedFiles = []domain.DesignFile{}
	}

	// 2. Get local disk
	localDir := r.config.LocalArtifactsDir
	if localDir == "" {
		localDir = "./artifacts"
	}
	templatesDir := filepath.Join(localDir, "templates")

	var localFiles []domain.DesignFile
	if _, err := os.Stat(templatesDir); err == nil {
		// Use a recursive walk for local templates too to match embedded behavior
		err = filepath.WalkDir(templatesDir, func(path string, d os.DirEntry, err error) error {
			if err != nil || d.IsDir() || d.Name() == ".gitkeep" {
				return nil
			}
			relPath, _ := filepath.Rel(templatesDir, path)
			info, _ := d.Info()
			localFiles = append(localFiles, domain.DesignFile{
				Name:         relPath,
				Size:         info.Size(),
				LastModified: info.ModTime().Format(time.RFC3339),
			})
			return nil
		})
		if err != nil {
			log.Warn().Err(err).Str("path", templatesDir).Msg("Failed to walk local templates directory")
		}
	}

	// 3. Merge (Unique by Name)
	fileMap := make(map[string]domain.DesignFile)
	for _, f := range embeddedFiles {
		fileMap[f.Name] = f
	}
	for _, f := range localFiles {
		fileMap[f.Name] = f // Overwrite with local if same name
	}

	result := make([]domain.DesignFile, 0, len(fileMap))
	for _, f := range fileMap {
		result = append(result, f)
	}

	return result, nil
}

func (r *FilesystemRepository) listEmbeddedFiles(basePath string) ([]domain.DesignFile, error) {
	var files []domain.DesignFile

	err := fs.WalkDir(artifacts.Content, basePath, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() || d.Name() == ".gitkeep" {
			return nil
		}

		// Relative path from basePath
		relPath, err := filepath.Rel(basePath, path)
		if err != nil {
			return nil
		}

		info, err := d.Info()
		if err != nil {
			return nil
		}

		files = append(files, domain.DesignFile{
			Name:         relPath,
			Size:         info.Size(),
			LastModified: info.ModTime().Format(time.RFC3339),
		})
		return nil
	})

	if err != nil {
		log.Warn().Err(err).Str("path", basePath).Msg("Failed to walk embedded directory")
		return []domain.DesignFile{}, nil
	}

	return files, nil
}

func (r *FilesystemRepository) listDesignFiles(dir string) ([]domain.DesignFile, error) {
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		return []domain.DesignFile{}, nil
	}

	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	var files []domain.DesignFile
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		info, err := entry.Info()
		if err != nil {
			continue
		}
		files = append(files, domain.DesignFile{
			Name:         entry.Name(),
			Size:         info.Size(),
			LastModified: info.ModTime().Format(time.RFC3339),
		})
	}
	return files, nil
}

func (r *FilesystemRepository) GetPublishedFile(assetName, fileName string) ([]byte, error) {
	sites := r.config.Sites
	if len(sites) == 0 {
		sites = []domain.SiteConfig{r.config.ActiveSite()}
	}

	for _, site := range sites {
		path := filepath.Join(site.DataPath, "data", assetName, fileName)
		if _, err := os.Stat(path); err == nil {
			return os.ReadFile(path)
		}
	}

	// Legacy fallback
	path := filepath.Join(r.getProjectRoot(), "data", assetName, fileName)
	return os.ReadFile(path)
}

func (r *FilesystemRepository) SavePublishedFile(assetName, fileName string, content []byte) error {
	sites := r.config.Sites
	if len(sites) == 0 {
		sites = []domain.SiteConfig{r.config.ActiveSite()}
	}

	var targetDir string
	// Try to find if it already exists in any site
	for _, site := range sites {
		path := filepath.Join(site.DataPath, "data", assetName, fileName)
		if _, err := os.Stat(path); err == nil {
			targetDir = filepath.Dir(path)
			break
		}
	}

	// Not found? Use active site
	if targetDir == "" {
		active := r.config.ActiveSite()
		targetDir = filepath.Join(active.DataPath, "data", assetName)
	}

	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return err
	}
	path := filepath.Join(targetDir, fileName)
	return os.WriteFile(path, content, 0644)
}

func (r *FilesystemRepository) GetAllSchemaDashboards() ([]domain.SchemaDashboard, error) {
	projectRoot := r.getProjectRoot()
	dataPath := filepath.Join(projectRoot, "data")
	contentPath := filepath.Join(projectRoot, "src", "content", "docs", "registry")

	return listSchemaDashboards(contentPath, dataPath)
}

func (r *FilesystemRepository) GetSchemaDashboard(moduleName string) (domain.SchemaDashboard, error) {
	projectRoot := r.getProjectRoot()
	dataPath := filepath.Join(projectRoot, "data")
	contentPath := filepath.Join(projectRoot, "src", "content", "docs", "registry")

	dashboards, err := listSchemaDashboards(contentPath, dataPath)
	if err != nil {
		return domain.SchemaDashboard{}, err
	}

	for _, d := range dashboards {
		if d.Name == moduleName {
			return d, nil
		}
	}

	return domain.SchemaDashboard{}, fmt.Errorf("module %s not found", moduleName)
}

func listSchemaDashboards(contentRoot, dataRoot string) ([]domain.SchemaDashboard, error) {
	var dashboards []domain.SchemaDashboard

	masterData, err := artifacts.Content.ReadFile("schema/services.schema.json")
	if err != nil {
		return nil, fmt.Errorf("failed to read embedded master schema: %w", err)
	}
	schemaLoader := gojsonschema.NewBytesLoader(masterData)

	err = filepath.WalkDir(contentRoot, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}

		if d.IsDir() && d.Name() == "schema" {
			subEntries, err := os.ReadDir(path)
			if err != nil {
				return nil
			}

			for _, sub := range subEntries {
				if sub.IsDir() {
					schemaName := sub.Name()
					dash := domain.SchemaDashboard{
						Name:        schemaName,
						ContentPath: path,
						DataPath:    filepath.Join(dataRoot, schemaName),
					}

					dataPath := filepath.Join(dataRoot, schemaName)
					schemaFile := filepath.Join(dataPath, "schema.json")
					collectionsFile := filepath.Join(dataPath, "collections.json")

					if _, err := os.Stat(schemaFile); err == nil {
						dash.HasSchema = true
						// Extract stats
						data, err := os.ReadFile(schemaFile)
						if err == nil {
							var sData struct {
								Name   string `json:"name"`
								Desc   string `json:"desc"`
								Tables []struct {
									Name    string `json:"name"`
									Type    string `json:"type"`
									Comment string `json:"comment"`
									Columns []struct {
										Name    string `json:"name"`
										Type    string `json:"type"`
										Comment string `json:"comment"`
									} `json:"columns"`
									Indexes     []interface{} `json:"indexes"`
									Constraints []interface{} `json:"constraints"`
								} `json:"tables"`
								Relations []domain.RelationDetail `json:"relations"`
							}
							if err := json.Unmarshal(data, &sData); err == nil {
								stats := &domain.SchemaStats{
									Tables:      len(sData.Tables),
									TableDetail: make([]domain.TableDetail, 0, len(sData.Tables)),
									Relations:   sData.Relations,
								}
								for _, t := range sData.Tables {
									cols := make([]domain.ColumnInfo, 0, len(t.Columns))
									for _, c := range t.Columns {
										cols = append(cols, domain.ColumnInfo{
											Name:        c.Name,
											Type:        c.Type,
											Description: c.Comment,
										})
									}
									stats.TableDetail = append(stats.TableDetail, domain.TableDetail{
										Name:        t.Name,
										Type:        t.Type,
										Description: t.Comment,
										Columns:     cols,
										Indexes:     len(t.Indexes),
										Constraints: len(t.Constraints),
									})
								}
								dash.SchemaStats = stats
							}

							// Validate
							documentLoader := gojsonschema.NewStringLoader(string(data))
							result, err := gojsonschema.Validate(schemaLoader, documentLoader)
							if err == nil {
								vr := &domain.ValidationResult{Valid: result.Valid()}
								if !result.Valid() {
									for _, desc := range result.Errors() {
										vr.Errors = append(vr.Errors, desc.String())
									}
								}
								dash.Validation = vr
							}
						}
					}

					if _, err := os.Stat(collectionsFile); err == nil {
						dash.HasCollections = true
						data, err := os.ReadFile(collectionsFile)
						if err == nil {
							var cData []domain.CollectionDetail
							if err := json.Unmarshal(data, &cData); err == nil {
								dash.Collections = cData
								dash.CollectionStats = &domain.CollectionStats{Count: len(cData)}
							}
						}
					}

					dashboards = append(dashboards, dash)
				}
			}
		}
		return nil
	})

	return dashboards, err
}

// Helper functions (copied from gin_adapter and refined)

func buildFilteredTree(root string, filterData bool) ([]domain.SchemaNode, error) {
	var walk func(string, string) ([]domain.SchemaNode, error)
	walk = func(currentPath, relPath string) ([]domain.SchemaNode, error) {
		entries, err := os.ReadDir(currentPath)
		if err != nil {
			return nil, err
		}

		var nodes []domain.SchemaNode
		for _, entry := range entries {
			name := entry.Name()
			if strings.HasPrefix(name, ".") {
				continue
			}

			nodeRelPath := filepath.Join(relPath, name)
			nodeFullPath := filepath.Join(currentPath, name)

			if entry.IsDir() {
				children, err := walk(nodeFullPath, nodeRelPath)
				if err != nil {
					return nil, err
				}

				hasData := false
				if filterData {
					schemaPath := filepath.Join(nodeFullPath, "schema.json")
					if _, err := os.Stat(schemaPath); err == nil {
						hasData = true
						// NEW: Read tables and add as virtual children
						if tables, err := readTablesFromSchema(schemaPath); err == nil {
							for _, t := range tables {
								children = append(children, domain.SchemaNode{
									Name:    t,
									Path:    filepath.Join(nodeRelPath, t),
									IsDir:   false,
									HasData: true,
								})
							}
						}
					} else if _, err := os.Stat(filepath.Join(nodeFullPath, "collection.json")); err == nil {
						hasData = true
					}
				}

				if !filterData || hasData || len(children) > 0 {
					nodes = append(nodes, domain.SchemaNode{
						Name:     name,
						Path:     nodeRelPath,
						IsDir:    true,
						HasData:  hasData,
						Children: children,
					})
				}
			} else if !filterData {
				nodes = append(nodes, domain.SchemaNode{
					Name:    name,
					Path:    nodeRelPath,
					IsDir:   false,
					HasData: false,
				})
			}
		}
		return nodes, nil
	}

	if _, err := os.Stat(root); os.IsNotExist(err) {
		return []domain.SchemaNode{}, nil
	}

	return walk(root, "")
}

func listMDXContent(dir string) ([]domain.MDXItem, error) {
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		return []domain.MDXItem{}, nil
	}

	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	var items []domain.MDXItem
	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".mdx") || entry.Name() == "index.mdx" {
			continue
		}

		path := filepath.Join(dir, entry.Name())
		content, err := os.ReadFile(path)
		if err != nil {
			continue
		}

		item := domain.MDXItem{
			FileName: entry.Name(),
		}

		lines := strings.Split(string(content), "\n")
		inFrontmatter := false
		for _, line := range lines {
			line = strings.TrimSpace(line)
			if line == "---" {
				if !inFrontmatter {
					inFrontmatter = true
					continue
				} else {
					break
				}
			}

			if inFrontmatter {
				if strings.HasPrefix(line, "title:") {
					item.Title = strings.TrimSpace(strings.TrimPrefix(line, "title:"))
					item.Title = strings.Trim(item.Title, "\"'")
				} else if strings.HasPrefix(line, "description:") {
					item.Description = strings.TrimSpace(strings.TrimPrefix(line, "description:"))
					item.Description = strings.Trim(item.Description, "\"'")
				}
			}
		}

		if item.Title == "" {
			item.Title = entry.Name()
		}

		items = append(items, item)
	}

	return items, nil
}

func readJSON(path string) (interface{}, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var val interface{}
	if err := json.Unmarshal(data, &val); err != nil {
		return nil, err
	}
	return val, nil
}

func (r *FilesystemRepository) GetSites() ([]domain.SiteConfig, error) {
	var sites []domain.SiteConfig

	// 1. If deploy is IDE, use sites explicitly defined in the config
	if strings.ToUpper(r.config.Deploy) == "IDE" {
		if len(r.config.Sites) > 0 {
			sites = make([]domain.SiteConfig, len(r.config.Sites))
			copy(sites, r.config.Sites)
		}
	} else if r.config.SitePath != "" {
		// 2. Otherwise, discover sites in SitePath
		entries, err := os.ReadDir(r.config.SitePath)
		if err == nil {
			for _, entry := range entries {
				if entry.IsDir() {
					siteRoot := filepath.Join(r.config.SitePath, entry.Name())
					sites = append(sites, domain.SiteConfig{
						Name:        entry.Name(),
						DataPath:    siteRoot,
						MountPath:   "/host/" + entry.Name(),
						MountSource: siteRoot,
						MountDist:   filepath.Join(siteRoot, "dist"),
						Active:      true,
					})
				}
			}
		} else {
			log.Warn().Err(err).Str("site_path", r.config.SitePath).Msg("failed to read site_path for discovery")
		}
	}

	// Fallback to active site if still empty
	if len(sites) == 0 {
		sites = []domain.SiteConfig{r.config.ActiveSite()}
	}

	// 3. Enrich with site.json/site.yaml data if present
	for i := range sites {
		site := &sites[i]
		// Try multiple possible paths and formats
		var content []byte
		var errRead error

		paths := []string{
			filepath.Join(site.DataPath, "site.json"),
			filepath.Join(site.DataPath, "data", "site.json"),
			filepath.Join(site.DataPath, "site.yaml"),
			filepath.Join(site.DataPath, "site.yml"),
			filepath.Join(site.DataPath, "data", "site.yaml"),
		}

		var foundPath string
		for _, p := range paths {
			if _, err := os.Stat(p); err == nil {
				content, errRead = os.ReadFile(p)
				if errRead == nil {
					foundPath = p
					break
				}
			}
		}

		if foundPath != "" {
			// Intermediate struct for flexible parsing
			var meta struct {
				Name        string      `json:"name" yaml:"name"`
				Description string      `json:"description" yaml:"description"`
				Type        string      `json:"type" yaml:"type"`
				DataPath    string      `json:"data_path" yaml:"data_path"`
				SitePath    string      `json:"site_path" yaml:"site_path"`
				SchemaPath  string      `json:"schema_path" yaml:"schema_path"`
				SiteDist    string      `json:"site_dist" yaml:"site_dist"`
				PublishURL  string      `json:"publish_url" yaml:"publish_url"`
				MountPath   string      `json:"mount_path" yaml:"mount_path"`
				MountSource string      `json:"mount_source" yaml:"mount_source"`
				MountDist   string      `json:"mount_dist" yaml:"mount_dist"`
				Active      interface{} `json:"active" yaml:"active"`
			}

			var errUnmarshal error
			if strings.HasSuffix(foundPath, ".json") {
				errUnmarshal = json.Unmarshal(content, &meta)
			} else {
				// Use YAML unmarshaler
				errUnmarshal = yaml.Unmarshal(content, &meta)
			}

			if errUnmarshal == nil {
				if meta.Name != "" {
					site.Name = meta.Name
				}
				if meta.Description != "" {
					site.Description = meta.Description
				}
				if meta.Type != "" {
					site.Type = meta.Type
				}
				if meta.DataPath != "" {
					site.DataPath = meta.DataPath
				}
				if meta.SitePath != "" {
					site.SitePath = meta.SitePath
				}
				if meta.SchemaPath != "" {
					site.SchemaPath = meta.SchemaPath
				}
				if meta.SiteDist != "" {
					site.SiteDist = meta.SiteDist
				}
				if meta.PublishURL != "" {
					site.PublishURL = meta.PublishURL
				}
				if meta.MountPath != "" {
					site.MountPath = meta.MountPath
				}
				if meta.MountSource != "" {
					site.MountSource = meta.MountSource
				}
				if meta.MountDist != "" {
					site.MountDist = meta.MountDist
				}

				// Handle flexible boolean for 'active'
				if meta.Active != nil {
					switch v := meta.Active.(type) {
					case bool:
						site.Active = v
					case string:
						site.Active = strings.ToLower(v) == "true"
					}
				}
			}
		}
	}
	return sites, nil
}

func (r *FilesystemRepository) SaveSiteConfig(site domain.SiteConfig) error {
	return fmt.Errorf("site registration not supported in filesystem mode")
}

func (r *FilesystemRepository) GetFileArchives() ([]domain.FileArchive, error) {
	return []domain.FileArchive{}, nil
}

func (r *FilesystemRepository) SaveFileArchive(archive domain.FileArchive) error {
	return nil
}

func (r *FilesystemRepository) DeleteFileArchive(id int) error {
	return nil
}

func writeJSON(path string, val interface{}) error {
	data, err := json.MarshalIndent(val, "", "    ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0644)
}
func readTablesFromSchema(filePath string) ([]string, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	var schema domain.FileSchema
	if err := json.Unmarshal(data, &schema); err != nil {
		return nil, err
	}

	var tables []string
	for _, t := range schema.Tables {
		tables = append(tables, t.Name)
	}
	return tables, nil
}

func (r *FilesystemRepository) SaveOrgStructure(payload interface{}) error {
	log.Info().Msg("Saving organizational structure to filesystem")
	data, err := json.MarshalIndent(payload, "", "  ")
	if err != nil {
		log.Error().Err(err).Msg("Failed to marshal org structure")
		return err
	}

	path := filepath.Join(r.getProjectRoot(), "system-organization.json")
	err = os.WriteFile(path, data, 0644)
	if err != nil {
		log.Error().Err(err).Str("path", path).Msg("Failed to write org structure to file")
		return err
	}

	log.Info().Str("path", path).Msg("successfully saved org structure")
	return nil
}

func (r *FilesystemRepository) SaveDFDStructure(payload interface{}) error {
	log.Info().Msg("Saving DFD structure to filesystem")
	data, err := json.MarshalIndent(payload, "", "  ")
	if err != nil {
		log.Error().Err(err).Msg("Failed to marshal DFD structure")
		return err
	}

	path := filepath.Join(r.getProjectRoot(), "system-dfd.json")
	err = os.WriteFile(path, data, 0644)
	if err != nil {
		log.Error().Err(err).Str("path", path).Msg("Failed to write DFD structure to file")
		return err
	}

	log.Info().Str("path", path).Msg("successfully saved DFD structure")
	return nil
}
func (r *FilesystemRepository) GetOrgStructure() (interface{}, error) {
	path := filepath.Join(r.getProjectRoot(), "system-organization.json")
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var payload interface{}
	if err := json.Unmarshal(data, &payload); err != nil {
		return nil, err
	}
	return payload, nil
}

func (r *FilesystemRepository) GetDFDStructure() (interface{}, error) {
	path := filepath.Join(r.getProjectRoot(), "system-dfd.json")
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var payload interface{}
	if err := json.Unmarshal(data, &payload); err != nil {
		return nil, err
	}
	return payload, nil
}
