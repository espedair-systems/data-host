-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS org_units (
    id TEXT PRIMARY KEY,
    type TEXT DEFAULT 'org_unit' CHECK (type = 'org_unit'),
    name TEXT NOT NULL,
    unit_type TEXT CHECK (unit_type IN ('company', 'division', 'department', 'team')),
    description TEXT
);

CREATE TABLE IF NOT EXISTS org_positions (
    id TEXT PRIMARY KEY,
    type TEXT DEFAULT 'position' CHECK (type = 'position'),
    title TEXT NOT NULL,
    level TEXT,
    vacancy_status TEXT CHECK (vacancy_status IN ('filled', 'vacant')),
    cost_center TEXT
);

CREATE TABLE IF NOT EXISTS org_people (
    id TEXT PRIMARY KEY,
    type TEXT DEFAULT 'person' CHECK (type = 'person'),
    display_name TEXT NOT NULL,
    given_name TEXT,
    family_name TEXT,
    email TEXT,
    employee_id TEXT,
    employment_type TEXT,
    job_title TEXT,
    location TEXT,
    timezone TEXT,
    start_date TEXT
);

CREATE TABLE IF NOT EXISTS org_notes (
    id TEXT PRIMARY KEY,
    type TEXT DEFAULT 'note' CHECK (type = 'note'),
    text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS org_edges (
    id TEXT PRIMARY KEY,
    type TEXT,
    source TEXT NOT NULL,
    target TEXT NOT NULL,
    label TEXT,
    notes TEXT
);

-- Indices for performance on graph lookups
CREATE INDEX idx_org_edges_source ON org_edges(source);
CREATE INDEX idx_org_edges_target ON org_edges(target);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_org_edges_target;
DROP INDEX IF EXISTS idx_org_edges_source;
DROP TABLE IF EXISTS org_edges;
DROP TABLE IF EXISTS org_notes;
DROP TABLE IF EXISTS org_people;
DROP TABLE IF EXISTS org_positions;
DROP TABLE IF EXISTS org_units;
-- +goose StatementEnd
