# Master Data Management Implementation Notes

This document provides practical guidance for implementing and operationalizing the master data contract defined in:

- `master-data-management.schema.json`
- `master-data-management.example.json`
- `master-data-management.minimal.example.json`

## Purpose

Use this schema to standardize how master entities are described, governed, matched, merged, and published as golden records.

Typical entity types include:

- person
- organization
- product
- account

## Recommended Implementation Sequence

1. Define governance and ownership
- Populate `governance.data_owner`, `governance.data_steward`, and approval fields.
- Confirm escalation path and stewardship queue before onboarding data.

2. Model core entities first
- Start with 1-2 high-value entities (for example: person and organization).
- Define `keys.business_key` and `keys.surrogate_key` early.

3. Define attribute survivorship
- Mark critical fields as `golden_record_candidate`.
- Add `source_priority` for fields where source trust differs.

4. Configure matching and merge behavior
- Set package-level `match_merge_policy` defaults.
- Override with `match_rules` and `survivorship_rules` at entity level when needed.

5. Add quality controls and stewardship workflow
- Add `quality_rules` for uniqueness, completeness, and referential integrity.
- Configure `stewardship.manual_review_required` and `review_sla`.

6. Publish sample records and validate downstream mapping
- Use `records` for representative payloads in test environments.
- Validate relationship semantics before production release.

## Match and Merge Guidance

### Thresholds

Recommended starting points:

- `auto_merge_threshold`: 0.95
- `review_threshold`: 0.80

Tune thresholds after reviewing false positives and false negatives from pilot runs.

### Rule Design

- Use exact rules for strong identifiers (ABN, LEI, TFN, ISIN).
- Use fuzzy/phonetic rules for names and free-text fields.
- Keep rule weights normalized and explain assumptions in `description`.

### Survivorship

Preferred order of survivorship strategies:

1. source-priority for regulated identifiers and legal names
2. most-recent for contact and operational attributes
3. highest-completeness where fragmented source data is common

## Relationship Modeling Guidance

Use `relationships` to describe cross-entity semantic links and expected cardinality.

Examples:

- person `employed-by` organization (`N:1`)
- product `issued-by` organization (`N:1`)
- person `holds` product (`N:N`)

Set `required: true` only for relationships mandatory for valid mastered records.

## Quality and Controls

Minimum quality rule set for each entity:

- one `uniqueness` rule for surrogate key integrity
- one `completeness` rule for mandatory business attributes
- one `referential-integrity` rule when using constrained lookup values

Use severity consistently:

- `critical`: blocks publication
- `high`: requires steward review before publication
- `medium`: warning with remediation target
- `low`: informational monitor

## Governance Workflow

Recommended lifecycle:

1. `draft`: schema and rules under development
2. `review`: steward and owner validation in progress
3. `approved`: production-ready and publishable
4. `deprecated`: superseded by newer contract version

Record approval date and approver for audit traceability.

## Versioning and Change Management

- Use semantic versioning in `version`.
- Increment major version for breaking schema changes.
- Increment minor version for additive changes (new optional fields/rules).
- Increment patch version for documentation or non-breaking corrections.

For breaking changes:

- publish migration notes
- run parallel validation on old and new contracts
- cut over downstream consumers in a controlled release window

## Integration Notes

- Keep schema and example files in source control.
- Validate payloads in CI/CD before deployment.
- Map `reference_dataset` attributes to controlled reference data catalogs.
- Track lineage from source systems to golden record outputs.

## Production Readiness Checklist

- Governance roles assigned and approved
- Entity keys reviewed with domain SMEs
- Match rules tested on representative historical data
- Survivorship outcomes reviewed by data stewards
- Quality rules mapped to runtime checks
- Stewardship queue and SLA operationalized
- Downstream consumers notified of contract and version

## Suggested Next Artifacts

- `MIGRATION.md` for source-to-golden mapping details
- `RUNBOOK.md` for operations, incidents, and rollback steps
- `QUALITY-THRESHOLDS.md` for KPI targets and tolerances
