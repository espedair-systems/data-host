# CMDB Implementation Notes

This document provides practical guidance for implementing configuration management data based on:

- cmdb.schema.json
- cmdb.example.json

## Purpose

Use this schema to standardize CMDB snapshots for operational ownership, system topology, database dependencies, and governance reporting, including:

- accountable owners for systems and databases
- parent-child system decomposition by architecture layer
- explicit cross-entity relationships for dependency mapping
- optional summary statistics for operational controls

## Recommended Implementation Sequence

1. Define snapshot metadata first
- Set name, version, source, and generated_at_utc.
- Use semantic versioning to track structural and policy changes.

2. Register owners
- Create stable owner_id values and set owner_type consistently.
- Keep status current for active and inactive ownership transitions.

3. Register systems
- Add system_id, owner_id, system_layer, environment, and status.
- Use parent_system_id for subsystem decomposition such as UI, middleware, and database layers.

4. Register databases
- Link each database to system_id and owner_id.
- Set engine, classification, lifecycle_stage, and backup expectations.

5. Add relationships for richer topology
- Capture interactions using relationship_type, source_type, and target_type.
- Use criticality and direction to support dependency and incident analysis.

6. Add optional stats
- Populate owner_count, system_count, database_count, and relationship_count.
- Keep stats aligned with current payload counts for quick integrity checks.

## Owner Modeling Guidance

Recommended conventions:

- owner_id: stable lowercase identifier with separators
- owner_type: person, team, service-owner, platform-owner, vendor, or custom
- status: active unless ownership has formally transitioned

Best practices:

- Prefer team ownership for long-lived platforms.
- Use person ownership only when directly accountable by design.
- Keep group and contact fields populated for operational escalations.

## System Modeling Guidance

Required core fields:

- system_id
- system_name
- owner_id
- system_layer
- environment
- status

Hierarchy guidance:

- Use one parent system for each logical service boundary.
- Use child systems for architectural layers such as ui, middleware, and database.
- Keep parent_system_id within the same snapshot scope.

Layer usage suggestions:

- application for top-level business services
- ui for user-facing channels
- middleware for orchestration and domain logic
- database for database-facing components
- platform for shared runtime or orchestration services

## Database Modeling Guidance

Recommended fields to maintain:

- engine and engine_version for platform compatibility
- classification for data governance alignment
- lifecycle_stage and status for support posture
- backup_policy, rpo, and rto for recovery controls

Best practices:

- Keep system_id aligned to the system that owns or primarily uses the database.
- Use tags for discovery and analysis, not policy enforcement.

## Relationship Modeling Guidance

Use relationships for dependencies not fully represented by parent_system_id.

Common relationship patterns:

- system calls system
- system writes-to database
- system reads-from database
- owner owns system
- platform system supports business system

Best practices:

- Keep source_id and target_id valid within the same snapshot.
- Use criticality to prioritize change impact analysis.
- Use unidirectional unless bidirectional semantics are truly required.

## Governance and Lifecycle

Recommended lifecycle flow for records:

1. active
2. inactive
3. retired

Versioning approach:

- major for breaking structural changes
- minor for additive fields or relationships
- patch for non-breaking corrections and data quality fixes

## Validation and Testing Checklist

Before release:

- JSON validates against cmdb.schema.json.
- Every systems.owner_id exists in owners.owner_id.
- Every systems.parent_system_id, when present, exists in systems.system_id.
- Every databases.system_id exists in systems.system_id.
- Every databases.owner_id exists in owners.owner_id.
- Every relationships source and target entity exists and type matches.
- Stats values match actual entity counts.

## Common Pitfalls to Avoid

- Duplicated entity identifiers within the same snapshot
- Orphan parent_system_id values
- Owner references that are missing from owners
- Relationship rows with mismatched source_type or target_type
- Stale stats that do not reflect current data

## Suggested Companion Artifacts

- RUNBOOK.md for CMDB refresh and incident triage
- DATA-QUALITY-RULES.md for validation controls
- CHANGELOG.md for snapshot and schema evolution
- TRACEABILITY.md linking systems to upstream/downstream processes
