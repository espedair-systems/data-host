# Mapping Implementation Notes

This document provides practical guidance for implementing mapping specifications based on:

- `mapping.schema.json`
- `mapping.example-1.json` (many-to-one)
- `mapping.example-2.json` (one-to-many)

## Purpose

Use this schema to standardize table-level and column-level mappings between source and target assets, including:

- one-to-one mappings
- many-to-one consolidations
- one-to-many splits
- many-to-many mappings

The contract supports reusable transformation definitions and rule definitions to avoid duplication and improve maintainability.

## Recommended Implementation Sequence

1. Register source and target tables
- Populate `table_registry` with stable `table_id` values.
- Keep naming conventions consistent with platform naming standards.

2. Define reusable transformations and rules
- Add shared logic to `transformation_definitions`.
- Add shared controls to `rule_definitions`.
- Prefer references (`transformation_ref`, `rule_refs`) over repeated inline logic.

3. Build mapping sets by cardinality pattern
- Set `mapping_type` explicitly for each mapping set.
- Ensure `sources` and `targets` satisfy cardinality constraints:
  - `many-to-one`: 2+ sources, exactly 1 target
  - `one-to-many`: exactly 1 source, 2+ targets
  - `one-to-one`: exactly 1 source, exactly 1 target

4. Define joins where applicable
- Use `join_definitions` for multi-source mappings.
- Keep join logic explicit and test null-handling behavior.

5. Define column mappings
- For each target column, define:
  - `target_table_id`
  - `target_column`
  - `mapping_mode`
- Include source lineage using `source_columns`.
- Use `default_value` only where business-approved.

6. Add execution metadata and evidence
- Complete `execution` for load type, schedule, SLA, and refresh expectation.
- Add `evidence_anchors` to link mapping logic to code, runbooks, or requirements.

## Mapping Pattern Guidance

### Many-to-One

Typical use:

- Consolidating multiple source systems into a master or curated target.

Design notes:

- Ensure key harmonization across sources before merge.
- Use standardized transformation references for identity fields.
- Add quality rules for null keys and duplicate prevention.

### One-to-Many

Typical use:

- Splitting an input table into normalized targets (for example, header and line).

Design notes:

- Define clear column ownership per target table.
- Preserve relationship keys (for example, parent transaction id).
- Use target-specific `write_mode` values.

## Column Mapping Guidance

Recommended conventions:

- `direct`: for 1:1 source-to-target mappings
- `expression`: for derived logic
- `constant`: for technical flags or lineage markers
- `lookup`/`conditional`/`aggregate`: for domain logic with explicit rule coverage

Best practices:

- Always include `source_columns` for traceability, even with expressions.
- Use `target_data_type` to document expected shape at load time.
- Use `nullable: false` for required business keys and critical measures.

## Rule and Transformation Design

### Transformation Definitions

- Keep expression logic centralized in `transformation_definitions`.
- Add `language` consistently (for example `sql`).
- Use descriptive IDs such as `tr.normalize_email`.

### Rule Definitions

Rule types to prioritize:

- `quality` for mandatory fields and completeness
- `validation` for format and range checks
- `filter` for row eligibility
- `business` for domain-specific controls

Severity guidance:

- `critical`: blocks load/publish
- `high`: requires escalation or remediation before release
- `medium`: warning with remediation target
- `low`: informational

## Execution and Operational Controls

Populate `execution` per mapping set:

- `load_type`: `full`, `incremental`, `cdc`, or `snapshot`
- `schedule`: expected cadence
- `sla`: delivery expectation
- `refresh_expectation`: operational refresh pattern

Operational recommendations:

- Keep one authoritative schedule per mapping set.
- Align SLA wording with monitoring and alert thresholds.
- Capture rerun behavior in implementation runbooks.

## Validation and Testing Checklist

Before production release:

- Schema validation passes for full mapping document.
- Source/target cardinality aligns to `mapping_type`.
- All `transformation_ref` IDs exist in `transformation_definitions`.
- All `rule_refs` IDs exist in `rule_definitions`.
- Join logic tested for nulls and duplicate amplification.
- Column-level nullability and defaults tested with edge data.
- Row counts and control totals reconcile between source and targets.

## Governance and Change Management

Versioning approach:

- Major: breaking structure or logic changes
- Minor: additive mappings or optional fields
- Patch: corrections with no contract break

Approval workflow:

1. Draft mapping set with references and evidence anchors
2. Review with domain owner and steward
3. Validate with test data and reconciliation outputs
4. Approve and promote to production

## Common Pitfalls to Avoid

- Duplicating transformation logic inline instead of reusable references
- Ambiguous join conditions in many-to-one mappings
- Missing target keys in one-to-many split outputs
- Inconsistent table IDs across mapping sets and registry
- Missing evidence anchors for critical business rules

## Suggested Companion Artifacts

- `RUNBOOK.md`: operational run and incident handling
- `TEST-CASES.md`: positive, negative, and edge-case mapping tests
- `RECONCILIATION.md`: source-to-target balancing rules
- `CHANGELOG.md`: mapping version change history
