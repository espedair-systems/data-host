-- +goose Up
CREATE TABLE IF NOT EXISTS TAX_TAXONOMY (
    tax_taxonomy_id INTEGER PRIMARY KEY AUTOINCREMENT,
    taxonomy_name TEXT NOT NULL,
    version TEXT NOT NULL,
    title TEXT,
    description TEXT,
    taxonomy_type TEXT NOT NULL,
    source TEXT,
    generated_at_utc TEXT,
    default_language TEXT,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc TEXT,
    CONSTRAINT uq_tax_taxonomy_name_version UNIQUE (taxonomy_name, version),
    CONSTRAINT chk_tax_taxonomy_type
        CHECK (taxonomy_type IN ('business', 'technical', 'regulatory', 'domain', 'product', 'risk', 'control', 'custom'))
);

CREATE TABLE IF NOT EXISTS TAX_TAXONOMY_GOVERNANCE (
    tax_taxonomy_governance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tax_taxonomy_id INTEGER NOT NULL,
    owner TEXT,
    steward TEXT,
    approver TEXT,
    approval_status TEXT,
    approved_at TEXT,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc TEXT,
    CONSTRAINT fk_tax_taxonomy_governance_taxonomy
        FOREIGN KEY (tax_taxonomy_id)
        REFERENCES TAX_TAXONOMY (tax_taxonomy_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_tax_taxonomy_governance_taxonomy UNIQUE (tax_taxonomy_id),
    CONSTRAINT chk_tax_taxonomy_approval_status
        CHECK (approval_status IS NULL OR approval_status IN ('draft', 'review', 'approved', 'deprecated'))
);

CREATE TABLE IF NOT EXISTS TAX_TERM (
    tax_term_id INTEGER PRIMARY KEY AUTOINCREMENT,
    tax_taxonomy_id INTEGER NOT NULL,
    term_id TEXT NOT NULL,
    label TEXT,
    definition TEXT,
    status TEXT,
    term_type TEXT,
    language TEXT,
    parent_term_id TEXT,
    classification TEXT,
    owner TEXT,
    steward TEXT,
    created_at_utc TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    updated_at_utc TEXT,
    CONSTRAINT fk_tax_term_taxonomy
        FOREIGN KEY (tax_taxonomy_id)
        REFERENCES TAX_TAXONOMY (tax_taxonomy_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_tax_term
        UNIQUE (tax_taxonomy_id, term_id),
    CONSTRAINT chk_tax_term_status
        CHECK (status IN ('proposed', 'active', 'deprecated', 'retired')),
    CONSTRAINT chk_tax_term_type
        CHECK (term_type IS NULL OR term_type IN ('category', 'concept', 'class', 'code', 'tag', 'custom')),
    CONSTRAINT chk_tax_term_classification
        CHECK (
            classification IS NULL OR classification IN (
                'Public',
                'Internal',
                'Confidential',
                'Highly Confidential',
                'Restricted'
            )
        )
);

-- +goose Down
DROP TABLE IF EXISTS TAX_TERM;
DROP TABLE IF EXISTS TAX_TAXONOMY_GOVERNANCE;
DROP TABLE IF EXISTS TAX_TAXONOMY;
