/*
 * Driven Adapter: Infrastructure / Implementation.
 * Implements outbound ports for external systems like databases or filesystems.
 */
package repository

import (
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"database/sql"
)

type sqliteUserRepository struct {
	db *sql.DB
}

func NewSQLiteUserRepository(db *sql.DB) ports.UserRepository {
	return &sqliteUserRepository{db: db}
}

func (r *sqliteUserRepository) GetByUsername(username string) (*domain.User, error) {
	query := `SELECT id, username, password_hash, email, role, active, created_at, updated_at FROM admin_users WHERE username = ?`
	row := r.db.QueryRow(query, username)

	user := &domain.User{}
	err := row.Scan(&user.ID, &user.Username, &user.PasswordHash, &user.Email, &user.Role, &user.Active, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *sqliteUserRepository) GetByID(id string) (*domain.User, error) {
	query := `SELECT id, username, password_hash, email, role, active, created_at, updated_at FROM admin_users WHERE id = ?`
	row := r.db.QueryRow(query, id)

	user := &domain.User{}
	err := row.Scan(&user.ID, &user.Username, &user.PasswordHash, &user.Email, &user.Role, &user.Active, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *sqliteUserRepository) Create(user *domain.User) (*domain.User, error) {
	query := `INSERT INTO admin_users (id, username, password_hash, email, role, active) VALUES (?, ?, ?, ?, ?, ?)`
	_, err := r.db.Exec(query, user.ID, user.Username, user.PasswordHash, user.Email, user.Role, user.Active)
	if err != nil {
		return nil, err
	}
	return r.GetByID(user.ID)
}

func (r *sqliteUserRepository) Update(user *domain.User) error {
	query := `UPDATE admin_users SET username = ?, password_hash = ?, email = ?, role = ?, active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
	_, err := r.db.Exec(query, user.Username, user.PasswordHash, user.Email, user.Role, user.Active, user.ID)
	return err
}

func (r *sqliteUserRepository) Delete(id string) error {
	query := `DELETE FROM admin_users WHERE id = ?`
	_, err := r.db.Exec(query, id)
	return err
}
