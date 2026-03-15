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
	UpdateTable(moduleName string, table domain.TableDetail) error
	GetFullSchema(name string) (*domain.FileSchema, error)
	SaveFullSchema(schema domain.FileSchema) error

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
	GetPublishedFile(assetName, fileName string) ([]byte, error)
	SavePublishedFile(assetName, fileName string, content []byte) error
	GetDatabaseStats() (domain.DatabaseStats, error)

	GetUserRepo() UserRepository
}
