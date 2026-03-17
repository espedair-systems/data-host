-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS sites (
    name TEXT PRIMARY KEY,
    type TEXT,
    description TEXT,
    data_path TEXT NOT NULL,
    mount_path TEXT,
    mount_source TEXT,
    mount_dist TEXT,
    active BOOLEAN DEFAULT FALSE,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS sites;
-- +goose StatementEnd
