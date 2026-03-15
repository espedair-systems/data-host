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

func (r *SQLiteRepository) GetPublishedAssets() ([]domain.PublishedAsset, error) {
	assets, err := r.fsRepo.GetPublishedAssets()
	if err != nil {
		return nil, err
	}

	for i := range assets {
		var exists int
		err := r.db.QueryRow("SELECT COUNT(*) FROM schemas WHERE name = ?", assets[i].Name).Scan(&exists)
		if err == nil && exists > 0 {
			assets[i].InDatabase = true
		}
	}

	return assets, nil
}

func (r *SQLiteRepository) GetTableAssets() ([]domain.PublishedAsset, error) {
	assets, err := r.fsRepo.GetTableAssets()
	if err != nil {
		return nil, err
	}

	for i := range assets {
		var exists int
		err := r.db.QueryRow("SELECT COUNT(*) FROM schemas WHERE name = ?", assets[i].Name).Scan(&exists)
		if err == nil && exists > 0 {
			assets[i].InDatabase = true
		}
	}

	return assets, nil
}

func (r *SQLiteRepository) GetRegistryTables(assetName string) ([]domain.RegistryTable, error) {
	fsTables, err := r.fsRepo.GetRegistryTables(assetName)
	if err != nil {
		return nil, err
	}

	// Get tables from database for this schema
	rows, err := r.db.Query(`
		SELECT t.name 
		FROM tables t
		JOIN schemas s ON t.schema_id = s.id
		WHERE s.name = ?`, assetName)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	dbTables := make(map[string]bool)
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err == nil {
			dbTables[name] = true
		}
	}

	// Merge/Mark InDatabase
	tableMap := make(map[string]*domain.RegistryTable)
	for i := range fsTables {
		t := &fsTables[i]
		if dbTables[t.Name] {
			t.InDatabase = true
			delete(dbTables, t.Name)
		}
		tableMap[t.Name] = t
	}

	// Add tables that are in DB but not in FS
	for name := range dbTables {
		fsTables = append(fsTables, domain.RegistryTable{
			Name:       name,
			InFS:       false,
			InDatabase: true,
		})
	}

	return fsTables, nil
}

func (r *SQLiteRepository) GetPublishedFile(assetName, fileName string) ([]byte, error) {
	return r.fsRepo.GetPublishedFile(assetName, fileName)
}

func (r *SQLiteRepository) SavePublishedFile(assetName, fileName string, content []byte) error {
	return r.fsRepo.SavePublishedFile(assetName, fileName, content)
}

func (r *SQLiteRepository) GetWorkflows() ([]domain.DesignFile, error) {
	return r.fsRepo.GetWorkflows()
}

func (r *SQLiteRepository) GetAstroTemplates() ([]domain.DesignFile, error) {
	return r.fsRepo.GetAstroTemplates()
}

func (r *SQLiteRepository) GetDatabaseStats() (domain.DatabaseStats, error) {
	stats := domain.DatabaseStats{}

	// Get SQLite version
	_ = r.db.QueryRow("SELECT sqlite_version()").Scan(&stats.Version)

	// Get total file size using SQLite pragmas
	var pageCount, pageSize int64
	_ = r.db.QueryRow("PRAGMA page_count").Scan(&pageCount)
	_ = r.db.QueryRow("PRAGMA page_size").Scan(&pageSize)
	stats.Size = pageCount * pageSize

	// Get all user tables
	rows, err := r.db.Query(`
		SELECT name FROM sqlite_master 
		WHERE type='table' AND name NOT LIKE 'sqlite_%' 
		AND name NOT LIKE 'goose_%'
		ORDER BY name ASC
	`)
	if err != nil {
		return stats, err
	}
	defer rows.Close()

	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			continue
		}

		var count int64
		err := r.db.QueryRow("SELECT COUNT(*) FROM " + name).Scan(&count)
		if err != nil {
			// Might be a virtual table or something that doesn't support COUNT(*)
			continue
		}

		stats.Tables = append(stats.Tables, domain.TableStats{
			Name: name,
			Rows: count,
		})
	}

	return stats, nil
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

func (r *SQLiteRepository) GetFullSchema(name string) (*domain.FileSchema, error) {
	log.Debug().Str("schema", name).Msg("fetching full schema from database")

	var schemaID int64
	var desc sql.NullString
	var drvName, drvVer, drvCurSchema sql.NullString

	err := r.db.QueryRow(`
		SELECT id, desc, driver_name, driver_database_version, driver_meta_current_schema 
		FROM schemas WHERE name = ?`, name).Scan(&schemaID, &desc, &drvName, &drvVer, &drvCurSchema)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	result := &domain.FileSchema{
		Name: name,
		Desc: desc.String,
	}

	if drvName.Valid {
		result.Driver = &domain.FileDriver{
			Name:            drvName.String,
			DatabaseVersion: drvVer.String,
			Meta: &domain.DriverMeta{
				CurrentSchema: drvCurSchema.String,
			},
		}
	}

	// 1. Fetch tables
	rows, err := r.db.Query("SELECT id, name, type, comment, def, labels, referenced_tables FROM tables WHERE schema_id = ?", schemaID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var t domain.FileTable
		var tid int64
		var tComment, tDef, tLabels, tRefTables sql.NullString
		if err := rows.Scan(&tid, &t.Name, &t.Type, &tComment, &tDef, &tLabels, &tRefTables); err != nil {
			return nil, err
		}
		t.Comment = tComment.String
		t.Def = tDef.String
		if tLabels.Valid {
			json.Unmarshal([]byte(tLabels.String), &t.Labels)
		}
		if tRefTables.Valid {
			json.Unmarshal([]byte(tRefTables.String), &t.ReferencedTables)
		}

		// Fetch columns for this table
		crows, err := r.db.Query("SELECT name, type, nullable, default_value, comment, extra_def, labels, tags FROM columns WHERE table_id = ?", tid)
		if err != nil {
			return nil, err
		}
		for crows.Next() {
			var col domain.FileColumn
			var cComment, cDefault, cExtra, cLabels, cTags sql.NullString
			if err := crows.Scan(&col.Name, &col.Type, &col.Nullable, &cDefault, &cComment, &cExtra, &cLabels, &cTags); err != nil {
				crows.Close()
				return nil, err
			}
			col.Comment = cComment.String
			col.Default = cDefault.String
			col.ExtraDef = cExtra.String
			if cLabels.Valid {
				json.Unmarshal([]byte(cLabels.String), &col.Labels)
			}
			if cTags.Valid {
				json.Unmarshal([]byte(cTags.String), &col.Tags)
			}
			t.Columns = append(t.Columns, col)
		}
		crows.Close()

		// Fetch indexes with columns
		idxRows, _ := r.db.Query("SELECT id, name, def, comment FROM indexes WHERE table_id = ?", tid)
		for idxRows != nil && idxRows.Next() {
			var idx domain.FileIndex
			var iid int64
			var iComment sql.NullString
			idxRows.Scan(&iid, &idx.Name, &idx.Def, &iComment)
			idx.Comment = iComment.String
			idx.Table = t.Name

			// Fetch columns for this index
			icRows, _ := r.db.Query("SELECT column_name FROM index_columns WHERE index_id = ? ORDER BY position", iid)
			for icRows != nil && icRows.Next() {
				var cn string
				icRows.Scan(&cn)
				idx.Columns = append(idx.Columns, cn)
			}
			if icRows != nil {
				icRows.Close()
			}
			t.Indexes = append(t.Indexes, idx)
		}
		if idxRows != nil {
			idxRows.Close()
		}

		// Fetch constraints with columns
		cnstRows, _ := r.db.Query("SELECT id, name, type, def, referenced_table, comment FROM constraints WHERE table_id = ?", tid)
		for cnstRows != nil && cnstRows.Next() {
			var cnst domain.FileConstraint
			var cid int64
			var cComment, cRefTable sql.NullString
			cnstRows.Scan(&cid, &cnst.Name, &cnst.Type, &cnst.Def, &cRefTable, &cComment)
			cnst.Comment = cComment.String
			cnst.ReferencedTable = cRefTable.String
			cnst.Table = t.Name

			// Local columns
			lccRows, _ := r.db.Query("SELECT column_name FROM constraint_columns WHERE constraint_id = ? ORDER BY position", cid)
			for lccRows != nil && lccRows.Next() {
				var cn string
				lccRows.Scan(&cn)
				cnst.Columns = append(cnst.Columns, cn)
			}
			if lccRows != nil {
				lccRows.Close()
			}

			// Ref columns
			rfcRows, _ := r.db.Query("SELECT column_name FROM constraint_referenced_columns WHERE constraint_id = ? ORDER BY position", cid)
			for rfcRows != nil && rfcRows.Next() {
				var cn string
				rfcRows.Scan(&cn)
				cnst.ReferencedColumns = append(cnst.ReferencedColumns, cn)
			}
			if rfcRows != nil {
				rfcRows.Close()
			}
			t.Constraints = append(t.Constraints, cnst)
		}
		if cnstRows != nil {
			cnstRows.Close()
		}

		// Triggers
		trgRows, _ := r.db.Query("SELECT name, def, comment FROM triggers WHERE table_id = ?", tid)
		for trgRows != nil && trgRows.Next() {
			var trg domain.FileTrigger
			var tgComment sql.NullString
			trgRows.Scan(&trg.Name, &trg.Def, &tgComment)
			trg.Comment = tgComment.String
			t.Triggers = append(t.Triggers, trg)
		}
		if trgRows != nil {
			trgRows.Close()
		}

		result.Tables = append(result.Tables, t)
	}

	// 2. Fetch Relations with columns
	relRows, _ := r.db.Query("SELECT id, table_name, parent_table_name, cardinality, parent_cardinality, def, virtual, type FROM relations WHERE schema_id = ?", schemaID)
	for relRows != nil && relRows.Next() {
		var rel domain.FileRelation
		var rid int64
		relRows.Scan(&rid, &rel.Table, &rel.ParentTable, &rel.Cardinality, &rel.ParentCardinality, &rel.Def, &rel.Virtual, &rel.Type)

		// Columns
		rcRows, _ := r.db.Query("SELECT column_name FROM relation_columns WHERE relation_id = ? ORDER BY position", rid)
		for rcRows != nil && rcRows.Next() {
			var cn string
			rcRows.Scan(&cn)
			rel.Columns = append(rel.Columns, cn)
		}
		if rcRows != nil {
			rcRows.Close()
		}

		// Parent columns
		rpcRows, _ := r.db.Query("SELECT column_name FROM relation_parent_columns WHERE relation_id = ? ORDER BY position", rid)
		for rpcRows != nil && rpcRows.Next() {
			var cn string
			rpcRows.Scan(&cn)
			rel.ParentColumns = append(rel.ParentColumns, cn)
		}
		if rpcRows != nil {
			rpcRows.Close()
		}

		result.Relations = append(result.Relations, rel)
	}
	if relRows != nil {
		relRows.Close()
	}

	// 3. Fetch Enums
	enumRows, _ := r.db.Query("SELECT id, name FROM enums WHERE schema_id = ?", schemaID)
	for enumRows != nil && enumRows.Next() {
		var enum domain.FileEnum
		var eid int64
		enumRows.Scan(&eid, &enum.Name)
		valRows, _ := r.db.Query("SELECT value FROM enum_values WHERE enum_id = ? ORDER BY position", eid)
		for valRows != nil && valRows.Next() {
			var val string
			valRows.Scan(&val)
			enum.Values = append(enum.Values, val)
		}
		if valRows != nil {
			valRows.Close()
		}
		result.Enums = append(result.Enums, enum)
	}
	if enumRows != nil {
		enumRows.Close()
	}

	// 4. Fetch Functions
	funcRows, _ := r.db.Query("SELECT name, return_type, arguments, type FROM functions WHERE schema_id = ?", schemaID)
	for funcRows != nil && funcRows.Next() {
		var f domain.FileFunction
		funcRows.Scan(&f.Name, &f.ReturnType, &f.Arguments, &f.Type)
		result.Functions = append(result.Functions, f)
	}
	if funcRows != nil {
		funcRows.Close()
	}

	// 5. Fetch Viewpoints
	vpRows, _ := r.db.Query("SELECT id, name, desc, distance, labels, groups FROM viewpoints WHERE schema_id = ?", schemaID)
	for vpRows != nil && vpRows.Next() {
		var vp domain.FileViewpoint
		var vpid int64
		var vLabels, vGroups sql.NullString
		vpRows.Scan(&vpid, &vp.Name, &vp.Desc, &vp.Distance, &vLabels, &vGroups)
		if vLabels.Valid {
			json.Unmarshal([]byte(vLabels.String), &vp.Labels)
		}
		if vGroups.Valid {
			json.Unmarshal([]byte(vGroups.String), &vp.Groups)
		}

		// Fetch viewpoint tables
		vtRows, _ := r.db.Query("SELECT table_name FROM viewpoint_tables WHERE viewpoint_id = ?", vpid)
		for vtRows != nil && vtRows.Next() {
			var tn string
			vtRows.Scan(&tn)
			vp.Tables = append(vp.Tables, tn)
		}
		if vtRows != nil {
			vtRows.Close()
		}
		result.Viewpoints = append(result.Viewpoints, vp)
	}
	if vpRows != nil {
		vpRows.Close()
	}

	return result, nil
}

func (r *SQLiteRepository) SaveFullSchema(schema domain.FileSchema) error {
	log.Info().Str("schema", schema.Name).Msg("Ingesting full schema into database")

	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Check if exists
	var schemaID int64
	err = tx.QueryRow("SELECT id FROM schemas WHERE name = ?", schema.Name).Scan(&schemaID)

	if err == sql.ErrNoRows {
		res, err := tx.Exec(`
			INSERT INTO schemas (name, desc, driver_name, driver_database_version, driver_meta_current_schema) 
			VALUES (?, ?, ?, ?, ?)`,
			schema.Name, schema.Desc,
			getDriverName(schema.Driver), getDriverVer(schema.Driver), getDriverSchema(schema.Driver))
		if err != nil {
			return err
		}
		schemaID, _ = res.LastInsertId()
	} else if err != nil {
		return err
	} else {
		_, err = tx.Exec(`
			UPDATE schemas 
			SET desc = ?, driver_name = ?, driver_database_version = ?, driver_meta_current_schema = ?, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?`,
			schema.Desc, getDriverName(schema.Driver), getDriverVer(schema.Driver), getDriverSchema(schema.Driver),
			schemaID)
		if err != nil {
			return err
		}
	}

	// For Ingestion, we only update what is in the payload.
	// However, usually ingestion of a FULL file means these items in the file represent the state for those items.
	// The USER said "allow the user to select what is written".
	// So schema.Tables only contains selected tables.

	for _, t := range schema.Tables {
		// Cleanup existing table data
		_, _ = tx.Exec("DELETE FROM tables WHERE schema_id = ? AND name = ?", schemaID, t.Name)

		labelsJSON, _ := json.Marshal(t.Labels)
		refTablesJSON, _ := json.Marshal(t.ReferencedTables)

		res, err := tx.Exec("INSERT INTO tables (schema_id, name, type, comment, def, labels, referenced_tables) VALUES (?, ?, ?, ?, ?, ?, ?)",
			schemaID, t.Name, t.Type, t.Comment, t.Def, string(labelsJSON), string(refTablesJSON))
		if err != nil {
			return err
		}
		tableID, _ := res.LastInsertId()

		for _, col := range t.Columns {
			cLabels, _ := json.Marshal(col.Labels)
			cTags, _ := json.Marshal(col.Tags)
			_, err = tx.Exec(`
				INSERT INTO columns (table_id, name, type, nullable, default_value, comment, extra_def, labels, tags) 
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				tableID, col.Name, col.Type, col.Nullable, formatDefault(col.Default), col.Comment, col.ExtraDef, string(cLabels), string(cTags))
			if err != nil {
				return err
			}
		}

		for _, idx := range t.Indexes {
			res, err := tx.Exec("INSERT INTO indexes (table_id, name, def, comment) VALUES (?, ?, ?, ?)",
				tableID, idx.Name, idx.Def, idx.Comment)
			if err != nil {
				return err
			}
			idxID, _ := res.LastInsertId()
			for i, colName := range idx.Columns {
				_, _ = tx.Exec("INSERT INTO index_columns (index_id, column_name, position) VALUES (?, ?, ?)", idxID, colName, i)
			}
		}

		for _, cnst := range t.Constraints {
			res, err := tx.Exec("INSERT INTO constraints (table_id, name, type, def, referenced_table, comment) VALUES (?, ?, ?, ?, ?, ?)",
				tableID, cnst.Name, cnst.Type, cnst.Def, cnst.ReferencedTable, cnst.Comment)
			if err != nil {
				return err
			}
			cnstID, _ := res.LastInsertId()
			for i, colName := range cnst.Columns {
				_, _ = tx.Exec("INSERT INTO constraint_columns (constraint_id, column_name, position) VALUES (?, ?, ?)", cnstID, colName, i)
			}
			for i, colName := range cnst.ReferencedColumns {
				_, _ = tx.Exec("INSERT INTO constraint_referenced_columns (constraint_id, column_name, position) VALUES (?, ?, ?)", cnstID, colName, i)
			}
		}

		for _, trg := range t.Triggers {
			_, err = tx.Exec("INSERT INTO triggers (table_id, name, def, comment) VALUES (?, ?, ?, ?)",
				tableID, trg.Name, trg.Def, trg.Comment)
			if err != nil {
				return err
			}
		}
	}

	// Relations (Update only provided)
	for _, rel := range schema.Relations {
		_, _ = tx.Exec("DELETE FROM relations WHERE schema_id = ? AND table_name = ? AND parent_table_name = ?",
			schemaID, rel.Table, rel.ParentTable)

		res, err := tx.Exec(`
			INSERT INTO relations (schema_id, table_name, parent_table_name, cardinality, parent_cardinality, def, virtual, type) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			schemaID, rel.Table, rel.ParentTable, rel.Cardinality, rel.ParentCardinality, rel.Def, rel.Virtual, rel.Type)
		if err != nil {
			return err
		}
		relID, _ := res.LastInsertId()
		for i, colName := range rel.Columns {
			_, _ = tx.Exec("INSERT INTO relation_columns (relation_id, column_name, position) VALUES (?, ?, ?)", relID, colName, i)
		}
		for i, colName := range rel.ParentColumns {
			_, _ = tx.Exec("INSERT INTO relation_parent_columns (relation_id, column_name, position) VALUES (?, ?, ?)", relID, colName, i)
		}
	}

	// Enums (Update only provided)
	for _, e := range schema.Enums {
		var eid int64
		_ = tx.QueryRow("SELECT id FROM enums WHERE schema_id = ? AND name = ?", schemaID, e.Name).Scan(&eid)
		if eid > 0 {
			_, _ = tx.Exec("DELETE FROM enum_values WHERE enum_id = ?", eid)
			_, _ = tx.Exec("DELETE FROM enums WHERE id = ?", eid)
		}

		res, err := tx.Exec("INSERT INTO enums (schema_id, name) VALUES (?, ?)", schemaID, e.Name)
		if err != nil {
			return err
		}
		eid, _ = res.LastInsertId()
		for i, val := range e.Values {
			_, _ = tx.Exec("INSERT INTO enum_values (enum_id, value, position) VALUES (?, ?, ?)", eid, val, i)
		}
	}

	// Functions
	for _, f := range schema.Functions {
		_, _ = tx.Exec("DELETE FROM functions WHERE schema_id = ? AND name = ?", schemaID, f.Name)
		_, err = tx.Exec("INSERT INTO functions (schema_id, name, return_type, arguments, type) VALUES (?, ?, ?, ?, ?)",
			schemaID, f.Name, f.ReturnType, f.Arguments, f.Type)
		if err != nil {
			return err
		}
	}

	// Viewpoints
	for _, vp := range schema.Viewpoints {
		var vpid int64
		_ = tx.QueryRow("SELECT id FROM viewpoints WHERE schema_id = ? AND name = ?", schemaID, vp.Name).Scan(&vpid)
		if vpid > 0 {
			_, _ = tx.Exec("DELETE FROM viewpoint_tables WHERE viewpoint_id = ?", vpid)
			_, _ = tx.Exec("DELETE FROM viewpoints WHERE id = ?", vpid)
		}

		vLabels, _ := json.Marshal(vp.Labels)
		vGroups, _ := json.Marshal(vp.Groups)

		res, err := tx.Exec("INSERT INTO viewpoints (schema_id, name, desc, distance, labels, groups) VALUES (?, ?, ?, ?, ?, ?)",
			schemaID, vp.Name, vp.Desc, vp.Distance, string(vLabels), string(vGroups))
		if err != nil {
			return err
		}
		vpid, _ = res.LastInsertId()
		for _, tn := range vp.Tables {
			_, _ = tx.Exec("INSERT INTO viewpoint_tables (viewpoint_id, table_name) VALUES (?, ?)", vpid, tn)
		}
	}

	return tx.Commit()
}

// Helpers for SaveFullSchema
func getDriverName(d *domain.FileDriver) string {
	if d == nil {
		return ""
	}
	return d.Name
}
func getDriverVer(d *domain.FileDriver) string {
	if d == nil {
		return ""
	}
	return d.DatabaseVersion
}
func getDriverSchema(d *domain.FileDriver) string {
	if d == nil || d.Meta == nil {
		return ""
	}
	return d.Meta.CurrentSchema
}
func formatDefault(v interface{}) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return "" // Simplified
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
