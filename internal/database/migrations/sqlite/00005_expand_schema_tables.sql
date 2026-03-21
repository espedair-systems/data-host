-- +goose Up
-- +goose StatementBegin
ALTER TABLE db_viewpoints ADD COLUMN labels TEXT;
ALTER TABLE db_viewpoints ADD COLUMN groups TEXT;
ALTER TABLE db_tables ADD COLUMN labels TEXT;
ALTER TABLE db_tables ADD COLUMN referenced_tables TEXT;
ALTER TABLE db_columns ADD COLUMN labels TEXT;
ALTER TABLE db_columns ADD COLUMN tags TEXT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- SQLite doesn't support dropping columns easily, but for documentation purposes:
-- ALTER TABLE db_viewpoints DROP COLUMN labels;
-- ALTER TABLE db_viewpoints DROP COLUMN groups;
-- ALTER TABLE db_tables DROP COLUMN labels;
-- ALTER TABLE db_tables DROP COLUMN referenced_tables;
-- ALTER TABLE db_columns DROP COLUMN labels;
-- ALTER TABLE db_columns DROP COLUMN tags;
-- +goose StatementEnd
