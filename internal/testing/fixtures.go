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

	CREATE TABLE BIG_GLOSSARY (
		glossary_id INTEGER PRIMARY KEY AUTOINCREMENT,
		glossary_name TEXT NOT NULL,
		description TEXT,
		source_file TEXT,
		generated_at_utc TEXT,
		original_rows INTEGER DEFAULT 0,
		unique_terms INTEGER DEFAULT 0,
		duplicates_removed INTEGER DEFAULT 0,
		created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
	);

	CREATE TABLE BIG_TERM (
		term_row_id INTEGER PRIMARY KEY AUTOINCREMENT,
		glossary_id INTEGER NOT NULL REFERENCES BIG_GLOSSARY(glossary_id),
		asset_id TEXT NOT NULL,
		full_name TEXT NOT NULL,
		term_name TEXT NOT NULL,
		definition TEXT,
		status TEXT,
		domain TEXT,
		community TEXT,
		domain_type TEXT,
		domain_id TEXT,
		asset_type TEXT,
		source_sheet TEXT,
		created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
	);

	CREATE TABLE BIG_TERM_RELATED_DATA_DOMAIN (
		relation_id INTEGER PRIMARY KEY AUTOINCREMENT,
		term_row_id INTEGER NOT NULL REFERENCES BIG_TERM(term_row_id),
		relates_to_name TEXT,
		relates_to_full_name TEXT,
		relates_to_asset_type TEXT,
		relates_to_community TEXT,
		relates_to_domain_type TEXT,
		relates_to_domain TEXT,
		relates_to_domain_id TEXT,
		relates_to_asset_id TEXT,
		created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
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
