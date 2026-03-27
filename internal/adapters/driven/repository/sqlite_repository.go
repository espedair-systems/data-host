/*
 * Driven Adapter: Infrastructure / Implementation.
 * Implements outbound ports for external systems like databases or filesystems.
 */
package repository

import (
	"data-host/internal/core/domain"
	"data-host/internal/core/ports"
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

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
	err := r.db.QueryRow("SELECT content FROM db_site_config WHERE key = ?", key).Scan(&content)
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
	_, err = r.db.Exec("INSERT OR REPLACE INTO db_site_config (key, content) VALUES (?, ?)", key, string(data))
	if err != nil {
		log.Error().Err(err).Str("key", key).Msg("failed to save config to database")
	}
	return err
}

func (r *SQLiteRepository) UpdateTable(moduleName string, table domain.TableDetail) error {
	log.Debug().Str("module", moduleName).Str("table", table.Name).Msg("updating table details in database")
	cols, _ := json.Marshal(table.Columns)
	_, err := r.db.Exec(`INSERT OR REPLACE INTO db_table_details (module, name, type, description, columns) 
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
	rows, err := r.db.Query("SELECT id, name, desc, created_at, updated_at FROM db_schemas ORDER BY name ASC")
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

func (r *SQLiteRepository) GetBlueprintTables(criteria map[string]string) ([]domain.BlueprintTableSummary, error) {
	query := `
		SELECT 
			t.name, 
			s.name as schema_name, 
			t.type, 
			t.comment,
			(SELECT COUNT(*) FROM db_columns c WHERE c.table_id = t.id) as column_count
		FROM db_tables t
		JOIN db_schemas s ON t.schema_id = s.id
		WHERE 1=1
	`
	var args []interface{}

	if val, ok := criteria["schemaName"]; ok && val != "" {
		query += " AND s.name = ?"
		args = append(args, val)
	}

	if val, ok := criteria["search"]; ok && val != "" {
		query += " AND (t.name LIKE ? OR t.comment LIKE ?)"
		args = append(args, "%"+val+"%", "%"+val+"%")
	}

	query += " ORDER BY s.name ASC, t.name ASC"

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []domain.BlueprintTableSummary
	for rows.Next() {
		var t domain.BlueprintTableSummary
		var desc sql.NullString
		if err := rows.Scan(&t.Name, &t.SchemaName, &t.Type, &desc, &t.ColumnCount); err != nil {
			return nil, err
		}
		t.Description = desc.String
		results = append(results, t)
	}
	return results, nil
}

func (r *SQLiteRepository) GetSchemaTree() ([]domain.SchemaNode, error) {
	// 1. Get filesystem tree
	tree, err := r.fsRepo.GetSchemaTree()
	if err != nil {
		log.Error().Err(err).Msg("failed to get filesystem schema tree")
		// Continue to database even if FS fails
	}

	// 2. Get schemas from database
	schemas, err := r.GetBlueprintSchemas()
	if err != nil {
		log.Error().Err(err).Msg("failed to get blueprint schemas for tree")
		return tree, nil // Return what we have from FS
	}

	// 3. Add DB schemas to the tree
	for _, s := range schemas {
		node := domain.SchemaNode{
			Name:    s.Name + " (DB)",
			Path:    "db/" + s.Name,
			IsDir:   true,
			HasData: true,
		}

		// 4. Get tables for this schema to add as children
		tables, err := r.GetBlueprintTables(map[string]string{"schemaName": s.Name})
		if err == nil {
			for _, t := range tables {
				node.Children = append(node.Children, domain.SchemaNode{
					Name:    t.Name,
					Path:    "db/" + s.Name + "/" + t.Name,
					IsDir:   false,
					HasData: true,
				})
			}
		}

		tree = append(tree, node)
	}

	return tree, nil
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
		// Check both directory name and internal schema name
		query := "SELECT COUNT(*) FROM db_schemas WHERE name = ?"
		err := r.db.QueryRow(query, assets[i].Name).Scan(&exists)
		if err == nil && exists > 0 {
			assets[i].InDatabase = true
			continue
		}

		if assets[i].InternalName != "" && assets[i].InternalName != assets[i].Name {
			err = r.db.QueryRow(query, assets[i].InternalName).Scan(&exists)
			if err == nil && exists > 0 {
				assets[i].InDatabase = true
			}
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
		query := "SELECT COUNT(*) FROM db_schemas WHERE name = ?" // Changed 'schemas' to 'db_schemas'
		err := r.db.QueryRow(query, assets[i].Name).Scan(&exists)
		if err == nil && exists > 0 {
			assets[i].InDatabase = true
			continue
		}

		if assets[i].InternalName != "" && assets[i].InternalName != assets[i].Name {
			err = r.db.QueryRow(query, assets[i].InternalName).Scan(&exists)
			if err == nil && exists > 0 {
				assets[i].InDatabase = true
			}
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
		FROM db_tables t
		JOIN db_schemas s ON t.schema_id = s.id
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

func (r *SQLiteRepository) ExtractDatabaseSchema(name, desc string) (*domain.FileSchema, error) {
	schema := &domain.FileSchema{
		Name:      name,
		Desc:      desc,
		ERDLimit:  r.config.ERDLimit,
		Tables:    []domain.FileTable{},
		Relations: []domain.FileRelation{},
	}

	// 1. Get all regular tables
	rows, err := r.db.Query(`
		SELECT name, sql FROM sqlite_master 
		WHERE type='table' AND name NOT LIKE 'sqlite_%' 
		AND name NOT LIKE 'goose_%'
		ORDER BY name ASC
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to query tables: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var tableName, tableSQL string
		if err := rows.Scan(&tableName, &tableSQL); err != nil {
			continue
		}

		table := domain.FileTable{
			Name: tableName,
			Type: "table",
			Def:  tableSQL,
		}

		// 2. Get columns
		colRows, err := r.db.Query("PRAGMA table_info(" + tableName + ")")
		if err == nil {
			for colRows.Next() {
				var cid int
				var cname, ctype string
				var notnull int
				var dfltValue interface{}
				var pk int

				if err := colRows.Scan(&cid, &cname, &ctype, &notnull, &dfltValue, &pk); err == nil {
					table.Columns = append(table.Columns, domain.FileColumn{
						Name:     cname,
						Type:     ctype,
						Nullable: notnull == 0,
					})
				}
			}
			colRows.Close()
		}

		// 3. Get indexes
		idxRows, err := r.db.Query("PRAGMA index_list(" + tableName + ")")
		if err == nil {
			for idxRows.Next() {
				var seq int
				var idxName string
				var unique int
				var origin string
				var partial int
				if err := idxRows.Scan(&seq, &idxName, &unique, &origin, &partial); err == nil {
					table.Indexes = append(table.Indexes, domain.FileIndex{
						Name:  idxName,
						Table: tableName,
					})
				}
			}
			idxRows.Close()
		}

		// 4. Get relations (Foreign Keys)
		fkRows, err := r.db.Query("PRAGMA foreign_key_list(" + tableName + ")")
		if err == nil {
			for fkRows.Next() {
				var id, seq int
				var targetTable, fromCol, toCol, onUpdate, onDelete, match string
				if err := fkRows.Scan(&id, &seq, &targetTable, &fromCol, &toCol, &onUpdate, &onDelete, &match); err == nil {
					schema.Relations = append(schema.Relations, domain.FileRelation{
						Table:         tableName,
						Columns:       []string{fromCol},
						ParentTable:   targetTable,
						ParentColumns: []string{toCol},
					})
				}
			}
			fkRows.Close()
		}

		schema.Tables = append(schema.Tables, table)
	}

	return schema, nil
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
		FROM db_schemas WHERE name = ?`, name).Scan(&schemaID, &desc, &drvName, &drvVer, &drvCurSchema)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	result := &domain.FileSchema{
		Name:     name,
		Desc:     desc.String,
		ERDLimit: r.config.ERDLimit,
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
	rows, err := r.db.Query("SELECT id, name, type, comment, def, labels, referenced_tables FROM db_tables WHERE schema_id = ?", schemaID)
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
		crows, err := r.db.Query("SELECT name, type, nullable, default_value, comment, extra_def, labels, tags FROM db_columns WHERE table_id = ?", tid)
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
		idxRows, _ := r.db.Query("SELECT id, name, def, comment FROM db_indexes WHERE table_id = ?", tid)
		for idxRows != nil && idxRows.Next() {
			var idx domain.FileIndex
			var iid int64
			var iComment sql.NullString
			idxRows.Scan(&iid, &idx.Name, &idx.Def, &iComment)
			idx.Comment = iComment.String
			idx.Table = t.Name

			// Fetch columns for this index
			icRows, _ := r.db.Query("SELECT column_name FROM db_index_columns WHERE index_id = ? ORDER BY position", iid)
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
		cnstRows, _ := r.db.Query("SELECT id, name, type, def, referenced_table, comment FROM db_constraints WHERE table_id = ?", tid)
		for cnstRows != nil && cnstRows.Next() {
			var cnst domain.FileConstraint
			var cid int64
			var cComment, cRefTable sql.NullString
			cnstRows.Scan(&cid, &cnst.Name, &cnst.Type, &cnst.Def, &cRefTable, &cComment)
			cnst.Comment = cComment.String
			cnst.ReferencedTable = cRefTable.String
			cnst.Table = t.Name

			// Local columns
			lccRows, _ := r.db.Query("SELECT column_name FROM db_constraint_columns WHERE constraint_id = ? ORDER BY position", cid)
			for lccRows != nil && lccRows.Next() {
				var cn string
				lccRows.Scan(&cn)
				cnst.Columns = append(cnst.Columns, cn)
			}
			if lccRows != nil {
				lccRows.Close()
			}

			// Ref columns
			rfcRows, _ := r.db.Query("SELECT column_name FROM db_constraint_referenced_columns WHERE constraint_id = ? ORDER BY position", cid)
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
		trgRows, _ := r.db.Query("SELECT name, def, comment FROM db_triggers WHERE table_id = ?", tid)
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
	relRows, _ := r.db.Query("SELECT id, table_name, parent_table_name, cardinality, parent_cardinality, def, virtual, type FROM db_relations WHERE schema_id = ?", schemaID)
	for relRows != nil && relRows.Next() {
		var rel domain.FileRelation
		var rid int64
		relRows.Scan(&rid, &rel.Table, &rel.ParentTable, &rel.Cardinality, &rel.ParentCardinality, &rel.Def, &rel.Virtual, &rel.Type)

		// Columns
		rcRows, _ := r.db.Query("SELECT column_name FROM db_relation_columns WHERE relation_id = ? ORDER BY position", rid)
		for rcRows != nil && rcRows.Next() {
			var cn string
			rcRows.Scan(&cn)
			rel.Columns = append(rel.Columns, cn)
		}
		if rcRows != nil {
			rcRows.Close()
		}

		// Parent columns
		rpcRows, _ := r.db.Query("SELECT column_name FROM db_relation_parent_columns WHERE relation_id = ? ORDER BY position", rid)
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
	enumRows, _ := r.db.Query("SELECT id, name FROM db_enums WHERE schema_id = ?", schemaID)
	for enumRows != nil && enumRows.Next() {
		var enum domain.FileEnum
		var eid int64
		enumRows.Scan(&eid, &enum.Name)
		valRows, _ := r.db.Query("SELECT value FROM db_enum_values WHERE enum_id = ? ORDER BY position", eid)
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
	funcRows, _ := r.db.Query("SELECT name, return_type, arguments, type FROM db_functions WHERE schema_id = ?", schemaID)
	for funcRows != nil && funcRows.Next() {
		var f domain.FileFunction
		funcRows.Scan(&f.Name, &f.ReturnType, &f.Arguments, &f.Type)
		result.Functions = append(result.Functions, f)
	}
	if funcRows != nil {
		funcRows.Close()
	}

	// 5. Fetch Viewpoints
	vpRows, _ := r.db.Query("SELECT id, name, desc, distance, labels, groups FROM db_viewpoints WHERE schema_id = ?", schemaID)
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
		vtRows, _ := r.db.Query("SELECT table_name FROM db_viewpoint_tables WHERE viewpoint_id = ?", vpid)
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
	err = tx.QueryRow("SELECT id FROM db_schemas WHERE name = ?", schema.Name).Scan(&schemaID)

	if err == sql.ErrNoRows {
		res, err := tx.Exec(`
			INSERT INTO db_schemas (name, desc, driver_name, driver_database_version, driver_meta_current_schema) 
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
			UPDATE db_schemas 
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
		_, _ = tx.Exec("DELETE FROM db_tables WHERE schema_id = ? AND name = ?", schemaID, t.Name)

		labelsJSON, _ := json.Marshal(t.Labels)
		refTablesJSON, _ := json.Marshal(t.ReferencedTables)

		res, err := tx.Exec("INSERT INTO db_tables (schema_id, name, type, comment, def, labels, referenced_tables) VALUES (?, ?, ?, ?, ?, ?, ?)",
			schemaID, t.Name, t.Type, t.Comment, t.Def, string(labelsJSON), string(refTablesJSON))
		if err != nil {
			return err
		}
		tableID, _ := res.LastInsertId()

		for _, col := range t.Columns {
			cLabels, _ := json.Marshal(col.Labels)
			cTags, _ := json.Marshal(col.Tags)
			_, err = tx.Exec(`
				INSERT INTO db_columns (table_id, name, type, nullable, default_value, comment, extra_def, labels, tags) 
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				tableID, col.Name, col.Type, col.Nullable, formatDefault(col.Default), col.Comment, col.ExtraDef, string(cLabels), string(cTags))
			if err != nil {
				return err
			}
		}

		for _, idx := range t.Indexes {
			res, err := tx.Exec("INSERT INTO db_indexes (table_id, name, def, comment) VALUES (?, ?, ?, ?)",
				tableID, idx.Name, idx.Def, idx.Comment)
			if err != nil {
				return err
			}
			idxID, _ := res.LastInsertId()
			for i, colName := range idx.Columns {
				_, _ = tx.Exec("INSERT INTO db_index_columns (index_id, column_name, position) VALUES (?, ?, ?)", idxID, colName, i)
			}
		}

		for _, cnst := range t.Constraints {
			res, err := tx.Exec("INSERT INTO db_constraints (table_id, name, type, def, referenced_table, comment) VALUES (?, ?, ?, ?, ?, ?)",
				tableID, cnst.Name, cnst.Type, cnst.Def, cnst.ReferencedTable, cnst.Comment)
			if err != nil {
				return err
			}
			cnstID, _ := res.LastInsertId()
			for i, colName := range cnst.Columns {
				_, _ = tx.Exec("INSERT INTO db_constraint_columns (constraint_id, column_name, position) VALUES (?, ?, ?)", cnstID, colName, i)
			}
			for i, colName := range cnst.ReferencedColumns {
				_, _ = tx.Exec("INSERT INTO db_constraint_referenced_columns (constraint_id, column_name, position) VALUES (?, ?, ?)", cnstID, colName, i)
			}
		}

		for _, trg := range t.Triggers {
			_, err = tx.Exec("INSERT INTO db_triggers (table_id, name, def, comment) VALUES (?, ?, ?, ?)",
				tableID, trg.Name, trg.Def, trg.Comment)
			if err != nil {
				return err
			}
		}
	}

	// Relations (Update only provided)
	for _, rel := range schema.Relations {
		_, _ = tx.Exec("DELETE FROM db_relations WHERE schema_id = ? AND table_name = ? AND parent_table_name = ?",
			schemaID, rel.Table, rel.ParentTable)

		res, err := tx.Exec(`
			INSERT INTO db_relations (schema_id, table_name, parent_table_name, cardinality, parent_cardinality, def, virtual, type) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			schemaID, rel.Table, rel.ParentTable, rel.Cardinality, rel.ParentCardinality, rel.Def, rel.Virtual, rel.Type)
		if err != nil {
			return err
		}
		relID, _ := res.LastInsertId()
		for i, colName := range rel.Columns {
			_, _ = tx.Exec("INSERT INTO db_relation_columns (relation_id, column_name, position) VALUES (?, ?, ?)", relID, colName, i)
		}
		for i, colName := range rel.ParentColumns {
			_, _ = tx.Exec("INSERT INTO db_relation_parent_columns (relation_id, column_name, position) VALUES (?, ?, ?)", relID, colName, i)
		}
	}

	// Enums (Update only provided)
	for _, e := range schema.Enums {
		var eid int64
		_ = tx.QueryRow("SELECT id FROM db_enums WHERE schema_id = ? AND name = ?", schemaID, e.Name).Scan(&eid)
		if eid > 0 {
			_, _ = tx.Exec("DELETE FROM db_enum_values WHERE enum_id = ?", eid)
			_, _ = tx.Exec("DELETE FROM db_enums WHERE id = ?", eid)
		}

		res, err := tx.Exec("INSERT INTO db_enums (schema_id, name) VALUES (?, ?)", schemaID, e.Name)
		if err != nil {
			return err
		}
		eid, _ = res.LastInsertId()
		for i, val := range e.Values {
			_, _ = tx.Exec("INSERT INTO db_enum_values (enum_id, value, position) VALUES (?, ?, ?)", eid, val, i)
		}
	}

	// Functions
	for _, f := range schema.Functions {
		_, _ = tx.Exec("DELETE FROM db_functions WHERE schema_id = ? AND name = ?", schemaID, f.Name)
		_, err = tx.Exec("INSERT INTO db_functions (schema_id, name, return_type, arguments, type) VALUES (?, ?, ?, ?, ?)",
			schemaID, f.Name, f.ReturnType, f.Arguments, f.Type)
		if err != nil {
			return err
		}
	}

	// Viewpoints
	for _, vp := range schema.Viewpoints {
		var vpid int64
		_ = tx.QueryRow("SELECT id FROM db_viewpoints WHERE schema_id = ? AND name = ?", schemaID, vp.Name).Scan(&vpid)
		if vpid > 0 {
			_, _ = tx.Exec("DELETE FROM db_viewpoint_tables WHERE viewpoint_id = ?", vpid)
			_, _ = tx.Exec("DELETE FROM db_viewpoints WHERE id = ?", vpid)
		}

		vLabels, _ := json.Marshal(vp.Labels)
		vGroups, _ := json.Marshal(vp.Groups)

		res, err := tx.Exec("INSERT INTO db_viewpoints (schema_id, name, desc, distance, labels, groups) VALUES (?, ?, ?, ?, ?, ?)",
			schemaID, vp.Name, vp.Desc, vp.Distance, string(vLabels), string(vGroups))
		if err != nil {
			return err
		}
		vpid, _ = res.LastInsertId()
		for _, tn := range vp.Tables {
			_, _ = tx.Exec("INSERT INTO db_viewpoint_tables (viewpoint_id, table_name) VALUES (?, ?)", vpid, tn)
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
			err := r.db.QueryRow("SELECT type, description, columns FROM db_table_details WHERE module = ? AND name = ?",
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
	dash.ERDLimit = r.config.ERDLimit
}

func (r *SQLiteRepository) GetSites() ([]domain.SiteConfig, error) {
	sites, err := r.fsRepo.GetSites()
	if err != nil {
		return nil, err
	}

	for i, site := range sites {
		var desc, siteType string
		err := r.db.QueryRow("SELECT description, type FROM mnt_sites WHERE name = ?", site.Name).Scan(&desc, &siteType)
		if err == nil {
			sites[i].InDatabase = true
			if desc != "" {
				sites[i].Description = desc
			}
			if siteType != "" {
				sites[i].Type = siteType
			}
		}
	}

	return sites, nil
}

func (r *SQLiteRepository) SaveSiteConfig(site domain.SiteConfig) error {
	log.Info().Str("site", site.Name).Msg("saving site configuration to database")
	_, err := r.db.Exec(`
		INSERT OR REPLACE INTO mnt_sites (name, type, description, data_path, mount_path, mount_source, mount_dist, active)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, site.Name, site.Type, site.Description, site.DataPath, site.MountPath, site.MountSource, site.MountDist, site.Active)
	if err != nil {
		log.Error().Err(err).Str("site", site.Name).Msg("failed to save site config to database")
		return err
	}
	log.Info().Str("site", site.Name).Msg("successfully saved site to database")

	// Also attempt to ingest the site's schema if it exists
	// Look in: site.DataPath/schema.json, site.DataPath/data/schema.json, and all subdirectories
	var schemaPaths []string

	possibleRoot := filepath.Join(site.DataPath, "schema.json")
	if _, err := os.Stat(possibleRoot); err == nil {
		schemaPaths = append(schemaPaths, possibleRoot)
	}
	possibleData := filepath.Join(site.DataPath, "data", "schema.json")
	if _, err := os.Stat(possibleData); err == nil {
		schemaPaths = append(schemaPaths, possibleData)
	}

	// Recursive scan if needed (e.g. site/data/blog/schema.json)
	if len(schemaPaths) == 0 {
		filepath.Walk(site.DataPath, func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return nil
			}
			if !info.IsDir() && info.Name() == "schema.json" {
				schemaPaths = append(schemaPaths, path)
			}
			return nil
		})
	}

	for _, schemaPath := range schemaPaths {
		log.Info().Str("site", site.Name).Str("path", schemaPath).Msg("found schema.json, ingesting tables")
		data, err := os.ReadFile(schemaPath)
		if err == nil {
			var schema domain.FileSchema
			if err := json.Unmarshal(data, &schema); err == nil {
				// Use the site name as the schema name if not provided
				if schema.Name == "" {
					schema.Name = site.Name
				}
				if err := r.SaveFullSchema(schema); err != nil {
					log.Error().Err(err).Str("site", site.Name).Msg("failed to ingest site schema tables")
				}
			}
		}
	}

	return nil
}

func (r *SQLiteRepository) GetFileArchives() ([]domain.FileArchive, error) {
	rows, err := r.db.Query("SELECT id, name, file_name, file_path, type, description, hash, status, created_at, updated_at FROM mnt_file_archive ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []domain.FileArchive
	for rows.Next() {
		var a domain.FileArchive
		var fileName, path, desc sql.NullString
		if err := rows.Scan(&a.ID, &a.Name, &fileName, &path, &a.Type, &desc, &a.Hash, &a.Status, &a.CreatedAt, &a.UpdatedAt); err != nil {
			return nil, err
		}
		a.FileName = fileName.String
		a.Path = path.String
		a.Description = desc.String
		results = append(results, a)
	}
	return results, nil
}

func (r *SQLiteRepository) SaveFileArchive(archive domain.FileArchive) error {
	_, err := r.db.Exec(`INSERT INTO mnt_file_archive (name, file_name, file_path, type, description, hash, status) 
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		archive.Name, archive.FileName, archive.Path, archive.Type, archive.Description, archive.Hash, archive.Status)
	return err
}

func (r *SQLiteRepository) DeleteFileArchive(id int) error {
	_, err := r.db.Exec("DELETE FROM mnt_file_archive WHERE id = ?", id)
	return err
}

func (r *SQLiteRepository) GetTableData(tableName string, limit, offset int) (domain.TableData, error) {
	// Basic SQL injection prevention for table name
	if strings.ContainsAny(tableName, " ;'\"--") {
		return domain.TableData{}, fmt.Errorf("invalid table name")
	}

	query := fmt.Sprintf("SELECT * FROM %s LIMIT ? OFFSET ?", tableName)
	rows, err := r.db.Query(query, limit, offset)
	if err != nil {
		return domain.TableData{}, err
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		return domain.TableData{}, err
	}

	result := domain.TableData{
		Columns: cols,
		Rows:    []map[string]any{},
	}

	for rows.Next() {
		columns := make([]any, len(cols))
		columnPointers := make([]any, len(cols))
		for i := range columns {
			columnPointers[i] = &columns[i]
		}

		if err := rows.Scan(columnPointers...); err != nil {
			return domain.TableData{}, err
		}

		m := make(map[string]any)
		for i, colName := range cols {
			val := columns[i]
			b, ok := val.([]byte)
			if ok {
				m[colName] = string(b)
			} else {
				m[colName] = val
			}
		}
		result.Rows = append(result.Rows, m)
	}

	return result, nil
}

func (r *SQLiteRepository) GetTableCount(tableName string) (int64, error) {
	if strings.ContainsAny(tableName, " ;'\"--") {
		return 0, fmt.Errorf("invalid table name")
	}
	var count int64
	err := r.db.QueryRow(fmt.Sprintf("SELECT COUNT(*) FROM %s", tableName)).Scan(&count)
	return count, err
}

func (r *SQLiteRepository) SaveOrgStructure(payload interface{}) error {
	log.Info().Msg("Saving organizational structure to database")

	// 1. Save as raw JSON for easy retrieval of the whole tree
	if err := r.saveConfig("organization", payload); err != nil {
		log.Error().Err(err).Msg("Failed to save org structure JSON to config")
		return err
	}

	data, ok := payload.(map[string]interface{})
	if !ok {
		log.Warn().Msg("payload is not a map, skipping table sync")
		return nil
	}

	// 2. Sync with specific org tables (from migration 00009)
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Clear existing data (caution: sync strategy)
	tables := []string{"org_edges", "org_notes", "org_people", "org_positions", "org_units"}
	for _, t := range tables {
		_, _ = tx.Exec(fmt.Sprintf("DELETE FROM %s", t))
	}

	elements, ok := data["elements"].(map[string]interface{})
	if !ok {
		log.Warn().Msg("no elements found in payload, skipping table sync")
		return nil
	}

	// Process Nodes
	if nodes, ok := elements["nodes"].([]interface{}); ok {
		for _, n := range nodes {
			node, ok := n.(map[string]interface{})
			if !ok {
				continue
			}
			nodeData, ok := node["data"].(map[string]interface{})
			if !ok {
				continue
			}

			id, _ := nodeData["id"].(string)
			nodeType, _ := nodeData["type"].(string)
			if id == "" || nodeType == "" {
				continue
			}

			switch nodeType {
			case "org_unit":
				name, _ := nodeData["name"].(string)
				unitType, _ := nodeData["unitType"].(string)
				description, _ := nodeData["description"].(string)
				_, err = tx.Exec("INSERT INTO org_units (id, name, unit_type, description) VALUES (?, ?, ?, ?)", id, name, unitType, description)
			case "position":
				title, _ := nodeData["title"].(string)
				level, _ := nodeData["level"].(string)
				vacancyStatus, _ := nodeData["vacancyStatus"].(string)
				costCenter, _ := nodeData["costCenter"].(string)
				_, err = tx.Exec("INSERT INTO org_positions (id, title, level, vacancy_status, cost_center) VALUES (?, ?, ?, ?, ?)", id, title, level, vacancyStatus, costCenter)
			case "person":
				displayName, _ := nodeData["displayName"].(string)
				givenName, _ := nodeData["givenName"].(string)
				familyName, _ := nodeData["familyName"].(string)
				email, _ := nodeData["email"].(string)
				employeeId, _ := nodeData["employeeId"].(string)
				employmentType, _ := nodeData["employmentType"].(string)
				jobTitle, _ := nodeData["jobTitle"].(string)
				location, _ := nodeData["location"].(string)
				timezone, _ := nodeData["timezone"].(string)
				startDate, _ := nodeData["startDate"].(string)
				_, err = tx.Exec("INSERT INTO org_people (id, display_name, given_name, family_name, email, employee_id, employment_type, job_title, location, timezone, start_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", id, displayName, givenName, familyName, email, employeeId, employmentType, jobTitle, location, timezone, startDate)
			case "note":
				text, _ := nodeData["text"].(string)
				_, err = tx.Exec("INSERT INTO org_notes (id, text) VALUES (?, ?)", id, text)
			}
			if err != nil {
				log.Error().Err(err).Msgf("Failed to insert node %s into database", id)
			}
		}
	}

	// Process Edges
	if edges, ok := elements["edges"].([]interface{}); ok {
		for _, e := range edges {
			edge, ok := e.(map[string]interface{})
			if !ok {
				continue
			}
			edgeData, ok := edge["data"].(map[string]interface{})
			if !ok {
				continue
			}

			id, _ := edgeData["id"].(string)
			edgeType, _ := edgeData["type"].(string)
			source, _ := edgeData["source"].(string)
			target, _ := edgeData["target"].(string)
			label, _ := edgeData["label"].(string)
			notes, _ := edgeData["notes"].(string)

			if source != "" && target != "" {
				_, err = tx.Exec("INSERT INTO org_edges (id, type, source, target, label, notes) VALUES (?, ?, ?, ?, ?, ?)",
					id, edgeType, source, target, label, notes)
				if err != nil {
					log.Error().Err(err).Msgf("Failed to insert edge %s into database", id)
				}
			}
		}
	}

	return tx.Commit()
}

func (r *SQLiteRepository) SaveDFDStructure(payload interface{}) error {
	log.Info().Msg("Saving DFD structure to database")

	// 1. Save as raw JSON for easy retrieval of the whole tree
	if err := r.saveConfig("dfd_structure", payload); err != nil {
		log.Error().Err(err).Msg("Failed to save DFD structure JSON to config")
		return err
	}

	data, ok := payload.(map[string]interface{})
	if !ok {
		log.Warn().Msg("payload is not a map, skipping table sync")
		return nil
	}

	// 2. Sync with specialized dfd tables (migration 00011)
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Clear existing data
	tables := []string{"dfd_edges", "dfd_boundaries", "dfd_data_stores", "dfd_external_entities", "dfd_processes"}
	for _, t := range tables {
		_, _ = tx.Exec(fmt.Sprintf("DELETE FROM %s", t))
	}

	elements, ok := data["elements"].(map[string]interface{})
	if !ok {
		log.Warn().Msg("no elements found in payload, skipping table sync")
		return nil
	}

	// Nodes: process, external_entity, data_store, boundary
	if nodes, ok := elements["nodes"].([]interface{}); ok {
		for _, n := range nodes {
			node, ok := n.(map[string]interface{})
			if !ok {
				continue
			}
			nodeData, ok := node["data"].(map[string]interface{})
			if !ok {
				continue
			}

			id, _ := nodeData["id"].(string)
			nodeType, _ := nodeData["type"].(string)
			if id == "" || nodeType == "" {
				continue
			}
			parent, _ := nodeData["parent"].(string)

			switch nodeType {
			case "process":
				name, _ := nodeData["name"].(string)
				pType, _ := nodeData["processType"].(string)
				desc, _ := nodeData["description"].(string)
				_, err = tx.Exec("INSERT INTO dfd_processes (id, name, process_type, description, parent) VALUES (?, ?, ?, ?, ?)", id, name, pType, desc, parent)
			case "external_entity":
				name, _ := nodeData["name"].(string)
				desc, _ := nodeData["description"].(string)
				_, err = tx.Exec("INSERT INTO dfd_external_entities (id, name, description, parent) VALUES (?, ?, ?, ?)", id, name, desc, parent)
			case "data_store":
				name, _ := nodeData["name"].(string)
				desc, _ := nodeData["description"].(string)
				_, err = tx.Exec("INSERT INTO dfd_data_stores (id, name, description, parent) VALUES (?, ?, ?, ?)", id, name, desc, parent)
			case "boundary":
				name, _ := nodeData["name"].(string)
				bType, _ := nodeData["boundaryType"].(string)
				_, err = tx.Exec("INSERT INTO dfd_boundaries (id, name, boundary_type, parent) VALUES (?, ?, ?, ?)", id, name, bType, parent)
			}
			if err != nil {
				log.Error().Err(err).Msgf("Failed to insert node %s into database", id)
			}
		}
	}

	// Edges: data_flow
	if edges, ok := elements["edges"].([]interface{}); ok {
		for _, e := range edges {
			edge, ok := e.(map[string]interface{})
			if !ok {
				continue
			}
			edgeData, ok := edge["data"].(map[string]interface{})
			if !ok {
				continue
			}

			id, _ := edgeData["id"].(string)
			source, _ := edgeData["source"].(string)
			target, _ := edgeData["target"].(string)
			eType, _ := edgeData["type"].(string)
			label, _ := edgeData["label"].(string)
			classification, _ := edgeData["classification"].(string)
			protocol, _ := edgeData["protocol"].(string)
			frequency, _ := edgeData["frequency"].(string)

			dataElementsRaw := ""
			if de, ok := edgeData["dataElements"].([]interface{}); ok {
				deBytes, _ := json.Marshal(de)
				dataElementsRaw = string(deBytes)
			}

			if source != "" && target != "" {
				_, err = tx.Exec("INSERT INTO dfd_edges (id, type, source, target, label, data_elements, classification, protocol, frequency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", id, eType, source, target, label, dataElementsRaw, classification, protocol, frequency)
				if err != nil {
					log.Error().Err(err).Msgf("Failed to insert edge %s into database", id)
				}
			}
		}
	}

	return tx.Commit()
}
func (r *SQLiteRepository) GetOrgStructure() (interface{}, error) {
	return r.getConfig("organization")
}

func (r *SQLiteRepository) GetDFDStructure() (interface{}, error) {
	return r.getConfig("dfd_structure")
}
