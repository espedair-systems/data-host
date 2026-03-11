package repository

import (
	"context"
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"database/sql"
	"fmt"
)

type SQLiteDBARepository struct {
	db *sql.DB
}

func NewSQLiteDBARepository(db *sql.DB) ports.DBARepository {
	return &SQLiteDBARepository{db: db}
}

func (r *SQLiteDBARepository) LoadSchema(fs domain.FileSchema) error {
	ctx := context.Background()
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Insert Schema
	var schemaID int64
	err = tx.QueryRowContext(ctx, "INSERT INTO schemas (name, desc, created_at, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id",
		fs.Name, fs.Desc).Scan(&schemaID)
	if err != nil {
		// Try without RETURNING if sqlite version is old
		res, err2 := tx.ExecContext(ctx, "INSERT INTO schemas (name, desc) VALUES (?, ?)", fs.Name, fs.Desc)
		if err2 != nil {
			return err2
		}
		schemaID, _ = res.LastInsertId()
	}

	// Maps to track IDs for bulk/reference lookups
	tableIDs := make(map[string]int64)

	// 2. Insert Tables
	for _, t := range fs.Tables {
		res, err := tx.ExecContext(ctx, "INSERT INTO tables (schema_id, name, type, comment, def) VALUES (?, ?, ?, ?, ?)",
			schemaID, t.Name, t.Type, t.Comment, t.Def)
		if err != nil {
			return fmt.Errorf("error inserting table %s: %w", t.Name, err)
		}
		tableID, _ := res.LastInsertId()
		tableIDs[t.Name] = tableID

		// Insert Columns
		for _, c := range t.Columns {
			_, err := tx.ExecContext(ctx, "INSERT INTO columns (table_id, name, type, nullable, default_value, comment) VALUES (?, ?, ?, ?, ?, ?)",
				tableID, c.Name, c.Type, c.Nullable, c.Default, c.Comment)
			if err != nil {
				return fmt.Errorf("error inserting column %s in table %s: %w", c.Name, t.Name, err)
			}
		}

		// Insert Indexes
		for _, idx := range t.Indexes {
			res, err := tx.ExecContext(ctx, "INSERT INTO indexes (table_id, name, def, comment) VALUES (?, ?, ?, ?)",
				tableID, idx.Name, idx.Def, idx.Comment)
			if err != nil {
				return fmt.Errorf("error inserting index %s on table %s: %w", idx.Name, t.Name, err)
			}
			indexID, _ := res.LastInsertId()
			for pos, colName := range idx.Columns {
				_, err := tx.ExecContext(ctx, "INSERT INTO index_columns (index_id, column_name, position) VALUES (?, ?, ?)",
					indexID, colName, pos+1)
				if err != nil {
					return fmt.Errorf("error inserting index column %s for index %s: %w", colName, idx.Name, err)
				}
			}
		}

		// Insert Constraints
		for _, con := range t.Constraints {
			res, err := tx.ExecContext(ctx, "INSERT INTO constraints (table_id, name, type, def, referenced_table, comment) VALUES (?, ?, ?, ?, ?, ?)",
				tableID, con.Name, con.Type, con.Def, con.ReferencedTable, con.Comment)
			if err != nil {
				return fmt.Errorf("error inserting constraint %s on table %s: %w", con.Name, t.Name, err)
			}
			constraintID, _ := res.LastInsertId()

			for pos, colName := range con.Columns {
				_, err := tx.ExecContext(ctx, "INSERT INTO constraint_columns (constraint_id, column_name, position) VALUES (?, ?, ?)",
					constraintID, colName, pos+1)
				if err != nil {
					return fmt.Errorf("error inserting constraint column %s for constraint %s: %w", colName, con.Name, err)
				}
			}

			if con.ReferencedTable != "" {
				for pos, colName := range con.ReferencedColumns {
					_, err := tx.ExecContext(ctx, "INSERT INTO constraint_referenced_columns (constraint_id, column_name, position) VALUES (?, ?, ?)",
						constraintID, colName, pos+1)
					if err != nil {
						return fmt.Errorf("error inserting constraint ref column %s for constraint %s: %w", colName, con.Name, err)
					}
				}
			}
		}
	}

	// 3. Insert Relations
	for _, rel := range fs.Relations {
		res, err := tx.ExecContext(ctx, "INSERT INTO relations (schema_id, table_name, parent_table_name, cardinality, parent_cardinality, def, virtual) VALUES (?, ?, ?, ?, ?, ?, ?)",
			schemaID, rel.Table, rel.ParentTable, rel.Cardinality, rel.ParentCardinality, rel.Def, rel.Virtual)
		if err != nil {
			return fmt.Errorf("error inserting relation between %s and %s: %w", rel.Table, rel.ParentTable, err)
		}
		relationID, _ := res.LastInsertId()

		for pos, colName := range rel.Columns {
			_, err := tx.ExecContext(ctx, "INSERT INTO relation_columns (relation_id, column_name, position) VALUES (?, ?, ?)",
				relationID, colName, pos+1)
			if err != nil {
				return fmt.Errorf("error inserting relation column %s for relation %d: %w", colName, relationID, err)
			}
		}

		for pos, colName := range rel.ParentColumns {
			_, err := tx.ExecContext(ctx, "INSERT INTO relation_parent_columns (relation_id, column_name, position) VALUES (?, ?, ?)",
				relationID, colName, pos+1)
			if err != nil {
				return fmt.Errorf("error inserting relation parent column %s for relation %d: %w", colName, relationID, err)
			}
		}
	}

	return tx.Commit()
}

func (r *SQLiteDBARepository) GetSchemas() ([]ports.BlueprintSchema, error) {
	rows, err := r.db.Query("SELECT id, name, desc, created_at, updated_at FROM schemas ORDER BY name ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []ports.BlueprintSchema
	for rows.Next() {
		var s ports.BlueprintSchema
		var desc sql.NullString
		if err := rows.Scan(&s.ID, &s.Name, &desc, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		s.Desc = desc.String
		results = append(results, s)
	}
	return results, nil
}
