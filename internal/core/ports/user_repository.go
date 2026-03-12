package ports

import (
	"data-host/internal/core/domain"
)

type UserRepository interface {
	GetByUsername(username string) (*domain.User, error)
	GetByID(id string) (*domain.User, error)
	Create(user *domain.User) (*domain.User, error)
	Update(user *domain.User) error
	Delete(id string) error
}
