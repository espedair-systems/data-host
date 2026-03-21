/*
 * Application Layer: Business Use Cases.
 * Coordinates domain objects to perform specific application tasks.
 */
package services

import (
	"bytes"
	"data-host/artifacts"
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"fmt"
	"html/template"
	"os"
	"path/filepath"
	"strings"

	"github.com/rs/zerolog/log"
)

type GenerationService struct {
	repo ports.RegistryRepository
}

func NewGenerationService(repo ports.RegistryRepository) *GenerationService {
	return &GenerationService{
		repo: repo,
	}
}

type SchemaOverviewData struct {
	Title       string
	Description string
	AssetName   string
	DisplayName string
	Tables      []TableSummary
}

type TableSummary struct {
	Name        string
	Description string
}

type TableGenerationData struct {
	domain.FileTable
	Root        SchemaOverviewData
	DisplayName string
}

type GenerationPlan struct {
	RootPath    string        `json:"rootPath"`
	Directories []string      `json:"directories"`
	Files       []PlannedFile `json:"files"`
}

type PlannedFile struct {
	Name     string `json:"name"`
	Path     string `json:"path"`
	Template string `json:"template"`
	Exists   bool   `json:"exists"`
	Enabled  bool   `json:"enabled"`
}

func (s *GenerationService) GetGenerationPlan(config *domain.HostConfig, assetName string) GenerationPlan {
	root := config.GeneratePath
	if root == "" {
		root = "./generated"
	}

	log.Info().Str("asset", assetName).Msg("Getting generation plan")

	templates, err := s.repo.GetAstroTemplates()
	if err != nil {
		log.Error().Err(err).Msg("Failed to list astro templates from repo")
		return GenerationPlan{
			RootPath:    root,
			Directories: []string{},
			Files:       []PlannedFile{},
		}
	}

	log.Info().Int("count", len(templates)).Msg("Templates found in repository")

	plan := GenerationPlan{
		RootPath:    root,
		Directories: []string{},
		Files:       []PlannedFile{},
	}

	dirMap := make(map[string]bool)
	dirMap[filepath.Join("schema", assetName)] = true

	for _, t := range templates {
		if t.Name == ".gitkeep" {
			continue
		}

		name := t.Name
		var destRelPath string
		var enabled bool

		// Smart defaults for known templates
		baseName := filepath.Base(name)
		dirName := filepath.Dir(name)

		switch baseName {
		case "schema-overview.mdx", "schema_overview.mdx":
			destRelPath = filepath.Join("schema", assetName, "overview.mdx")
			enabled = true
			plan.Files = append(plan.Files, PlannedFile{
				Name:     formatTemplateName(name),
				Path:     destRelPath,
				Template: name,
				Exists:   fileExists(filepath.Join(root, destRelPath)),
				Enabled:  enabled,
			})
		case "table-index.mdx":
			destRelPath = filepath.Join("schema", assetName, "index.mdx")
			enabled = false
			plan.Files = append(plan.Files, PlannedFile{
				Name:     formatTemplateName(name),
				Path:     destRelPath,
				Template: name,
				Exists:   fileExists(filepath.Join(root, destRelPath)),
				Enabled:  enabled,
			})
		case "table-explorer.mdx":
			destRelPath = filepath.Join("schema", assetName, "explorer.mdx")
			enabled = false
			plan.Files = append(plan.Files, PlannedFile{
				Name:     formatTemplateName(name),
				Path:     destRelPath,
				Template: name,
				Exists:   fileExists(filepath.Join(root, destRelPath)),
				Enabled:  enabled,
			})
		case "table-detail.mdx":
			// Expand into one file per table
			schema, err := s.repo.GetFullSchema(assetName)
			if err == nil {
				for _, table := range schema.Tables {
					tableDestRelPath := filepath.Join("schema", assetName, "tables", table.Name+".mdx")
					plan.Files = append(plan.Files, PlannedFile{
						Name:     fmt.Sprintf("Table %s", table.Name),
						Path:     tableDestRelPath,
						Template: name,
						Exists:   fileExists(filepath.Join(root, tableDestRelPath)),
						Enabled:  true,
					})
					// Add directory for tables
					dirMap[filepath.Join("schema", assetName, "tables")] = true
				}
			}
		default:
			// Fallback: maintain structure but prefix with schema/asset
			if dirName == "." {
				destRelPath = filepath.Join("schema", assetName, baseName)
			} else {
				destRelPath = filepath.Join("schema", assetName, dirName, baseName)
			}
			enabled = false
			plan.Files = append(plan.Files, PlannedFile{
				Name:     formatTemplateName(name),
				Path:     destRelPath,
				Template: name,
				Exists:   fileExists(filepath.Join(root, destRelPath)),
				Enabled:  enabled,
			})
		}
	}

	// Ensure all directories in the plan are tracked
	for _, file := range plan.Files {
		curr := filepath.Dir(file.Path)
		for curr != "." && curr != "/" {
			dirMap[curr] = true
			curr = filepath.Dir(curr)
		}
	}

	// Move directories to plan
	for d := range dirMap {
		plan.Directories = append(plan.Directories, d)
	}

	log.Info().Int("files", len(plan.Files)).Msg("Generation plan prepared")
	return plan
}

func formatTemplateName(filename string) string {
	name := strings.TrimSuffix(filename, ".mdx")
	name = strings.ReplaceAll(name, "/", " - ")
	name = strings.ReplaceAll(name, "-", " ")
	name = strings.ReplaceAll(name, "_", " ")
	return strings.Title(name)
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

type GenerateRequest struct {
	Files []PlannedFile `json:"files"`
}

func (s *GenerationService) GenerateSchemaPage(config *domain.HostConfig, assetName string, files []PlannedFile, dryRun bool) error {
	// 1. Get the schema
	schema, err := s.repo.GetFullSchema(assetName)
	if err != nil {
		return fmt.Errorf("failed to get schema for %s: %w", assetName, err)
	}

	// 2. Prepare data for template
	data := SchemaOverviewData{
		Title:       fmt.Sprintf("%s Schema Overview", assetName),
		Description: schema.Desc,
		AssetName:   assetName,
		DisplayName: assetName,
	}

	for _, table := range schema.Tables {
		data.Tables = append(data.Tables, TableSummary{
			Name:        table.Name,
			Description: table.Comment,
		})
	}

	for _, file := range files {
		if !file.Enabled {
			continue
		}

		// 3. Load template
		// Try local disk first (LocalArtifactsDir/templates)
		var tmplData []byte
		localDir := config.LocalArtifactsDir
		if localDir == "" {
			localDir = "./artifacts"
		}
		localPath := filepath.Join(localDir, "templates", file.Template)

		if _, err := os.Stat(localPath); err == nil {
			tmplData, err = os.ReadFile(localPath)
			if err != nil {
				return fmt.Errorf("failed to read local template %s: %w", file.Template, err)
			}
			log.Debug().Str("template", file.Template).Str("path", localPath).Msg("Loaded template from disk")
		} else {
			// Fallback to embedded
			tmplData, err = artifacts.Content.ReadFile(filepath.Join("templates", file.Template))
			if err != nil {
				return fmt.Errorf("failed to read embedded template %s: %w", file.Template, err)
			}
			log.Debug().Str("template", file.Template).Msg("Loaded template from embedded FS")
		}

		tmpl, err := template.New(file.Name).Parse(string(tmplData))
		if err != nil {
			return fmt.Errorf("failed to parse template %s: %w", file.Template, err)
		}

		destPath := filepath.Join(config.GeneratePath, file.Path)
		var executionData interface{} = data

		// If it's a table detail page, provide the specific table data
		if strings.Contains(file.Path, "/tables/") {
			tableName := strings.TrimSuffix(filepath.Base(file.Path), ".mdx")
			for _, table := range schema.Tables {
				if table.Name == tableName {
					executionData = TableGenerationData{
						FileTable:   table,
						Root:        data,
						DisplayName: table.Name,
					}
					break
				}
			}
		}

		if dryRun {
			// Just validate template execution
			var buf bytes.Buffer
			if err := tmpl.Execute(&buf, executionData); err != nil {
				return fmt.Errorf("dry run failed for %s: %w", file.Name, err)
			}
			continue
		}

		// 4. Create destination directory
		if err := os.MkdirAll(filepath.Dir(destPath), 0755); err != nil {
			return fmt.Errorf("failed to create directory for %s: %w", destPath, err)
		}

		// 5. Execute template
		var buf bytes.Buffer
		if err := tmpl.Execute(&buf, executionData); err != nil {
			return fmt.Errorf("failed to execute template for %s: %w", file.Name, err)
		}

		// 6. Write output file
		if err := os.WriteFile(destPath, buf.Bytes(), 0644); err != nil {
			return fmt.Errorf("failed to write file %s: %w", destPath, err)
		}
	}

	return nil
}
