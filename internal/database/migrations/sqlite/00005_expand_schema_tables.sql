-- +goose Up
-- +goose StatementBegin
ALTER TABLE viewpoints ADD COLUMN labels TEXT;
ALTER TABLE viewpoints ADD COLUMN groups TEXT;
ALTER TABLE tables ADD COLUMN labels TEXT;
ALTER TABLE tables ADD COLUMN referenced_tables TEXT;
ALTER TABLE columns ADD COLUMN labels TEXT;
ALTER TABLE columns ADD COLUMN tags TEXT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- SQLite doesn't support dropping columns easily, but for documentation purposes:
-- ALTER TABLE viewpoints DROP COLUMN labels;
-- ALTER TABLE viewpoints DROP COLUMN groups;
-- ALTER TABLE tables DROP COLUMN labels;
-- ALTER TABLE tables DROP COLUMN referenced_tables;
-- ALTER TABLE columns DROP COLUMN labels;
-- ALTER TABLE columns DROP COLUMN tags;
-- +goose StatementEnd
