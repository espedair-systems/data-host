-- +goose Up
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS DPRO_CATALOG (
    dpro_catalog_id INTEGER PRIMARY KEY AUTOINCREMENT,
    catalog_name TEXT NOT NULL,
    description TEXT,
    source TEXT,
    generated_at_utc TEXT,
    platform TEXT NOT NULL,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc TEXT,
    CONSTRAINT uq_dpro_catalog_name_platform UNIQUE (catalog_name, platform)
);

CREATE TABLE IF NOT EXISTS DPRO_PRODUCT (
    dpro_product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    dpro_catalog_id INTEGER NOT NULL,
    product_id TEXT NOT NULL,
    product_group TEXT NOT NULL,
    lifecycle_status TEXT NOT NULL,
    owner TEXT NOT NULL,
    steward TEXT NOT NULL,
    producer_system TEXT,
    sla TEXT,
    refresh_expectation TEXT,
    product_name TEXT NOT NULL,
    surface TEXT NOT NULL,
    delivery_type TEXT NOT NULL,
    transformation_tier TEXT,
    description TEXT NOT NULL,
    consumer_requirement TEXT NOT NULL,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc TEXT,
    CONSTRAINT fk_dpro_product_catalog
        FOREIGN KEY (dpro_catalog_id)
        REFERENCES DPRO_CATALOG (dpro_catalog_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_dpro_product_catalog_product_id
        UNIQUE (dpro_catalog_id, product_id),
    CONSTRAINT chk_dpro_product_group
        CHECK (product_group IN ('ingress', 'access', 'subscription', 'egress')),
    CONSTRAINT chk_dpro_lifecycle_status
        CHECK (lifecycle_status IN ('draft', 'active', 'deprecated', 'retired')),
    CONSTRAINT chk_dpro_delivery_type
        CHECK (delivery_type IN ('interactive', 'curated-visual', 'dataset-subscription', 'ingestion-pipeline', 'api', 'file-delivery', 'custom')),
    CONSTRAINT chk_dpro_transformation_tier
        CHECK (transformation_tier IS NULL OR transformation_tier IN ('bronze', 'silver', 'gold'))
);

CREATE TABLE IF NOT EXISTS DPRO_PRODUCT_PRIMARY_CONSUMER (
    dpro_product_primary_consumer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    dpro_product_id INTEGER NOT NULL,
    consumer_name TEXT NOT NULL,
    ordinal_position INTEGER,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT fk_dpro_product_primary_consumer_product
        FOREIGN KEY (dpro_product_id)
        REFERENCES DPRO_PRODUCT (dpro_product_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_dpro_product_primary_consumer
        UNIQUE (dpro_product_id, consumer_name),
    CONSTRAINT chk_dpro_product_primary_consumer_ordinal
        CHECK (ordinal_position IS NULL OR ordinal_position >= 1)
);

CREATE TABLE IF NOT EXISTS DPRO_PRODUCT_EVIDENCE_ANCHOR (
    dpro_product_evidence_anchor_id INTEGER PRIMARY KEY AUTOINCREMENT,
    dpro_product_id INTEGER NOT NULL,
    source TEXT NOT NULL,
    location TEXT NOT NULL,
    detail TEXT NOT NULL,
    ordinal_position INTEGER,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    CONSTRAINT fk_dpro_product_evidence_anchor_product
        FOREIGN KEY (dpro_product_id)
        REFERENCES DPRO_PRODUCT (dpro_product_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_dpro_product_evidence_anchor
        UNIQUE (dpro_product_id, source, location, detail),
    CONSTRAINT chk_dpro_product_evidence_anchor_ordinal
        CHECK (ordinal_position IS NULL OR ordinal_position >= 1)
);

CREATE INDEX IF NOT EXISTS idx_dpro_catalog_name
    ON DPRO_CATALOG (catalog_name);

CREATE INDEX IF NOT EXISTS idx_dpro_catalog_platform
    ON DPRO_CATALOG (platform);

CREATE INDEX IF NOT EXISTS idx_dpro_product_catalog_id
    ON DPRO_PRODUCT (dpro_catalog_id);

CREATE INDEX IF NOT EXISTS idx_dpro_product_product_id
    ON DPRO_PRODUCT (product_id);

CREATE INDEX IF NOT EXISTS idx_dpro_product_group
    ON DPRO_PRODUCT (product_group);

CREATE INDEX IF NOT EXISTS idx_dpro_product_lifecycle_status
    ON DPRO_PRODUCT (lifecycle_status);

CREATE INDEX IF NOT EXISTS idx_dpro_product_delivery_type
    ON DPRO_PRODUCT (delivery_type);

CREATE INDEX IF NOT EXISTS idx_dpro_product_transformation_tier
    ON DPRO_PRODUCT (transformation_tier);

CREATE INDEX IF NOT EXISTS idx_dpro_product_primary_consumer_product_id
    ON DPRO_PRODUCT_PRIMARY_CONSUMER (dpro_product_id);

CREATE INDEX IF NOT EXISTS idx_dpro_product_primary_consumer_name
    ON DPRO_PRODUCT_PRIMARY_CONSUMER (consumer_name);

CREATE INDEX IF NOT EXISTS idx_dpro_product_evidence_anchor_product_id
    ON DPRO_PRODUCT_EVIDENCE_ANCHOR (dpro_product_id);

CREATE INDEX IF NOT EXISTS idx_dpro_product_evidence_anchor_source
    ON DPRO_PRODUCT_EVIDENCE_ANCHOR (source);

-- +goose Down
DROP INDEX IF EXISTS idx_dpro_product_evidence_anchor_source;
DROP INDEX IF EXISTS idx_dpro_product_evidence_anchor_product_id;
DROP INDEX IF EXISTS idx_dpro_product_primary_consumer_name;
DROP INDEX IF EXISTS idx_dpro_product_primary_consumer_product_id;
DROP INDEX IF EXISTS idx_dpro_product_transformation_tier;
DROP INDEX IF EXISTS idx_dpro_product_delivery_type;
DROP INDEX IF EXISTS idx_dpro_product_lifecycle_status;
DROP INDEX IF EXISTS idx_dpro_product_group;
DROP INDEX IF EXISTS idx_dpro_product_product_id;
DROP INDEX IF EXISTS idx_dpro_product_catalog_id;
DROP INDEX IF EXISTS idx_dpro_catalog_platform;
DROP INDEX IF EXISTS idx_dpro_catalog_name;

DROP TABLE IF EXISTS DPRO_PRODUCT_EVIDENCE_ANCHOR;
DROP TABLE IF EXISTS DPRO_PRODUCT_PRIMARY_CONSUMER;
DROP TABLE IF EXISTS DPRO_PRODUCT;
DROP TABLE IF EXISTS DPRO_CATALOG;
