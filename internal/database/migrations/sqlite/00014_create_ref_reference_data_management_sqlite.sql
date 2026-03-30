-- +goose Up
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS REF_PACKAGE (
    ref_package_id INTEGER PRIMARY KEY AUTOINCREMENT,
    package_name TEXT NOT NULL,
    version TEXT NOT NULL,
    description TEXT,
    domain TEXT NOT NULL,
    source TEXT,
    generated_at_utc TEXT,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc TEXT,
    CONSTRAINT uq_ref_package_name_version UNIQUE (package_name, version)
);

CREATE TABLE IF NOT EXISTS REF_PACKAGE_GOVERNANCE (
    ref_package_governance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ref_package_id INTEGER NOT NULL,
    data_owner TEXT NOT NULL,
    data_steward TEXT NOT NULL,
    approver TEXT,
    approval_status TEXT NOT NULL,
    approval_date TEXT,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc TEXT,
    CONSTRAINT fk_ref_package_governance_package
        FOREIGN KEY (ref_package_id)
        REFERENCES REF_PACKAGE (ref_package_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_ref_package_governance_package UNIQUE (ref_package_id),
    CONSTRAINT chk_ref_package_approval_status
        CHECK (approval_status IN ('draft', 'review', 'approved', 'deprecated'))
);

CREATE TABLE IF NOT EXISTS REF_DATASET (
    ref_dataset_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ref_package_id INTEGER NOT NULL,
    dataset_id TEXT NOT NULL,
    dataset_name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    classification TEXT,
    source_system TEXT,
    update_frequency TEXT,
    effective_date_field TEXT,
    expiry_date_field TEXT,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc TEXT,
    CONSTRAINT fk_ref_dataset_package
        FOREIGN KEY (ref_package_id)
        REFERENCES REF_PACKAGE (ref_package_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_ref_dataset_package_dataset_id
        UNIQUE (ref_package_id, dataset_id),
    CONSTRAINT chk_ref_dataset_status
        CHECK (status IN ('active', 'inactive', 'retired')),
    CONSTRAINT chk_ref_dataset_classification
        CHECK (
            classification IS NULL OR classification IN (
                'Public',
                'Internal',
                'Confidential',
                'Highly Confidential',
                'Restricted'
            )
        ),
    CONSTRAINT chk_ref_dataset_update_frequency
        CHECK (
            update_frequency IS NULL OR update_frequency IN (
                'event-driven',
                'hourly',
                'daily',
                'weekly',
                'monthly',
                'quarterly',
                'annually',
                'ad-hoc'
            )
        )
);

CREATE TABLE IF NOT EXISTS REF_DATASET_KEY (
    ref_dataset_key_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ref_dataset_id INTEGER NOT NULL,
    key_type TEXT NOT NULL,
    key_name TEXT NOT NULL,
    ordinal_position INTEGER,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT fk_ref_dataset_key_dataset
        FOREIGN KEY (ref_dataset_id)
        REFERENCES REF_DATASET (ref_dataset_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_ref_dataset_key
        UNIQUE (ref_dataset_id, key_type, key_name),
    CONSTRAINT chk_ref_dataset_key_type
        CHECK (key_type IN ('business_key', 'surrogate_key')),
    CONSTRAINT chk_ref_dataset_key_ordinal
        CHECK (ordinal_position IS NULL OR ordinal_position >= 1)
);

CREATE TABLE IF NOT EXISTS REF_DATASET_ATTRIBUTE (
    ref_dataset_attribute_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ref_dataset_id INTEGER NOT NULL,
    attribute_name TEXT NOT NULL,
    data_type TEXT NOT NULL,
    nullable INTEGER NOT NULL,
    description TEXT,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc TEXT,
    CONSTRAINT fk_ref_dataset_attribute_dataset
        FOREIGN KEY (ref_dataset_id)
        REFERENCES REF_DATASET (ref_dataset_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_ref_dataset_attribute
        UNIQUE (ref_dataset_id, attribute_name),
    CONSTRAINT chk_ref_dataset_attribute_data_type
        CHECK (data_type IN ('string', 'integer', 'number', 'boolean', 'date', 'datetime')),
    CONSTRAINT chk_ref_dataset_attribute_nullable
        CHECK (nullable IN (0, 1))
);

CREATE TABLE IF NOT EXISTS REF_DATASET_ATTRIBUTE_ALLOWED_VALUE (
    ref_dataset_attribute_allowed_value_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ref_dataset_attribute_id INTEGER NOT NULL,
    allowed_value TEXT NOT NULL,
    sort_order INTEGER,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT fk_ref_dataset_attribute_allowed_value_attribute
        FOREIGN KEY (ref_dataset_attribute_id)
        REFERENCES REF_DATASET_ATTRIBUTE (ref_dataset_attribute_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_ref_dataset_attribute_allowed_value
        UNIQUE (ref_dataset_attribute_id, allowed_value),
    CONSTRAINT chk_ref_dataset_attribute_allowed_value_sort_order
        CHECK (sort_order IS NULL OR sort_order >= 0)
);

CREATE TABLE IF NOT EXISTS REF_CODE_SET (
    ref_code_set_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ref_dataset_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    effective_from TEXT,
    effective_to TEXT,
    sort_order INTEGER,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc TEXT,
    CONSTRAINT fk_ref_code_set_dataset
        FOREIGN KEY (ref_dataset_id)
        REFERENCES REF_DATASET (ref_dataset_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_ref_code_set_dataset_code
        UNIQUE (ref_dataset_id, code),
    CONSTRAINT chk_ref_code_set_status
        CHECK (status IN ('active', 'inactive', 'deprecated')),
    CONSTRAINT chk_ref_code_set_sort_order
        CHECK (sort_order IS NULL OR sort_order >= 0)
);

CREATE TABLE IF NOT EXISTS REF_QUALITY_RULE (
    ref_quality_rule_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ref_dataset_id INTEGER NOT NULL,
    rule_id TEXT NOT NULL,
    rule_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    expression TEXT,
    description TEXT,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc TEXT,
    CONSTRAINT fk_ref_quality_rule_dataset
        FOREIGN KEY (ref_dataset_id)
        REFERENCES REF_DATASET (ref_dataset_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_ref_quality_rule_dataset_rule_id
        UNIQUE (ref_dataset_id, rule_id),
    CONSTRAINT chk_ref_quality_rule_type
        CHECK (rule_type IN ('uniqueness', 'completeness', 'referential-integrity', 'valid-range', 'allowed-values', 'custom')),
    CONSTRAINT chk_ref_quality_rule_severity
        CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

CREATE TABLE IF NOT EXISTS REF_LINEAGE (
    ref_lineage_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ref_dataset_id INTEGER NOT NULL,
    direction TEXT NOT NULL,
    system_name TEXT NOT NULL,
    ordinal_position INTEGER,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT fk_ref_lineage_dataset
        FOREIGN KEY (ref_dataset_id)
        REFERENCES REF_DATASET (ref_dataset_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_ref_lineage_dataset_direction_system
        UNIQUE (ref_dataset_id, direction, system_name),
    CONSTRAINT chk_ref_lineage_direction
        CHECK (direction IN ('upstream', 'downstream')),
    CONSTRAINT chk_ref_lineage_ordinal
        CHECK (ordinal_position IS NULL OR ordinal_position >= 1)
);

CREATE TABLE IF NOT EXISTS REF_SLA (
    ref_sla_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ref_dataset_id INTEGER NOT NULL,
    refresh_frequency TEXT,
    latency_target TEXT,
    last_refresh_utc TEXT,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc TEXT,
    CONSTRAINT fk_ref_sla_dataset
        FOREIGN KEY (ref_dataset_id)
        REFERENCES REF_DATASET (ref_dataset_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_ref_sla_dataset UNIQUE (ref_dataset_id)
);

CREATE TABLE IF NOT EXISTS REF_RECORD (
    ref_record_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ref_dataset_id INTEGER NOT NULL,
    record_json TEXT NOT NULL,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc TEXT,
    CONSTRAINT fk_ref_record_dataset
        FOREIGN KEY (ref_dataset_id)
        REFERENCES REF_DATASET (ref_dataset_id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ref_package_name
    ON REF_PACKAGE (package_name);

CREATE INDEX IF NOT EXISTS idx_ref_dataset_package_id
    ON REF_DATASET (ref_package_id);

CREATE INDEX IF NOT EXISTS idx_ref_dataset_dataset_id
    ON REF_DATASET (dataset_id);

CREATE INDEX IF NOT EXISTS idx_ref_dataset_status
    ON REF_DATASET (status);

CREATE INDEX IF NOT EXISTS idx_ref_dataset_classification
    ON REF_DATASET (classification);

CREATE INDEX IF NOT EXISTS idx_ref_dataset_key_dataset_id
    ON REF_DATASET_KEY (ref_dataset_id);

CREATE INDEX IF NOT EXISTS idx_ref_dataset_attribute_dataset_id
    ON REF_DATASET_ATTRIBUTE (ref_dataset_id);

CREATE INDEX IF NOT EXISTS idx_ref_dataset_attribute_name
    ON REF_DATASET_ATTRIBUTE (attribute_name);

CREATE INDEX IF NOT EXISTS idx_ref_allowed_value_attribute_id
    ON REF_DATASET_ATTRIBUTE_ALLOWED_VALUE (ref_dataset_attribute_id);

CREATE INDEX IF NOT EXISTS idx_ref_code_set_dataset_id
    ON REF_CODE_SET (ref_dataset_id);

CREATE INDEX IF NOT EXISTS idx_ref_code_set_code
    ON REF_CODE_SET (code);

CREATE INDEX IF NOT EXISTS idx_ref_quality_rule_dataset_id
    ON REF_QUALITY_RULE (ref_dataset_id);

CREATE INDEX IF NOT EXISTS idx_ref_lineage_dataset_id
    ON REF_LINEAGE (ref_dataset_id);

CREATE INDEX IF NOT EXISTS idx_ref_lineage_direction
    ON REF_LINEAGE (direction);

CREATE INDEX IF NOT EXISTS idx_ref_sla_dataset_id
    ON REF_SLA (ref_dataset_id);

CREATE INDEX IF NOT EXISTS idx_ref_record_dataset_id
    ON REF_RECORD (ref_dataset_id);

-- +goose Down
DROP INDEX IF EXISTS idx_ref_record_dataset_id;
DROP INDEX IF EXISTS idx_ref_sla_dataset_id;
DROP INDEX IF EXISTS idx_ref_lineage_direction;
DROP INDEX IF EXISTS idx_ref_lineage_dataset_id;
DROP INDEX IF EXISTS idx_ref_quality_rule_dataset_id;
DROP INDEX IF EXISTS idx_ref_code_set_code;
DROP INDEX IF EXISTS idx_ref_code_set_dataset_id;
DROP INDEX IF EXISTS idx_ref_allowed_value_attribute_id;
DROP INDEX IF EXISTS idx_ref_dataset_attribute_name;
DROP INDEX IF EXISTS idx_ref_dataset_attribute_dataset_id;
DROP INDEX IF EXISTS idx_ref_dataset_key_dataset_id;
DROP INDEX IF EXISTS idx_ref_dataset_classification;
DROP INDEX IF EXISTS idx_ref_dataset_status;
DROP INDEX IF EXISTS idx_ref_dataset_dataset_id;
DROP INDEX IF EXISTS idx_ref_dataset_package_id;
DROP INDEX IF EXISTS idx_ref_package_name;

DROP TABLE IF EXISTS REF_RECORD;
DROP TABLE IF EXISTS REF_SLA;
DROP TABLE IF EXISTS REF_LINEAGE;
DROP TABLE IF EXISTS REF_QUALITY_RULE;
DROP TABLE IF EXISTS REF_CODE_SET;
DROP TABLE IF EXISTS REF_DATASET_ATTRIBUTE_ALLOWED_VALUE;
DROP TABLE IF EXISTS REF_DATASET_ATTRIBUTE;
DROP TABLE IF EXISTS REF_DATASET_KEY;
DROP TABLE IF EXISTS REF_DATASET;
DROP TABLE IF EXISTS REF_PACKAGE_GOVERNANCE;
DROP TABLE IF EXISTS REF_PACKAGE;
