-- +goose Up
CREATE TABLE IF NOT EXISTS CMDB_SNAPSHOT (
    cmdb_snapshot_row_id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_name TEXT NOT NULL,
    snapshot_version TEXT NOT NULL,
    schema_ref TEXT,
    description TEXT,
    source TEXT,
    generated_at_utc TEXT,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT uq_cmdb_snapshot UNIQUE (snapshot_name, snapshot_version)
);

CREATE TABLE IF NOT EXISTS CMDB_OWNER (
    cmdb_owner_row_id INTEGER PRIMARY KEY AUTOINCREMENT,
    cmdb_snapshot_row_id INTEGER NOT NULL,
    owner_id TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    owner_type TEXT NOT NULL,
    email TEXT,
    owner_group TEXT,
    status TEXT NOT NULL,
    description TEXT,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc TEXT,
    CONSTRAINT fk_cmdb_owner_snapshot
        FOREIGN KEY (cmdb_snapshot_row_id)
        REFERENCES CMDB_SNAPSHOT (cmdb_snapshot_row_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_cmdb_owner UNIQUE (cmdb_snapshot_row_id, owner_id)
);

CREATE TABLE IF NOT EXISTS CMDB_SYSTEM (
    cmdb_system_row_id INTEGER PRIMARY KEY AUTOINCREMENT,
    cmdb_snapshot_row_id INTEGER NOT NULL,
    system_id TEXT NOT NULL,
    parent_system_id TEXT,
    system_name TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    system_layer TEXT NOT NULL,
    criticality TEXT,
    environment TEXT NOT NULL,
    lifecycle_stage TEXT,
    status TEXT NOT NULL,
    hosting_platform TEXT,
    interface_type TEXT,
    description TEXT,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc TEXT,
    CONSTRAINT fk_cmdb_system_snapshot
        FOREIGN KEY (cmdb_snapshot_row_id)
        REFERENCES CMDB_SNAPSHOT (cmdb_snapshot_row_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_cmdb_system UNIQUE (cmdb_snapshot_row_id, system_id)
);

CREATE TABLE IF NOT EXISTS CMDB_SYSTEM_TAG (
    cmdb_system_row_id INTEGER NOT NULL,
    tag TEXT NOT NULL,
    ordinal_position INTEGER NOT NULL,
    PRIMARY KEY (cmdb_system_row_id, tag),
    CONSTRAINT fk_cmdb_system_tag_system
        FOREIGN KEY (cmdb_system_row_id)
        REFERENCES CMDB_SYSTEM (cmdb_system_row_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CMDB_DATABASE (
    cmdb_database_row_id INTEGER PRIMARY KEY AUTOINCREMENT,
    cmdb_snapshot_row_id INTEGER NOT NULL,
    database_id TEXT NOT NULL,
    database_name TEXT NOT NULL,
    system_id TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    engine TEXT NOT NULL,
    engine_version TEXT,
    environment TEXT NOT NULL,
    classification TEXT,
    lifecycle_stage TEXT,
    status TEXT NOT NULL,
    backup_policy TEXT,
    rpo TEXT,
    rto TEXT,
    description TEXT,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc TEXT,
    CONSTRAINT fk_cmdb_database_snapshot
        FOREIGN KEY (cmdb_snapshot_row_id)
        REFERENCES CMDB_SNAPSHOT (cmdb_snapshot_row_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_cmdb_database UNIQUE (cmdb_snapshot_row_id, database_id)
);

CREATE TABLE IF NOT EXISTS CMDB_DATABASE_TAG (
    cmdb_database_row_id INTEGER NOT NULL,
    tag TEXT NOT NULL,
    ordinal_position INTEGER NOT NULL,
    PRIMARY KEY (cmdb_database_row_id, tag),
    CONSTRAINT fk_cmdb_database_tag_database
        FOREIGN KEY (cmdb_database_row_id)
        REFERENCES CMDB_DATABASE (cmdb_database_row_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CMDB_RELATIONSHIP (
    cmdb_relationship_row_id INTEGER PRIMARY KEY AUTOINCREMENT,
    cmdb_snapshot_row_id INTEGER NOT NULL,
    relationship_id TEXT NOT NULL,
    source_type TEXT NOT NULL,
    source_id TEXT NOT NULL,
    relationship_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    direction TEXT,
    criticality TEXT,
    status TEXT NOT NULL,
    description TEXT,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc TEXT,
    CONSTRAINT fk_cmdb_relationship_snapshot
        FOREIGN KEY (cmdb_snapshot_row_id)
        REFERENCES CMDB_SNAPSHOT (cmdb_snapshot_row_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_cmdb_relationship UNIQUE (cmdb_snapshot_row_id, relationship_id)
);

CREATE TABLE IF NOT EXISTS CMDB_RELATIONSHIP_TAG (
    cmdb_relationship_row_id INTEGER NOT NULL,
    tag TEXT NOT NULL,
    ordinal_position INTEGER NOT NULL,
    PRIMARY KEY (cmdb_relationship_row_id, tag),
    CONSTRAINT fk_cmdb_relationship_tag_rel
        FOREIGN KEY (cmdb_relationship_row_id)
        REFERENCES CMDB_RELATIONSHIP (cmdb_relationship_row_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CMDB_STATS (
    cmdb_stats_row_id INTEGER PRIMARY KEY AUTOINCREMENT,
    cmdb_snapshot_row_id INTEGER NOT NULL,
    owner_count INTEGER NOT NULL,
    system_count INTEGER NOT NULL,
    database_count INTEGER NOT NULL,
    active_system_count INTEGER NOT NULL,
    active_database_count INTEGER NOT NULL,
    relationship_count INTEGER NOT NULL,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc TEXT,
    CONSTRAINT fk_cmdb_stats_snapshot
        FOREIGN KEY (cmdb_snapshot_row_id)
        REFERENCES CMDB_SNAPSHOT (cmdb_snapshot_row_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_cmdb_stats UNIQUE (cmdb_snapshot_row_id)
);

-- +goose Down
DROP TABLE IF EXISTS CMDB_STATS;
DROP TABLE IF EXISTS CMDB_RELATIONSHIP_TAG;
DROP TABLE IF EXISTS CMDB_RELATIONSHIP;
DROP TABLE IF EXISTS CMDB_DATABASE_TAG;
DROP TABLE IF EXISTS CMDB_DATABASE;
DROP TABLE IF EXISTS CMDB_SYSTEM_TAG;
DROP TABLE IF EXISTS CMDB_SYSTEM;
DROP TABLE IF EXISTS CMDB_OWNER;
DROP TABLE IF EXISTS CMDB_SNAPSHOT;
