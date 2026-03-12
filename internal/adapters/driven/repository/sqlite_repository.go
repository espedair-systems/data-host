package repository

import (
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"database/sql"
	"encoding/json"

	"github.com/rs/zerolog/log"
)

type SQLiteRepository struct {
	db       *sql.DB
	fsRepo   ports.RegistryRepository
	config   domain.HostConfig
	userRepo ports.UserRepository
}

func NewSQLiteRepository(db *sql.DB, config domain.HostConfig) (ports.RegistryRepository, error) {
	log.Debug().Msg("Initializing SQLite repository")
	repo := &SQLiteRepository{
		db:       db,
		fsRepo:   NewFilesystemRepository(config),
		config:   config,
		userRepo: NewSQLiteUserRepository(db),
	}
	return repo, nil
}

func (r *SQLiteRepository) GetUserRepo() ports.UserRepository {
	return r.userRepo
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
	log.Debug().Str("key", key).Msg("fetching config from database")
	var content string
	err := r.db.QueryRow("SELECT content FROM site_config WHERE key = ?", key).Scan(&content)
	if err == sql.ErrNoRows {
		log.Debug().Str("key", key).Msg("config not found in database, fetching from filesystem")
		var selection interface{}
		var errS error
		if key == "guidelines" {
			selection, errS = r.fsRepo.GetGuidelineSelection()
		} else {
			selection, errS = r.fsRepo.GetTrainingSelection()
		}
		if errS != nil {
			log.Error().Err(errS).Str("key", key).Msg("failed to fetch config from filesystem")
			return nil, errS
		}
		r.saveConfig(key, selection)
		return selection, nil
	}
	if err != nil {
		log.Error().Err(err).Str("key", key).Msg("database error while fetching config")
		return nil, err
	}
	var val interface{}
	if err := json.Unmarshal([]byte(content), &val); err != nil {
		log.Error().Err(err).Str("key", key).Msg("failed to unmarshal config content")
		return nil, err
	}
	return val, nil
}

func (r *SQLiteRepository) saveConfig(key string, val interface{}) error {
	log.Debug().Str("key", key).Msg("saving config to database")
	data, err := json.Marshal(val)
	if err != nil {
		log.Error().Err(err).Str("key", key).Msg("failed to marshal config content for saving")
		return err
	}
	_, err = r.db.Exec("INSERT OR REPLACE INTO site_config (key, content) VALUES (?, ?)", key, string(data))
	if err != nil {
		log.Error().Err(err).Str("key", key).Msg("failed to save config to database")
	}
	return err
}

func (r *SQLiteRepository) UpdateTable(moduleName string, table domain.TableDetail) error {
	log.Debug().Str("module", moduleName).Str("table", table.Name).Msg("updating table details in database")
	cols, _ := json.Marshal(table.Columns)
	_, err := r.db.Exec(`INSERT OR REPLACE INTO table_details (module, name, type, description, columns) 
		VALUES (?, ?, ?, ?, ?)`,
		moduleName, table.Name, table.Type, table.Description, string(cols))
	if err != nil {
		log.Error().Err(err).Str("module", moduleName).Str("table", table.Name).Msg("failed to update table details")
	}
	return err
}

// Delegation to FS repo for things not yet fully in SQLite or read-only tree structures
func (r *SQLiteRepository) GetBlueprintSchemas() ([]domain.BlueprintSchema, error) {
	log.Debug().Msg("fetching blueprint schemas from database")
	rows, err := r.db.Query("SELECT id, name, desc, created_at, updated_at FROM schemas ORDER BY name ASC")
	if err != nil {
		log.Error().Err(err).Msg("failed to query blueprint schemas")
		return nil, err
	}
	defer rows.Close()

	var results []domain.BlueprintSchema
	for rows.Next() {
		var s domain.BlueprintSchema
		var desc sql.NullString
		if err := rows.Scan(&s.ID, &s.Name, &desc, &s.CreatedAt, &s.UpdatedAt); err != nil {
			log.Error().Err(err).Msg("failed to scan blueprint schema row")
			return nil, err
		}
		s.Desc = desc.String
		results = append(results, s)
	}
	return results, nil
}

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

func (r *SQLiteRepository) GetAllSchemaDashboards() ([]domain.SchemaDashboard, error) {
	dashes, err := r.fsRepo.GetAllSchemaDashboards()
	if err != nil {
		return nil, err
	}
	for i := range dashes {
		r.applyOverrides(&dashes[i])
	}
	return dashes, nil
}

func (r *SQLiteRepository) GetSchemaDashboard(moduleName string) (domain.SchemaDashboard, error) {
	dash, err := r.fsRepo.GetSchemaDashboard(moduleName)
	if err != nil {
		return dash, err
	}
	r.applyOverrides(&dash)
	return dash, nil
}

func (r *SQLiteRepository) applyOverrides(dash *domain.SchemaDashboard) {
	if dash.SchemaStats != nil {
		for i, t := range dash.SchemaStats.TableDetail {
			var dbType, dbDesc, dbCols string
			err := r.db.QueryRow("SELECT type, description, columns FROM table_details WHERE module = ? AND name = ?",
				dash.Name, t.Name).Scan(&dbType, &dbDesc, &dbCols)
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
}
