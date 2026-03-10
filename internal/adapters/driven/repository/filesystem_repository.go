package repository

import (
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/xeipuuv/gojsonschema"
)

type FilesystemRepository struct {
	config domain.HostConfig
}

func NewFilesystemRepository(config domain.HostConfig) ports.RegistryRepository {
	return &FilesystemRepository{config: config}
}

func (r *FilesystemRepository) GetSchemaTree() ([]domain.SchemaNode, error) {
	dataPath := filepath.Join(r.config.DataPath, "data")
	return buildFilteredTree(dataPath, true)
}

func (r *FilesystemRepository) GetServiceTree() ([]domain.SchemaNode, error) {
	return buildFilteredTree(r.config.DataPath, false)
}

func (r *FilesystemRepository) GetGuidelines() ([]domain.MDXItem, error) {
	target := filepath.Join(r.config.DataPath, "guidelines")
	return listMDXContent(target)
}

func (r *FilesystemRepository) GetTrainingItems() ([]domain.MDXItem, error) {
	target := filepath.Join(r.config.DataPath, "training")
	return listMDXContent(target)
}

func (r *FilesystemRepository) UpdateTable(moduleName string, update domain.TableDetail) error {
	dataRoot := filepath.Join(r.config.DataPath, "data")
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
	path := filepath.Join(r.config.DataPath, "_internal", "config", "guidelines.json")
	return readJSON(path)
}

func (r *FilesystemRepository) UpdateGuidelineSelection(selection interface{}) error {
	path := filepath.Join(r.config.DataPath, "_internal", "config", "guidelines.json")
	return writeJSON(path, selection)
}

func (r *FilesystemRepository) GetTrainingSelection() (interface{}, error) {
	path := filepath.Join(r.config.DataPath, "_internal", "config", "training.json")
	return readJSON(path)
}

func (r *FilesystemRepository) UpdateTrainingSelection(selection interface{}) error {
	path := filepath.Join(r.config.DataPath, "_internal", "config", "training.json")
	return writeJSON(path, selection)
}

func (r *FilesystemRepository) GetSchemaDashboard(moduleName string) (domain.SchemaDashboard, error) {
	dataPath := filepath.Join(r.config.DataPath, "data")
	contentPath := filepath.Join(r.config.DataPath, "src", "content", "docs", "registry") // Best guess for content root

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

	masterSchemaPath := filepath.Join(dataRoot, "..", "schema", "schema.json_schema.json")
	schemaLoader := gojsonschema.NewReferenceLoader("file://" + masterSchemaPath)

	err := filepath.WalkDir(contentRoot, func(path string, d os.DirEntry, err error) error {
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
					if _, err := os.Stat(filepath.Join(nodeFullPath, "schema.json")); err == nil {
						hasData = true
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

func writeJSON(path string, val interface{}) error {
	data, err := json.MarshalIndent(val, "", "    ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0644)
}
