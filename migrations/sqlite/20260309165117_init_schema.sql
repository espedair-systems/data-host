-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS schemas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    desc TEXT,
    driver_name TEXT,
    driver_database_version TEXT,
    driver_meta_current_schema TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schema_id INTEGER NOT NULL REFERENCES schemas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    comment TEXT,
    def TEXT,
    UNIQUE(schema_id, name)
);

CREATE TABLE IF NOT EXISTS columns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    nullable BOOLEAN NOT NULL,
    default_value TEXT,
    extra_def TEXT,
    comment TEXT,
    UNIQUE(table_id, name)
);

CREATE TABLE IF NOT EXISTS indexes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    def TEXT NOT NULL,
    comment TEXT,
    UNIQUE(table_id, name)
);

CREATE TABLE IF NOT EXISTS index_columns (
    index_id INTEGER NOT NULL REFERENCES indexes(id) ON DELETE CASCADE,
    column_name TEXT NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (index_id, column_name)
);

CREATE TABLE IF NOT EXISTS constraints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    def TEXT NOT NULL,
    referenced_table TEXT,
    comment TEXT,
    UNIQUE(table_id, name)
);

CREATE TABLE IF NOT EXISTS constraint_columns (
    constraint_id INTEGER NOT NULL REFERENCES constraints(id) ON DELETE CASCADE,
    column_name TEXT NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (constraint_id, column_name)
);

CREATE TABLE IF NOT EXISTS constraint_referenced_columns (
    constraint_id INTEGER NOT NULL REFERENCES constraints(id) ON DELETE CASCADE,
    column_name TEXT NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (constraint_id, column_name)
);

CREATE TABLE IF NOT EXISTS triggers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    def TEXT NOT NULL,
    comment TEXT,
    UNIQUE(table_id, name)
);

CREATE TABLE IF NOT EXISTS relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schema_id INTEGER NOT NULL REFERENCES schemas(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    parent_table_name TEXT NOT NULL,
    cardinality TEXT,
    parent_cardinality TEXT,
    def TEXT NOT NULL,
    virtual BOOLEAN DEFAULT FALSE,
    type TEXT, -- Custom extension: physical, logical, inferred
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS relation_columns (
    relation_id INTEGER NOT NULL REFERENCES relations(id) ON DELETE CASCADE,
    column_name TEXT NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (relation_id, column_name)
);

CREATE TABLE IF NOT EXISTS relation_parent_columns (
    relation_id INTEGER NOT NULL REFERENCES relations(id) ON DELETE CASCADE,
    column_name TEXT NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (relation_id, column_name)
);

CREATE TABLE IF NOT EXISTS functions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schema_id INTEGER NOT NULL REFERENCES schemas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    return_type TEXT NOT NULL,
    arguments TEXT NOT NULL,
    type TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS enums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schema_id INTEGER NOT NULL REFERENCES schemas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    UNIQUE(schema_id, name)
);

CREATE TABLE IF NOT EXISTS enum_values (
    enum_id INTEGER NOT NULL REFERENCES enums(id) ON DELETE CASCADE,
    value TEXT NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (enum_id, value)
);

CREATE TABLE IF NOT EXISTS labels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    virtual BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS entity_labels (
    label_id INTEGER NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
    entity_id INTEGER NOT NULL,
    entity_type TEXT NOT NULL, -- 'schema', 'table', 'column', 'index', 'constraint', 'trigger', 'viewpoint'
    PRIMARY KEY (label_id, entity_id, entity_type)
);

CREATE TABLE IF NOT EXISTS viewpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schema_id INTEGER NOT NULL REFERENCES schemas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    desc TEXT,
    distance INTEGER,
    UNIQUE(schema_id, name)
);

CREATE TABLE IF NOT EXISTS viewpoint_tables (
    viewpoint_id INTEGER NOT NULL REFERENCES viewpoints(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    PRIMARY KEY (viewpoint_id, table_name)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS viewpoint_tables;
DROP TABLE IF EXISTS viewpoints;
DROP TABLE IF EXISTS entity_labels;
DROP TABLE IF EXISTS labels;
DROP TABLE IF EXISTS enum_values;
DROP TABLE IF EXISTS enums;
DROP TABLE IF EXISTS functions;
DROP TABLE IF EXISTS relation_parent_columns;
DROP TABLE IF EXISTS relation_columns;
DROP TABLE IF EXISTS relations;
DROP TABLE IF EXISTS triggers;
DROP TABLE IF EXISTS constraint_referenced_columns;
DROP TABLE IF EXISTS constraint_columns;
DROP TABLE IF EXISTS constraints;
DROP TABLE IF EXISTS index_columns;
DROP TABLE IF EXISTS indexes;
DROP TABLE IF EXISTS columns;
DROP TABLE IF EXISTS tables;
DROP TABLE IF EXISTS schemas;
-- +goose StatementEnd
