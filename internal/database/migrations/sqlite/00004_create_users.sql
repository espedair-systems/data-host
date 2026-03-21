-- +goose Up
-- SQL in this section is executed when the migration is applied.
CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'viewer' CHECK(role IN ('admin', 'editor', 'viewer')),
    active BOOLEAN DEFAULT true,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_active ON admin_users(active);

-- Insert default admin user
-- Password: admin123 (bcrypt hash)
-- WARNING: Change this immediately after first login!
INSERT INTO admin_users (id, username, password_hash, role) VALUES (
    'user-admin-001',
    'admin',
    '$2a$10$U5bmdiSCAhLKY0W5QUw5QeObZIrFXLf6Sy7CdZJBOo8bA5eAyKuDm',
    'admin'
);

-- +goose Down
-- SQL in this section is executed when the migration is rolled back.
DROP TABLE IF EXISTS admin_users;
