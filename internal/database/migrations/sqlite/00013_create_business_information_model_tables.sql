-- +goose Up
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS BIM_MODEL (
    bim_model_id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name TEXT NOT NULL,
    description TEXT,
    source TEXT,
    generated_at_utc DATETIME,
    total_entities INTEGER,
    data_domains INTEGER,
    data_concepts INTEGER,
    duplicates_removed INTEGER,
    created_at_utc DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc DATETIME,
    CONSTRAINT uq_bim_model_name UNIQUE (model_name)
);

CREATE TABLE IF NOT EXISTS BIM_ENTITY (
    bim_entity_id INTEGER PRIMARY KEY AUTOINCREMENT,
    bim_model_id INTEGER NOT NULL,
    entity_name TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    description TEXT,
    information_confidentiality_classification TEXT,
    created_at_utc DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc DATETIME,
    CONSTRAINT fk_bim_entity_model
        FOREIGN KEY (bim_model_id)
        REFERENCES BIM_MODEL (bim_model_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_bim_entity_model_name_type UNIQUE (bim_model_id, entity_name, asset_type)
);

CREATE TABLE IF NOT EXISTS BIM_ENTITY_ROLE (
    bim_entity_role_id INTEGER PRIMARY KEY AUTOINCREMENT,
    bim_entity_id INTEGER NOT NULL,
    data_owner_user_name TEXT,
    data_owner_first_name TEXT,
    data_owner_last_name TEXT,
    data_owner_group_name TEXT,
    business_steward_user_name TEXT,
    business_steward_first_name TEXT,
    business_steward_last_name TEXT,
    business_steward_group_name TEXT,
    data_custodian_user_name TEXT,
    data_custodian_first_name TEXT,
    data_custodian_last_name TEXT,
    data_custodian_group_name TEXT,
    data_steward_user_name TEXT,
    data_steward_first_name TEXT,
    data_steward_last_name TEXT,
    data_steward_group_name TEXT,
    created_at_utc DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc DATETIME,
    CONSTRAINT fk_bim_entity_role_entity
        FOREIGN KEY (bim_entity_id)
        REFERENCES BIM_ENTITY (bim_entity_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_bim_entity_role_entity UNIQUE (bim_entity_id)
);

CREATE TABLE IF NOT EXISTS BIM_ENTITY_RELATIONSHIP (
    bim_entity_relationship_id INTEGER PRIMARY KEY AUTOINCREMENT,
    bim_entity_id INTEGER NOT NULL,
    data_concept_groups_data_concept_name TEXT,
    data_concept_is_grouped_by_data_concept_name TEXT,
    data_concept_is_grouped_by_data_domain_name TEXT,
    data_domain_groups_data_concept_name TEXT,
    created_at_utc DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT fk_bim_entity_relationship_entity
        FOREIGN KEY (bim_entity_id)
        REFERENCES BIM_ENTITY (bim_entity_id)
        ON DELETE CASCADE,
    CONSTRAINT chk_bim_entity_relationship_non_empty
        CHECK (
            LENGTH(TRIM(COALESCE(data_concept_groups_data_concept_name, ''))) > 0
            OR LENGTH(TRIM(COALESCE(data_concept_is_grouped_by_data_concept_name, ''))) > 0
            OR LENGTH(TRIM(COALESCE(data_concept_is_grouped_by_data_domain_name, ''))) > 0
            OR LENGTH(TRIM(COALESCE(data_domain_groups_data_concept_name, ''))) > 0
        )
);

CREATE INDEX IF NOT EXISTS idx_bim_entity_model_id
    ON BIM_ENTITY (bim_model_id);

CREATE INDEX IF NOT EXISTS idx_bim_entity_name
    ON BIM_ENTITY (entity_name);

CREATE INDEX IF NOT EXISTS idx_bim_entity_asset_type
    ON BIM_ENTITY (asset_type);

CREATE INDEX IF NOT EXISTS idx_bim_entity_confidentiality
    ON BIM_ENTITY (information_confidentiality_classification);

CREATE INDEX IF NOT EXISTS idx_bim_entity_role_entity_id
    ON BIM_ENTITY_ROLE (bim_entity_id);

CREATE INDEX IF NOT EXISTS idx_bim_entity_relationship_entity_id
    ON BIM_ENTITY_RELATIONSHIP (bim_entity_id);

CREATE INDEX IF NOT EXISTS idx_bim_rel_groups_concept
    ON BIM_ENTITY_RELATIONSHIP (data_concept_groups_data_concept_name);

CREATE INDEX IF NOT EXISTS idx_bim_rel_is_grouped_by_concept
    ON BIM_ENTITY_RELATIONSHIP (data_concept_is_grouped_by_data_concept_name);

CREATE INDEX IF NOT EXISTS idx_bim_rel_is_grouped_by_domain
    ON BIM_ENTITY_RELATIONSHIP (data_concept_is_grouped_by_data_domain_name);

CREATE INDEX IF NOT EXISTS idx_bim_rel_domain_groups_concept
    ON BIM_ENTITY_RELATIONSHIP (data_domain_groups_data_concept_name);

-- +goose Down
DROP INDEX IF EXISTS idx_bim_rel_domain_groups_concept;
DROP INDEX IF EXISTS idx_bim_rel_is_grouped_by_domain;
DROP INDEX IF EXISTS idx_bim_rel_is_grouped_by_concept;
DROP INDEX IF EXISTS idx_bim_rel_groups_concept;
DROP INDEX IF EXISTS idx_bim_entity_relationship_entity_id;
DROP INDEX IF EXISTS idx_bim_entity_role_entity_id;
DROP INDEX IF EXISTS idx_bim_entity_confidentiality;
DROP INDEX IF EXISTS idx_bim_entity_asset_type;
DROP INDEX IF EXISTS idx_bim_entity_name;
DROP INDEX IF EXISTS idx_bim_entity_model_id;

DROP TABLE IF EXISTS BIM_ENTITY_RELATIONSHIP;
DROP TABLE IF EXISTS BIM_ENTITY_ROLE;
DROP TABLE IF EXISTS BIM_ENTITY;
DROP TABLE IF EXISTS BIM_MODEL;
