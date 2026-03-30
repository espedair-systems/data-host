/*
 * Ports: Primary and Secondary interface definitions.
 * Defines the boundaries of the core application.
 */
package ports

import (
	"data-host/internal/core/domain"
)

type RegistryRepository interface {
	// Schema operations
	GetSchemaTree() ([]domain.SchemaNode, error)
	GetSchemaDashboard(moduleName string) (domain.SchemaDashboard, error)
	GetAllSchemaDashboards() ([]domain.SchemaDashboard, error)
	GetBlueprintSchemas() ([]domain.BlueprintSchema, error)
	GetBlueprintTables(criteria map[string]string) ([]domain.BlueprintTableSummary, error)
	UpdateTable(moduleName string, table domain.TableDetail) error
	GetFullSchema(name string) (*domain.FileSchema, error)
	SaveFullSchema(schema domain.FileSchema) error
	ExtractDatabaseSchema(name, desc string) (*domain.FileSchema, error)

	// Guidelines operations
	GetGuidelines() ([]domain.MDXItem, error)
	GetGuidelineSelection() (interface{}, error)
	UpdateGuidelineSelection(selection interface{}) error

	// Training operations
	GetTrainingItems() ([]domain.MDXItem, error)
	GetTrainingSelection() (interface{}, error)
	UpdateTrainingSelection(selection interface{}) error

	// Service tree operations (typically only filesystem-based)
	GetServiceTree() ([]domain.SchemaNode, error)

	GetPublishedAssets() ([]domain.PublishedAsset, error)
	GetTableAssets() ([]domain.PublishedAsset, error)
	GetRegistryTables(assetName string) ([]domain.RegistryTable, error)
	GetPublishedFile(assetName, fileName string) ([]byte, error)
	SavePublishedFile(assetName, fileName string, content []byte) error
	GetDatabaseStats() (domain.DatabaseStats, error)
	GetTableData(tableName string, limit, offset int) (domain.TableData, error)
	GetTableCount(tableName string) (int64, error)

	GetWorkflows() ([]domain.DesignFile, error)
	GetAstroTemplates() ([]domain.DesignFile, error)

	GetSites() ([]domain.SiteConfig, error)
	SaveSiteConfig(site domain.SiteConfig) error

	// File Archive operations
	GetFileArchives() ([]domain.FileArchive, error)
	SaveFileArchive(archive domain.FileArchive) error
	DeleteFileArchive(id int) error

	// Org Structure operations
	SaveOrgStructure(payload interface{}) error
	SaveTaxonomy(payload interface{}) error
	GetOrgStructure() (interface{}, error)

	// DFD Structure operations
	SaveDFDStructure(payload interface{}) error
	GetDFDStructure() (interface{}, error)

	// Business Glossary operations
	GetGlossaries() ([]domain.BusinessGlossary, error)
	GetGlossaryByID(id int64) (*domain.BusinessGlossary, error)
	GetGlossaryTerms(glossaryID int64) ([]domain.GlossaryTerm, error)
	GetGlossaryTermByID(assetID string) (*domain.GlossaryTerm, error)
	SaveBusinessGlossary(glossary *domain.BusinessGlossary, terms []domain.GlossaryTerm) error
	DeleteGlossary(id int64) error

	// BIM operations
	GetBIMModels() ([]domain.BusinessInformationModel, error)
	GetBIMModelByID(id int64) (*domain.BusinessInformationModel, error)
	GetBIMEntities(modelID int64) ([]domain.BIMEntity, error)
	SaveBIM(model *domain.BusinessInformationModel) error
	DeleteBIM(id int64) error

	GetUserRepo() UserRepository
	// Reference Data
	GetReferenceDataPackages() ([]domain.ReferenceDataPackage, error)
	GetReferenceDataPackage(id int64) (*domain.ReferenceDataPackage, error)
	GetReferenceDatasets() ([]domain.ReferenceDataset, error)
	SaveReferenceData(pkg *domain.ReferenceDataPackage) error
	DeleteReferenceData(id int64) error
}
