-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS dfd_processes (
    id TEXT PRIMARY KEY,
    type TEXT DEFAULT 'process' CHECK (type = 'process'),
    name TEXT NOT NULL,
    process_type TEXT,
    description TEXT,
    parent TEXT
);

CREATE TABLE IF NOT EXISTS dfd_external_entities (
    id TEXT PRIMARY KEY,
    type TEXT DEFAULT 'external_entity' CHECK (type = 'external_entity'),
    name TEXT NOT NULL,
    description TEXT,
    parent TEXT
);

CREATE TABLE IF NOT EXISTS dfd_data_stores (
    id TEXT PRIMARY KEY,
    type TEXT DEFAULT 'data_store' CHECK (type = 'data_store'),
    name TEXT NOT NULL,
    description TEXT,
    parent TEXT
);

CREATE TABLE IF NOT EXISTS dfd_boundaries (
    id TEXT PRIMARY KEY,
    type TEXT DEFAULT 'boundary' CHECK (type = 'boundary'),
    name TEXT NOT NULL,
    boundary_type TEXT,
    parent TEXT
);

CREATE TABLE IF NOT EXISTS dfd_edges (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    source TEXT NOT NULL,
    target TEXT NOT NULL,
    label TEXT,
    data_elements TEXT, -- Stored as JSON string
    classification TEXT,
    protocol TEXT,
    frequency TEXT
);

-- Indices for performance on graph lookups
CREATE INDEX idx_dfd_edges_source ON dfd_edges(source);
CREATE INDEX idx_dfd_edges_target ON dfd_edges(target);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_dfd_edges_target;
DROP INDEX IF EXISTS idx_dfd_edges_source;
DROP TABLE IF EXISTS dfd_edges;
DROP TABLE IF EXISTS dfd_boundaries;
DROP TABLE IF EXISTS dfd_data_stores;
DROP TABLE IF EXISTS dfd_external_entities;
DROP TABLE IF EXISTS dfd_processes;
-- +goose StatementEnd
