package repository

import (
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"database/sql"
	"encoding/json"
)

type SQLiteRepository struct {
	db     *sql.DB
	fsRepo ports.RegistryRepository
	config domain.HostConfig
}

func NewSQLiteRepository(db *sql.DB, config domain.HostConfig) (ports.RegistryRepository, error) {
	repo := &SQLiteRepository{
		db:     db,
		fsRepo: NewFilesystemRepository(config),
		config: config,
	}
	if err := repo.initSchema(); err != nil {
		return nil, err
	}
	return repo, nil
}

func (r *SQLiteRepository) initSchema() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS site_config (
			key TEXT PRIMARY KEY,
			content TEXT
		)`,
		`CREATE TABLE IF NOT EXISTS table_details (
			module TEXT,
			name TEXT,
			type TEXT,
			description TEXT,
			columns TEXT,
			PRIMARY KEY (module, name)
		)`,
	}
	for _, q := range queries {
		if _, err := r.db.Exec(q); err != nil {
			return err
		}
	}
	return nil
}

func (r *SQLiteRepository) GetGuidelineSelection() (interface{}, error) {
	return r.getConfig("guidelines")
}

func (r *SQLiteRepository) UpdateGuidelineSelection(selection interface{}) error {
	return r.saveConfig("guidelines", selection)
}

func (r *SQLiteRepository) GetTrainingSelection() (interface{}, error) {
	return r.getConfig("training")
}

func (r *SQLiteRepository) UpdateTrainingSelection(selection interface{}) error {
	return r.saveConfig("training", selection)
}

func (r *SQLiteRepository) getConfig(key string) (interface{}, error) {
	var content string
	err := r.db.QueryRow("SELECT content FROM site_config WHERE key = ?", key).Scan(&content)
	if err == sql.ErrNoRows {
		var selection interface{}
		var errS error
		if key == "guidelines" {
			selection, errS = r.fsRepo.GetGuidelineSelection()
		} else {
			selection, errS = r.fsRepo.GetTrainingSelection()
		}
		if errS != nil {
			return nil, errS
		}
		r.saveConfig(key, selection)
		return selection, nil
	}
	if err != nil {
		return nil, err
	}
	var val interface{}
	if err := json.Unmarshal([]byte(content), &val); err != nil {
		return nil, err
	}
	return val, nil
}

func (r *SQLiteRepository) saveConfig(key string, val interface{}) error {
	data, err := json.Marshal(val)
	if err != nil {
		return err
	}
	_, err = r.db.Exec("INSERT OR REPLACE INTO site_config (key, content) VALUES (?, ?)", key, string(data))
	return err
}

func (r *SQLiteRepository) UpdateTable(moduleName string, table domain.TableDetail) error {
	cols, _ := json.Marshal(table.Columns)
	_, err := r.db.Exec(`INSERT OR REPLACE INTO table_details (module, name, type, description, columns) 
		VALUES (?, ?, ?, ?, ?)`,
		moduleName, table.Name, table.Type, table.Description, string(cols))
	return err
}

// Delegation to FS repo for things not yet fully in SQLite or read-only tree structures
func (r *SQLiteRepository) GetSchemaTree() ([]domain.SchemaNode, error) {
	return r.fsRepo.GetSchemaTree()
}
func (r *SQLiteRepository) GetServiceTree() ([]domain.SchemaNode, error) {
	return r.fsRepo.GetServiceTree()
}
func (r *SQLiteRepository) GetGuidelines() ([]domain.MDXItem, error) { return r.fsRepo.GetGuidelines() }
func (r *SQLiteRepository) GetTrainingItems() ([]domain.MDXItem, error) {
	return r.fsRepo.GetTrainingItems()
}

func (r *SQLiteRepository) GetSchemaDashboard(moduleName string) (domain.SchemaDashboard, error) {
	dash, err := r.fsRepo.GetSchemaDashboard(moduleName)
	if err != nil {
		return dash, err
	}

	// Override with values from SQLite if they exist
	if dash.SchemaStats != nil {
		for i, t := range dash.SchemaStats.TableDetail {
			var dbType, dbDesc, dbCols string
			err := r.db.QueryRow("SELECT type, description, columns FROM table_details WHERE module = ? AND name = ?",
				moduleName, t.Name).Scan(&dbType, &dbDesc, &dbCols)
			if err == nil {
				dash.SchemaStats.TableDetail[i].Type = dbType
				dash.SchemaStats.TableDetail[i].Description = dbDesc
				var cols []domain.ColumnInfo
				if err := json.Unmarshal([]byte(dbCols), &cols); err == nil {
					dash.SchemaStats.TableDetail[i].Columns = cols
				}
			}
		}
	}

	return dash, nil
}
