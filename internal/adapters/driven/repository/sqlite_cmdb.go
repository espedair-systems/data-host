package repository

import (
	"data-host/internal/core/domain"
	"database/sql"
	"fmt"
)

// GetCMDBSnapshots retrieves all CMDB snapshots from the database, ordered by creation date descending.
func (r *SQLiteRepository) GetCMDBSnapshots() ([]domain.CMDBSnapshot, error) {
	rows, err := r.db.Query("SELECT cmdb_snapshot_row_id, snapshot_name, snapshot_version, schema_ref, description, source, generated_at_utc, created_at_utc FROM CMDB_SNAPSHOT ORDER BY created_at_utc DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []domain.CMDBSnapshot
	for rows.Next() {
		var s domain.CMDBSnapshot
		var schemaRef, desc, source, generatedAt sql.NullString
		if err := rows.Scan(&s.ID, &s.SnapshotName, &s.SnapshotVersion, &schemaRef, &desc, &source, &generatedAt, &s.CreatedAt); err != nil {
			return nil, err
		}
		s.SchemaRef = schemaRef.String
		s.Description = desc.String
		s.Source = source.String
		s.GeneratedAt = generatedAt.String
		results = append(results, s)
	}
	return results, nil
}

// GetCMDBSnapshotByID retrieves a single CMDB snapshot and its summary stats by its database row ID.
func (r *SQLiteRepository) GetCMDBSnapshotByID(id int64) (*domain.CMDBSnapshot, error) {
	var s domain.CMDBSnapshot
	var schemaRef, desc, source, generatedAt sql.NullString
	err := r.db.QueryRow("SELECT cmdb_snapshot_row_id, snapshot_name, snapshot_version, schema_ref, description, source, generated_at_utc, created_at_utc FROM CMDB_SNAPSHOT WHERE cmdb_snapshot_row_id = ?", id).
		Scan(&s.ID, &s.SnapshotName, &s.SnapshotVersion, &schemaRef, &desc, &source, &generatedAt, &s.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	s.SchemaRef = schemaRef.String
	s.Description = desc.String
	s.Source = source.String
	s.GeneratedAt = generatedAt.String

	// Fetch Stats
	s.Stats, _ = r.GetCMDBStats(id)

	return &s, nil
}

// GetCMDBOwners retrieves all owners associated with a specific snapshot ID.
func (r *SQLiteRepository) GetCMDBOwners(snapshotID int64) ([]domain.CMDBOwner, error) {
	rows, err := r.db.Query("SELECT cmdb_owner_row_id, cmdb_snapshot_row_id, owner_id, owner_name, owner_type, email, owner_group, status, description, created_at_utc, updated_at_utc FROM CMDB_OWNER WHERE cmdb_snapshot_row_id = ?", snapshotID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []domain.CMDBOwner
	for rows.Next() {
		var o domain.CMDBOwner
		var email, group, desc, updatedAt sql.NullString
		if err := rows.Scan(&o.ID, &o.SnapshotID, &o.OwnerID, &o.Name, &o.OwnerType, &email, &group, &o.Status, &desc, &o.CreatedAt, &updatedAt); err != nil {
			return nil, err
		}
		o.Email = email.String
		o.Group = group.String
		o.Description = desc.String
		if updatedAt.Valid {
			s := updatedAt.String
			o.UpdatedAt = &s
		}
		results = append(results, o)
	}
	return results, nil
}

// GetCMDBSystems retrieves all infrastructure systems and their tags for a specific snapshot ID.
func (r *SQLiteRepository) GetCMDBSystems(snapshotID int64) ([]domain.CMDBSystem, error) {
	rows, err := r.db.Query("SELECT cmdb_system_row_id, cmdb_snapshot_row_id, system_id, parent_system_id, system_name, owner_id, system_layer, criticality, environment, lifecycle_stage, status, hosting_platform, interface_type, description, created_at_utc, updated_at_utc FROM CMDB_SYSTEM WHERE cmdb_snapshot_row_id = ?", snapshotID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []domain.CMDBSystem
	for rows.Next() {
		var s domain.CMDBSystem
		var parentID, criticality, lifecycle, platform, iface, desc, updatedAt sql.NullString
		if err := rows.Scan(&s.ID, &s.SnapshotID, &s.SystemID, &parentID, &s.SystemName, &s.OwnerID, &s.SystemLayer, &criticality, &s.Environment, &lifecycle, &s.Status, &platform, &iface, &desc, &s.CreatedAt, &updatedAt); err != nil {
			return nil, err
		}
		s.ParentSystemID = parentID.String
		s.Criticality = criticality.String
		s.LifecycleStage = lifecycle.String
		s.HostingPlatform = platform.String
		s.InterfaceType = iface.String
		s.Description = desc.String
		if updatedAt.Valid {
			ts := updatedAt.String
			s.UpdatedAt = &ts
		}

		// Fetch Tags
		trows, _ := r.db.Query("SELECT tag FROM CMDB_SYSTEM_TAG WHERE cmdb_system_row_id = ? ORDER BY ordinal_position", s.ID)
		for trows != nil && trows.Next() {
			var tag string
			trows.Scan(&tag)
			s.Tags = append(s.Tags, tag)
		}
		if trows != nil {
			trows.Close()
		}

		results = append(results, s)
	}
	return results, nil
}

// GetCMDBDatabases retrieves all databases and their tags for a specific snapshot ID.
func (r *SQLiteRepository) GetCMDBDatabases(snapshotID int64) ([]domain.CMDBDatabase, error) {
	rows, err := r.db.Query("SELECT cmdb_database_row_id, cmdb_snapshot_row_id, database_id, database_name, system_id, owner_id, engine, engine_version, environment, classification, lifecycle_stage, status, backup_policy, rpo, rto, description, created_at_utc, updated_at_utc FROM CMDB_DATABASE WHERE cmdb_snapshot_row_id = ?", snapshotID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []domain.CMDBDatabase
	for rows.Next() {
		var d domain.CMDBDatabase
		var version, class, lifecycle, backup, rpo, rto, desc, updatedAt sql.NullString
		if err := rows.Scan(&d.ID, &d.SnapshotID, &d.DatabaseID, &d.DatabaseName, &d.SystemID, &d.OwnerID, &d.Engine, &version, &d.Environment, &class, &lifecycle, &d.Status, &backup, &rpo, &rto, &desc, &d.CreatedAt, &updatedAt); err != nil {
			return nil, err
		}
		d.EngineVersion = version.String
		d.Classification = class.String
		d.LifecycleStage = lifecycle.String
		d.BackupPolicy = backup.String
		d.RPO = rpo.String
		d.RTO = rto.String
		d.Description = desc.String
		if updatedAt.Valid {
			s := updatedAt.String
			d.UpdatedAt = &s
		}

		// Fetch Tags
		trows, _ := r.db.Query("SELECT tag FROM CMDB_DATABASE_TAG WHERE cmdb_database_row_id = ? ORDER BY ordinal_position", d.ID)
		for trows != nil && trows.Next() {
			var tag string
			trows.Scan(&tag)
			d.Tags = append(d.Tags, tag)
		}
		if trows != nil {
			trows.Close()
		}

		results = append(results, d)
	}
	return results, nil
}

// GetCMDBRelationships retrieves all entity relationships and their tags for a specific snapshot ID.
func (r *SQLiteRepository) GetCMDBRelationships(snapshotID int64) ([]domain.CMDBRelationship, error) {
	rows, err := r.db.Query("SELECT cmdb_relationship_row_id, cmdb_snapshot_row_id, relationship_id, source_type, source_id, relationship_type, target_type, target_id, direction, criticality, status, description, created_at_utc, updated_at_utc FROM CMDB_RELATIONSHIP WHERE cmdb_snapshot_row_id = ?", snapshotID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []domain.CMDBRelationship
	for rows.Next() {
		var rel domain.CMDBRelationship
		var direction, criticality, desc, updatedAt sql.NullString
		if err := rows.Scan(&rel.ID, &rel.SnapshotID, &rel.RelationshipID, &rel.SourceType, &rel.SourceID, &rel.RelationshipType, &rel.TargetType, &rel.TargetID, &direction, &criticality, &rel.Status, &desc, &rel.CreatedAt, &updatedAt); err != nil {
			return nil, err
		}
		rel.Direction = direction.String
		rel.Criticality = criticality.String
		rel.Description = desc.String
		if updatedAt.Valid {
			s := updatedAt.String
			rel.UpdatedAt = &s
		}

		// Fetch Tags
		trows, _ := r.db.Query("SELECT tag FROM CMDB_RELATIONSHIP_TAG WHERE cmdb_relationship_row_id = ? ORDER BY ordinal_position", rel.ID)
		for trows != nil && trows.Next() {
			var tag string
			trows.Scan(&tag)
			rel.Tags = append(rel.Tags, tag)
		}
		if trows != nil {
			trows.Close()
		}

		results = append(results, rel)
	}
	return results, nil
}

// GetCMDBStats retrieves summary statistics for a specific snapshot ID.
func (r *SQLiteRepository) GetCMDBStats(snapshotID int64) (*domain.CMDBStats, error) {
	var s domain.CMDBStats
	var updatedAt sql.NullString
	err := r.db.QueryRow("SELECT cmdb_stats_row_id, cmdb_snapshot_row_id, owner_count, system_count, database_count, active_system_count, active_database_count, relationship_count, created_at_utc, updated_at_utc FROM CMDB_STATS WHERE cmdb_snapshot_row_id = ?", snapshotID).
		Scan(&s.ID, &s.SnapshotID, &s.OwnerCount, &s.SystemCount, &s.DatabaseCount, &s.ActiveSystemCount, &s.ActiveDatabaseCount, &s.RelationshipCount, &s.CreatedAt, &updatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if updatedAt.Valid {
		ts := updatedAt.String
		s.UpdatedAt = &ts
	}
	return &s, nil
}

// SaveCMDBSnapshot persists a full CMDB snapshot to the database, including owners, systems, databases, and relationships.
// It uses a transaction to ensure atomicity and replaces existing data if the snapshot name and version already exist.
func (r *SQLiteRepository) SaveCMDBSnapshot(snapshot *domain.CMDBSnapshot) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Insert or update Snapshot
	var snapshotID int64
	err = tx.QueryRow("SELECT cmdb_snapshot_row_id FROM CMDB_SNAPSHOT WHERE snapshot_name = ? AND snapshot_version = ?", snapshot.SnapshotName, snapshot.SnapshotVersion).Scan(&snapshotID)
	if err == sql.ErrNoRows {
		res, err := tx.Exec(`INSERT INTO CMDB_SNAPSHOT (snapshot_name, snapshot_version, schema_ref, description, source, generated_at_utc) VALUES (?, ?, ?, ?, ?, ?)`,
			snapshot.SnapshotName, snapshot.SnapshotVersion, snapshot.SchemaRef, snapshot.Description, snapshot.Source, snapshot.GeneratedAt)
		if err != nil {
			return err
		}
		snapshotID, _ = res.LastInsertId()
	} else if err != nil {
		return err
	} else {
		_, err = tx.Exec(`UPDATE CMDB_SNAPSHOT SET schema_ref = ?, description = ?, source = ?, generated_at_utc = ? WHERE cmdb_snapshot_row_id = ?`,
			snapshot.SchemaRef, snapshot.Description, snapshot.Source, snapshot.GeneratedAt, snapshotID)
		if err != nil {
			return err
		}
		// Clear existing data (simple replacement strategy)
		_, _ = tx.Exec("DELETE FROM CMDB_STATS WHERE cmdb_snapshot_row_id = ?", snapshotID)
		_, _ = tx.Exec("DELETE FROM CMDB_RELATIONSHIP WHERE cmdb_snapshot_row_id = ?", snapshotID)
		_, _ = tx.Exec("DELETE FROM CMDB_DATABASE WHERE cmdb_snapshot_row_id = ?", snapshotID)
		_, _ = tx.Exec("DELETE FROM CMDB_SYSTEM WHERE cmdb_snapshot_row_id = ?", snapshotID)
		_, _ = tx.Exec("DELETE FROM CMDB_OWNER WHERE cmdb_snapshot_row_id = ?", snapshotID)
	}

	// 2. Insert Owners
	for _, o := range snapshot.Owners {
		_, err = tx.Exec(`INSERT INTO CMDB_OWNER (cmdb_snapshot_row_id, owner_id, owner_name, owner_type, email, owner_group, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			snapshotID, o.OwnerID, o.Name, o.OwnerType, o.Email, o.Group, o.Status, o.Description)
		if err != nil {
			return fmt.Errorf("failed to insert owner %s: %w", o.OwnerID, err)
		}
	}

	// 3. Insert Systems
	for _, s := range snapshot.Systems {
		res, err := tx.Exec(`INSERT INTO CMDB_SYSTEM (cmdb_snapshot_row_id, system_id, parent_system_id, system_name, owner_id, system_layer, criticality, environment, lifecycle_stage, status, hosting_platform, interface_type, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			snapshotID, s.SystemID, sql.NullString{String: s.ParentSystemID, Valid: s.ParentSystemID != ""}, s.SystemName, s.OwnerID, s.SystemLayer, sql.NullString{String: s.Criticality, Valid: s.Criticality != ""}, s.Environment, sql.NullString{String: s.LifecycleStage, Valid: s.LifecycleStage != ""}, s.Status, sql.NullString{String: s.HostingPlatform, Valid: s.HostingPlatform != ""}, sql.NullString{String: s.InterfaceType, Valid: s.InterfaceType != ""}, s.Description)
		if err != nil {
			return fmt.Errorf("failed to insert system %s: %w", s.SystemID, err)
		}
		systemRowID, _ := res.LastInsertId()
		for i, tag := range s.Tags {
			_, err = tx.Exec(`INSERT INTO CMDB_SYSTEM_TAG (cmdb_system_row_id, tag, ordinal_position) VALUES (?, ?, ?)`, systemRowID, tag, i+1)
			if err != nil {
				return err
			}
		}
	}

	// 4. Insert Databases
	for _, d := range snapshot.Databases {
		res, err := tx.Exec(`INSERT INTO CMDB_DATABASE (cmdb_snapshot_row_id, database_id, database_name, system_id, owner_id, engine, engine_version, environment, classification, lifecycle_stage, status, backup_policy, rpo, rto, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			snapshotID, d.DatabaseID, d.DatabaseName, d.SystemID, d.OwnerID, d.Engine, sql.NullString{String: d.EngineVersion, Valid: d.EngineVersion != ""}, d.Environment, sql.NullString{String: d.Classification, Valid: d.Classification != ""}, sql.NullString{String: d.LifecycleStage, Valid: d.LifecycleStage != ""}, d.Status, sql.NullString{String: d.BackupPolicy, Valid: d.BackupPolicy != ""}, sql.NullString{String: d.RPO, Valid: d.RPO != ""}, sql.NullString{String: d.RTO, Valid: d.RTO != ""}, d.Description)
		if err != nil {
			return fmt.Errorf("failed to insert database %s: %w", d.DatabaseID, err)
		}
		dbRowID, _ := res.LastInsertId()
		for i, tag := range d.Tags {
			_, err = tx.Exec(`INSERT INTO CMDB_DATABASE_TAG (cmdb_database_row_id, tag, ordinal_position) VALUES (?, ?, ?)`, dbRowID, tag, i+1)
			if err != nil {
				return err
			}
		}
	}

	// 5. Insert Relationships
	for _, r := range snapshot.Relationships {
		res, err := tx.Exec(`INSERT INTO CMDB_RELATIONSHIP (cmdb_snapshot_row_id, relationship_id, source_type, source_id, relationship_type, target_type, target_id, direction, criticality, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			snapshotID, r.RelationshipID, r.SourceType, r.SourceID, r.RelationshipType, r.TargetType, r.TargetID, sql.NullString{String: r.Direction, Valid: r.Direction != ""}, sql.NullString{String: r.Criticality, Valid: r.Criticality != ""}, r.Status, r.Description)
		if err != nil {
			return fmt.Errorf("failed to insert relationship %s: %w", r.RelationshipID, err)
		}
		relRowID, _ := res.LastInsertId()
		for i, tag := range r.Tags {
			_, err = tx.Exec(`INSERT INTO CMDB_RELATIONSHIP_TAG (cmdb_relationship_row_id, tag, ordinal_position) VALUES (?, ?, ?)`, relRowID, tag, i+1)
			if err != nil {
				return err
			}
		}
	}

	// 6. Insert Stats
	if snapshot.Stats != nil {
		_, err = tx.Exec(`INSERT INTO CMDB_STATS (cmdb_snapshot_row_id, owner_count, system_count, database_count, active_system_count, active_database_count, relationship_count) VALUES (?, ?, ?, ?, ?, ?, ?)`,
			snapshotID, snapshot.Stats.OwnerCount, snapshot.Stats.SystemCount, snapshot.Stats.DatabaseCount, snapshot.Stats.ActiveSystemCount, snapshot.Stats.ActiveDatabaseCount, snapshot.Stats.RelationshipCount)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// DeleteCMDBSnapshot removes a CMDB snapshot and all associated records from the database.
func (r *SQLiteRepository) DeleteCMDBSnapshot(id int64) error {
	_, err := r.db.Exec("DELETE FROM CMDB_SNAPSHOT WHERE cmdb_snapshot_row_id = ?", id)
	return err
}
