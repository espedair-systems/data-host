-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schema_id INTEGER NOT NULL REFERENCES schemas(id) ON DELETE CASCADE,
    collection_id TEXT NOT NULL, -- The "id" from the JSON (e.g. "user-management")
    title TEXT NOT NULL,
    emoji TEXT,
    description TEXT,
    UNIQUE(schema_id, collection_id)
);

CREATE TABLE IF NOT EXISTS collection_tables (
    collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    table_id INTEGER NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    PRIMARY KEY (collection_id, table_id)
);

CREATE TABLE IF NOT EXISTS collection_tags (
    collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    PRIMARY KEY (collection_id, tag)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS collection_tags;
DROP TABLE IF EXISTS collection_tables;
DROP TABLE IF EXISTS collections;
-- +goose StatementEnd
