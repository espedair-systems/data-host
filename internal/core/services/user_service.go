/*
 * Application Layer: Business Use Cases.
 * Coordinates domain objects to perform specific application tasks.
 */
package services

import (
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"errors"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	userRepository ports.UserRepository
}

func NewUserService(ur ports.UserRepository) *UserService {
	return &UserService{userRepository: ur}
}

func (us *UserService) Authenticate(username, password string) (*domain.User, error) {
	user, err := us.userRepository.GetByUsername(username)
	if err != nil {
		log.Debug().Err(err).Str("username", username).Msg("User not found or query error")
		return nil, errors.New("invalid credentials")
	}

	if !user.Active {
		return nil, errors.New("user account is inactive")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		log.Debug().Str("username", username).Msg("Invalid password")
		return nil, errors.New("invalid credentials")
	}

	return user, nil
}

func (us *UserService) CreateUser(username, password, email, role string) (*domain.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &domain.User{
		ID:           uuid.New().String(),
		Username:     username,
		PasswordHash: string(hashedPassword),
		Email:        email,
		Role:         role,
		Active:       true,
	}

	return us.userRepository.Create(user)
}
