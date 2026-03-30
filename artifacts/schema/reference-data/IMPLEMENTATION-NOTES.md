# Reference Data Implementation Notes

This document provides practical guidance for implementing reference data artifacts based on:

- reference-data-management.schema.json
- reference-data-management.example.json
- reference-data-management.minimal.example.json

## Purpose

Use this schema to standardize managed reference datasets and controlled vocabularies across business domains, including:

- governance accountability and approval lifecycle
- stable dataset identifiers and key strategy
- code set lifecycle controls
- quality validation rules and SLA expectations
- optional lineage context for upstream and downstream usage

## Recommended Implementation Sequence

1. Define package metadata first
- Set name, version, domain, source, and generated_at_utc.
- Keep semantic versions consistent with release governance.

2. Populate governance context
- Set data_owner, data_steward, and approval_status.
- Set approver and approval_date before production promotion.

3. Register datasets
- Add dataset_id, dataset_name, status, keys, and code_sets.
- Set classification and update_frequency to match operational policy.

4. Define key structure
- Set business_key with one or more natural key fields.
- Set surrogate_key where warehouse or MDM platforms require technical keys.

5. Define attributes
- Register attribute name, data_type, and nullable behavior.
- Use allowed_values for constrained text attributes.

6. Define code sets
- Add code, label, and status for each controlled value.
- Use effective_from and effective_to for temporal validity.

7. Add quality, lineage, and SLA context
- Define quality_rules with severity and expression references.
- Add lineage upstream and downstream consumers where known.
- Add SLA refresh and latency expectations for operational monitoring.

## Dataset Modeling Guidance

Required dataset fields:

- dataset_id
- dataset_name
- status
- keys
- code_sets

Naming and identifier conventions:

- Use lowercase snake_case for dataset_id.
- Keep dataset_id stable across non-breaking updates.
- Avoid embedding version information in dataset_id.

Status usage:

- active for published, supported datasets
- inactive for paused distribution
- retired for decommissioned datasets

## Key and Attribute Guidance

Key strategy:

- Use business_key for semantic uniqueness and integration mapping.
- Use surrogate_key when storage and join performance require technical identifiers.

Attribute guidance:

- Keep data_type aligned with schema enum values.
- Use nullable false for core key and control fields.
- Use allowed_values only when the set is intentionally constrained.

## Code Set Lifecycle Guidance

Required code_set fields:

- code
- label
- status

Lifecycle practices:

- Keep code values immutable after publication.
- Use deprecated status instead of deleting values still referenced downstream.
- Populate effective_to when a code leaves active usage.
- Use sort_order to preserve stable display ordering in reports and UI.

## Quality Rule Guidance

Rule types available:

- uniqueness
- completeness
- referential-integrity
- valid-range
- allowed-values
- custom

Severity guidance:

- critical for blocking release issues
- high for strong control failures requiring immediate remediation
- medium for non-blocking but important quality gaps
- low for advisory checks

Best practices:

- Keep expression text implementation-ready and testable.
- Tie each rule_id to a validation job or documented control.

## Lineage and SLA Guidance

Lineage usage:

- Use upstream for authoritative sources and standards.
- Use downstream for consumers impacted by change.

SLA usage:

- Keep refresh_frequency aligned with update_frequency where applicable.
- Define latency_target in operational terms such as T+1 day or <= 4h.
- Update last_refresh_utc as part of each publication cycle.

## Governance and Versioning

Recommended approval lifecycle:

1. draft
2. review
3. approved
4. deprecated

Versioning approach:

- major for breaking structural or semantic changes
- minor for additive datasets, attributes, or rules
- patch for non-breaking corrections

## Validation and Testing Checklist

Before release:

- JSON validates against reference-data-management.schema.json.
- governance includes data_owner, data_steward, and approval_status.
- Every dataset has required fields and at least one business_key field.
- Code sets include required fields and valid status values.
- quality_rules rule_type and severity values are valid.
- Effective date ranges are logically consistent where both dates are present.
- Stats and operational metadata are current when included.

## Common Pitfalls to Avoid

- Reusing code values with changed meaning
- Missing quality rules for high-impact datasets
- Untracked downstream impacts when deprecating codes
- Inconsistent business_key definitions across environments
- Publishing without approval lifecycle updates

## Suggested Companion Artifacts

- DATA-QUALITY-RULES.md for executable validation definitions
- CHANGELOG.md for dataset and code set release history
- CONSUMER-IMPACT.md for downstream dependency analysis
- RUNBOOK.md for refresh, approval, and rollback procedures
