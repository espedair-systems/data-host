/*
 * Ports: Primary and Secondary interface definitions.
 * Defines the boundaries of the core application.
 */
package ports

import (
	"data-host/internal/core/domain"
)

type BlueprintSchema struct {
	ID        int64  `json:"id"`
	Name      string `json:"name"`
	Desc      string `json:"desc"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

type DBARepository interface {
	LoadSchema(schema domain.FileSchema) error
	GetSchemas() ([]BlueprintSchema, error)
}
