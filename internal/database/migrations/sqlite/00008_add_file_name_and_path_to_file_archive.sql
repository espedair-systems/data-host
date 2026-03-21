-- +goose Up
-- +goose StatementBegin
ALTER TABLE mnt_file_archive ADD COLUMN file_name TEXT;
ALTER TABLE mnt_file_archive ADD COLUMN file_path TEXT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- SQLite (older versions) doesn't support DROP COLUMN. 
-- For now, we'll just acknowledge we can't easily undo this in a simple script for older SQLite.
-- +goose StatementEnd
