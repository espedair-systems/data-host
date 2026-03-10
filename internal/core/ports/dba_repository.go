package ports

import (
	"data-host/internal/core/domain"
)

type DBARepository interface {
	LoadSchema(schema domain.FileSchema) error
}
