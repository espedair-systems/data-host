package domain

// CMDBSnapshot represents a complete point-in-time view of the infrastructure inventory,
// including owners, systems, databases, and their relationships.
type CMDBSnapshot struct {
	ID              int64              `json:"id"`
	SnapshotName    string             `json:"name"`
	SnapshotVersion string             `json:"version"`
	SchemaRef       string             `json:"$schema,omitempty"`
	Description     string             `json:"description,omitempty"`
	Source          string             `json:"source,omitempty"`
	GeneratedAt     string             `json:"generated_at_utc,omitempty"`
	CreatedAt       string             `json:"created_at_utc"`
	Owners          []CMDBOwner        `json:"owners,omitempty"`
	Systems         []CMDBSystem       `json:"systems,omitempty"`
	Databases       []CMDBDatabase     `json:"databases,omitempty"`
	Relationships   []CMDBRelationship `json:"relationships,omitempty"`
	Stats           *CMDBStats         `json:"stats,omitempty"`
}

// CMDBOwner defines an individual or team responsible for one or more infrastructure components.
type CMDBOwner struct {
	ID          int64   `json:"id"`
	SnapshotID  int64   `json:"snapshot_id"`
	OwnerID     string  `json:"owner_id"`
	Name        string  `json:"name"`
	OwnerType   string  `json:"owner_type"`
	Email       string  `json:"email,omitempty"`
	Group       string  `json:"group,omitempty"`
	Status      string  `json:"status"`
	Description string  `json:"description,omitempty"`
	CreatedAt   string  `json:"created_at_utc"`
	UpdatedAt   *string `json:"updated_at_utc,omitempty"`
}

// CMDBSystem represents a high-level application, service, or logical grouping of infrastructure.
type CMDBSystem struct {
	ID              int64    `json:"id"`
	SnapshotID      int64    `json:"snapshot_id"`
	SystemID        string   `json:"system_id"`
	ParentSystemID  string   `json:"parent_system_id,omitempty"`
	SystemName      string   `json:"system_name"`
	OwnerID         string   `json:"owner_id"`
	SystemLayer     string   `json:"system_layer"`
	Criticality     string   `json:"criticality,omitempty"`
	Environment     string   `json:"environment"`
	LifecycleStage  string   `json:"lifecycle_stage,omitempty"`
	Status          string   `json:"status"`
	HostingPlatform string   `json:"hosting_platform,omitempty"`
	InterfaceType   string   `json:"interface_type,omitempty"`
	Description     string   `json:"description,omitempty"`
	Tags            []string `json:"tags,omitempty"`
	CreatedAt       string   `json:"created_at_utc"`
	UpdatedAt       *string  `json:"updated_at_utc,omitempty"`
}

// CMDBDatabase represents a database instance or schema associated with a system.
type CMDBDatabase struct {
	ID              int64    `json:"id"`
	SnapshotID      int64    `json:"snapshot_id"`
	DatabaseID      string   `json:"database_id"`
	DatabaseName    string   `json:"database_name"`
	SystemID        string   `json:"system_id"`
	OwnerID         string   `json:"owner_id"`
	Engine          string   `json:"engine"`
	EngineVersion   string   `json:"engine_version,omitempty"`
	Environment     string   `json:"environment"`
	Classification  string   `json:"classification,omitempty"`
	LifecycleStage  string   `json:"lifecycle_stage,omitempty"`
	Status          string   `json:"status"`
	BackupPolicy    string   `json:"backup_policy,omitempty"`
	RPO             string   `json:"rpo,omitempty"`
	RTO             string   `json:"rto,omitempty"`
	Description     string   `json:"description,omitempty"`
	Tags            []string `json:"tags,omitempty"`
	CreatedAt       string   `json:"created_at_utc"`
	UpdatedAt       *string  `json:"updated_at_utc,omitempty"`
}

// CMDBRelationship defines a dependency or link between two CMDB entities.
type CMDBRelationship struct {
	ID               int64    `json:"id"`
	SnapshotID       int64    `json:"snapshot_id"`
	RelationshipID   string   `json:"relationship_id"`
	SourceType       string   `json:"source_type"`
	SourceID         string   `json:"source_id"`
	RelationshipType string   `json:"relationship_type"`
	TargetType       string   `json:"target_type"`
	TargetID         string   `json:"target_id"`
	Direction        string   `json:"direction,omitempty"`
	Criticality      string   `json:"criticality,omitempty"`
	Status           string   `json:"status"`
	Description      string   `json:"description,omitempty"`
	Tags             []string `json:"tags,omitempty"`
	CreatedAt        string   `json:"created_at_utc"`
	UpdatedAt        *string  `json:"updated_at_utc,omitempty"`
}

// CMDBStats provides summary counts for a specific CMDB snapshot.
type CMDBStats struct {
	ID                  int64   `json:"id"`
	SnapshotID          int64   `json:"snapshot_id"`
	OwnerCount          int     `json:"owner_count"`
	SystemCount         int     `json:"system_count"`
	DatabaseCount       int     `json:"database_count"`
	ActiveSystemCount   int     `json:"active_system_count"`
	ActiveDatabaseCount int     `json:"active_database_count"`
	RelationshipCount   int     `json:"relationship_count"`
	CreatedAt           string  `json:"created_at_utc"`
	UpdatedAt           *string `json:"updated_at_utc,omitempty"`
}

