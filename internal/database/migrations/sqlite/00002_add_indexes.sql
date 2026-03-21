-- +goose Up
-- +goose StatementBegin
CREATE INDEX IF NOT EXISTS idx_tables_schema_id ON db_tables(schema_id);
CREATE INDEX IF NOT EXISTS idx_columns_table_id ON db_columns(table_id);
CREATE INDEX IF NOT EXISTS idx_indexes_table_id ON db_indexes(table_id);
CREATE INDEX IF NOT EXISTS idx_constraints_table_id ON db_constraints(table_id);
CREATE INDEX IF NOT EXISTS idx_triggers_table_id ON db_triggers(table_id);
CREATE INDEX IF NOT EXISTS idx_relations_schema_id ON db_relations(schema_id);
CREATE INDEX IF NOT EXISTS idx_collections_schema_id ON db_collections(schema_id);
CREATE INDEX IF NOT EXISTS idx_viewpoints_schema_id ON db_viewpoints(schema_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_viewpoints_schema_id;
DROP INDEX IF EXISTS idx_collections_schema_id;
DROP INDEX IF EXISTS idx_relations_schema_id;
DROP INDEX IF EXISTS idx_triggers_table_id;
DROP INDEX IF EXISTS idx_constraints_table_id;
DROP INDEX IF EXISTS idx_indexes_table_id;
DROP INDEX IF EXISTS idx_columns_table_id;
DROP INDEX IF EXISTS idx_tables_schema_id;
-- +goose StatementEnd
