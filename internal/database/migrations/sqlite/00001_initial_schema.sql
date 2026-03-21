-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS db_schemas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    desc TEXT,
    driver_name TEXT,
    driver_database_version TEXT,
    driver_meta_current_schema TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS db_tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schema_id INTEGER NOT NULL REFERENCES db_schemas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    comment TEXT,
    def TEXT,
    UNIQUE(schema_id, name)
);

CREATE TABLE IF NOT EXISTS db_columns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER NOT NULL REFERENCES db_tables(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    nullable BOOLEAN NOT NULL,
    default_value TEXT,
    extra_def TEXT,
    comment TEXT,
    UNIQUE(table_id, name)
);

CREATE TABLE IF NOT EXISTS db_indexes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER NOT NULL REFERENCES db_tables(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    def TEXT NOT NULL,
    comment TEXT,
    UNIQUE(table_id, name)
);

CREATE TABLE IF NOT EXISTS db_index_columns (
    index_id INTEGER NOT NULL REFERENCES db_indexes(id) ON DELETE CASCADE,
    column_name TEXT NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (index_id, column_name)
);

CREATE TABLE IF NOT EXISTS db_constraints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER NOT NULL REFERENCES db_tables(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    def TEXT NOT NULL,
    referenced_table TEXT,
    comment TEXT,
    UNIQUE(table_id, name)
);

CREATE TABLE IF NOT EXISTS db_constraint_columns (
    constraint_id INTEGER NOT NULL REFERENCES db_constraints(id) ON DELETE CASCADE,
    column_name TEXT NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (constraint_id, column_name)
);

CREATE TABLE IF NOT EXISTS db_constraint_referenced_columns (
    constraint_id INTEGER NOT NULL REFERENCES db_constraints(id) ON DELETE CASCADE,
    column_name TEXT NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (constraint_id, column_name)
);

CREATE TABLE IF NOT EXISTS db_triggers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id INTEGER NOT NULL REFERENCES db_tables(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    def TEXT NOT NULL,
    comment TEXT,
    UNIQUE(table_id, name)
);

CREATE TABLE IF NOT EXISTS db_relations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schema_id INTEGER NOT NULL REFERENCES db_schemas(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    parent_table_name TEXT NOT NULL,
    cardinality TEXT,
    parent_cardinality TEXT,
    def TEXT NOT NULL,
    virtual BOOLEAN DEFAULT FALSE,
    type TEXT, -- Custom extension: physical, logical, inferred
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS db_relation_columns (
    relation_id INTEGER NOT NULL REFERENCES db_relations(id) ON DELETE CASCADE,
    column_name TEXT NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (relation_id, column_name)
);

CREATE TABLE IF NOT EXISTS db_relation_parent_columns (
    relation_id INTEGER NOT NULL REFERENCES db_relations(id) ON DELETE CASCADE,
    column_name TEXT NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (relation_id, column_name)
);

CREATE TABLE IF NOT EXISTS db_functions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schema_id INTEGER NOT NULL REFERENCES db_schemas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    return_type TEXT NOT NULL,
    arguments TEXT NOT NULL,
    type TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS db_enums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schema_id INTEGER NOT NULL REFERENCES db_schemas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    UNIQUE(schema_id, name)
);

CREATE TABLE IF NOT EXISTS db_enum_values (
    enum_id INTEGER NOT NULL REFERENCES db_enums(id) ON DELETE CASCADE,
    value TEXT NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (enum_id, value)
);

CREATE TABLE IF NOT EXISTS db_labels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    virtual BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS db_entity_labels (
    label_id INTEGER NOT NULL REFERENCES db_labels(id) ON DELETE CASCADE,
    entity_id INTEGER NOT NULL,
    entity_type TEXT NOT NULL, -- 'schema', 'table', 'column', 'index', 'constraint', 'trigger', 'viewpoint'
    PRIMARY KEY (label_id, entity_id, entity_type)
);

CREATE TABLE IF NOT EXISTS db_viewpoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schema_id INTEGER NOT NULL REFERENCES db_schemas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    desc TEXT,
    distance INTEGER,
    UNIQUE(schema_id, name)
);

CREATE TABLE IF NOT EXISTS db_viewpoint_tables (
    viewpoint_id INTEGER NOT NULL REFERENCES db_viewpoints(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    PRIMARY KEY (viewpoint_id, table_name)
);

CREATE TABLE IF NOT EXISTS db_collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schema_id INTEGER NOT NULL REFERENCES db_schemas(id) ON DELETE CASCADE,
    collection_id TEXT NOT NULL, -- The "id" from the JSON (e.g. "user-management")
    title TEXT NOT NULL,
    emoji TEXT,
    description TEXT,
    UNIQUE(schema_id, collection_id)
);

CREATE TABLE IF NOT EXISTS db_collection_tables (
    collection_id INTEGER NOT NULL REFERENCES db_collections(id) ON DELETE CASCADE,
    table_id INTEGER NOT NULL REFERENCES db_tables(id) ON DELETE CASCADE,
    PRIMARY KEY (collection_id, table_id)
);

CREATE TABLE IF NOT EXISTS db_collection_tags (
    collection_id INTEGER NOT NULL REFERENCES db_collections(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    PRIMARY KEY (collection_id, tag)
);

CREATE TABLE IF NOT EXISTS db_site_config (
    key TEXT PRIMARY KEY,
    content TEXT
);

CREATE TABLE IF NOT EXISTS db_table_details (
    module TEXT,
    name TEXT,
    type TEXT,
    description TEXT,
    columns TEXT,
    PRIMARY KEY (module, name)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS db_table_details;
DROP TABLE IF EXISTS db_site_config;
DROP TABLE IF EXISTS db_collection_tags;
DROP TABLE IF EXISTS db_collection_tables;
DROP TABLE IF EXISTS db_collections;
DROP TABLE IF EXISTS db_viewpoint_tables;
DROP TABLE IF EXISTS db_viewpoints;
DROP TABLE IF EXISTS db_entity_labels;
DROP TABLE IF EXISTS db_labels;
DROP TABLE IF EXISTS db_enum_values;
DROP TABLE IF EXISTS db_enums;
DROP TABLE IF EXISTS db_functions;
DROP TABLE IF EXISTS db_relation_parent_columns;
DROP TABLE IF EXISTS db_relation_columns;
DROP TABLE IF EXISTS db_relations;
DROP TABLE IF EXISTS db_triggers;
DROP TABLE IF EXISTS db_constraint_referenced_columns;
DROP TABLE IF EXISTS db_constraint_columns;
DROP TABLE IF EXISTS db_constraints;
DROP TABLE IF EXISTS db_index_columns;
DROP TABLE IF EXISTS db_indexes;
DROP TABLE IF EXISTS db_columns;
DROP TABLE IF EXISTS db_tables;
DROP TABLE IF EXISTS db_schemas;
-- +goose StatementEnd
