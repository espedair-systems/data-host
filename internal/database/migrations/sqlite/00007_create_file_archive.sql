-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS mnt_file_archive (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT,
    description TEXT,
    hash TEXT,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS mnt_file_archive;
-- +goose StatementEnd
