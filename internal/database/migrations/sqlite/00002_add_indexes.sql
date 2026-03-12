-- +goose Up
-- +goose StatementBegin
CREATE INDEX IF NOT EXISTS idx_tables_schema_id ON tables(schema_id);
CREATE INDEX IF NOT EXISTS idx_columns_table_id ON columns(table_id);
CREATE INDEX IF NOT EXISTS idx_indexes_table_id ON indexes(table_id);
CREATE INDEX IF NOT EXISTS idx_constraints_table_id ON constraints(table_id);
CREATE INDEX IF NOT EXISTS idx_triggers_table_id ON triggers(table_id);
CREATE INDEX IF NOT EXISTS idx_relations_schema_id ON relations(schema_id);
CREATE INDEX IF NOT EXISTS idx_collections_schema_id ON collections(schema_id);
CREATE INDEX IF NOT EXISTS idx_viewpoints_schema_id ON viewpoints(schema_id);
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
