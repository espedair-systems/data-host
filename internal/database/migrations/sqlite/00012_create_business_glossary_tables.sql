-- +goose Up
-- +goose StatementBegin
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS BIG_GLOSSARY (
    glossary_id INTEGER PRIMARY KEY AUTOINCREMENT,
    glossary_name TEXT NOT NULL,
    description TEXT,
    source_file TEXT,
    generated_at_utc TEXT,
    original_rows INTEGER,
    unique_terms INTEGER,
    duplicates_removed INTEGER,
    created_at_utc DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc DATETIME,
    CONSTRAINT uq_big_glossary_name UNIQUE (glossary_name)
);

CREATE TABLE IF NOT EXISTS BIG_TERM (
    term_row_id INTEGER PRIMARY KEY AUTOINCREMENT,
    glossary_id INTEGER NOT NULL,
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
    created_at_utc DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc DATETIME,
    CONSTRAINT fk_big_term_glossary
        FOREIGN KEY (glossary_id)
        REFERENCES BIG_GLOSSARY (glossary_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_big_term_glossary_asset UNIQUE (glossary_id, asset_id)
);

CREATE TABLE IF NOT EXISTS BIG_TERM_RELATED_DATA_DOMAIN (
    relation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    term_row_id INTEGER NOT NULL,
    relates_to_name TEXT,
    relates_to_full_name TEXT,
    relates_to_asset_type TEXT,
    relates_to_community TEXT,
    relates_to_domain_type TEXT,
    relates_to_domain TEXT,
    relates_to_domain_id TEXT,
    relates_to_asset_id TEXT,
    created_at_utc DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT fk_big_term_related_domain_term
        FOREIGN KEY (term_row_id)
        REFERENCES BIG_TERM (term_row_id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_big_term_glossary_id
    ON BIG_TERM (glossary_id);

CREATE INDEX IF NOT EXISTS idx_big_term_asset_id
    ON BIG_TERM (asset_id);

CREATE INDEX IF NOT EXISTS idx_big_term_name
    ON BIG_TERM (term_name);

CREATE INDEX IF NOT EXISTS idx_big_term_status
    ON BIG_TERM (status);

CREATE INDEX IF NOT EXISTS idx_big_related_term_row_id
    ON BIG_TERM_RELATED_DATA_DOMAIN (term_row_id);

CREATE INDEX IF NOT EXISTS idx_big_related_asset_id
    ON BIG_TERM_RELATED_DATA_DOMAIN (relates_to_asset_id);

CREATE INDEX IF NOT EXISTS idx_big_related_domain_id
    ON BIG_TERM_RELATED_DATA_DOMAIN (relates_to_domain_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_big_related_domain_id;
DROP INDEX IF EXISTS idx_big_related_asset_id;
DROP INDEX IF EXISTS idx_big_related_term_row_id;
DROP INDEX IF EXISTS idx_big_term_status;
DROP INDEX IF EXISTS idx_big_term_name;
DROP INDEX IF EXISTS idx_big_term_asset_id;
DROP INDEX IF EXISTS idx_big_term_glossary_id;

DROP TABLE IF EXISTS BIG_TERM_RELATED_DATA_DOMAIN;
DROP TABLE IF EXISTS BIG_TERM;
DROP TABLE IF EXISTS BIG_GLOSSARY;
-- +goose StatementEnd
