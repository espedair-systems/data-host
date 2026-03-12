package testing

import (
	"data-host/internal/adapters/driving/auth"
	"data-host/internal/core/domain"
	"database/sql"
	"testing"

	_ "modernc.org/sqlite"
)

// SetupTestDB creates an in-memory SQLite database for testing and runs migrations
func SetupTestDB(t *testing.T) *sql.DB {
	db, err := sql.Open("sqlite", ":memory:")
	if err != nil {
		t.Fatalf("failed to open test db: %v", err)
	}

	// Create tables manually for testing or call RunMigrations
	// Since we already have migrations in internal/database, maybe we can use them
	// but for speed in unit tests, we'll just create what's needed.

	schema := `
	CREATE TABLE users (
		id TEXT PRIMARY KEY,
		username TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		email TEXT,
		role TEXT DEFAULT 'viewer',
		active BOOLEAN DEFAULT true,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE site_config (
		key TEXT PRIMARY KEY,
		content TEXT NOT NULL,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE table_details (
		module TEXT NOT NULL,
		name TEXT NOT NULL,
		type TEXT,
		description TEXT,
		columns TEXT,
		PRIMARY KEY (module, name)
	);
	`

	if _, err := db.Exec(schema); err != nil {
		t.Fatalf("failed to setup schema: %v", err)
	}

	t.Cleanup(func() {
		db.Close()
	})

	return db
}

// CreateTestTokenProvider creates a token provider for testing
func CreateTestTokenProvider() auth.AuthProvider {
	return auth.NewJWTProvider(domain.HostConfig{
		JWTSecret: "test-secret-key-at-least-32-characters-long",
	})
}
