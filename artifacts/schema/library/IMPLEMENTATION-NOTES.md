# Library File Upload Implementation Notes

This document provides practical guidance for implementing managed file uploads based on:

- library-file-upload.schema.json
- library-file-upload.example.json

## Purpose

Use this schema to standardize file upload management for filesystem and cloud storage backends, including:

- purpose-based grouping of files
- controlled version history and lifecycle
- internal and external party access controls
- governance and operational metrics

## Recommended Implementation Sequence

1. Define catalog metadata first
- Set name, version, source, and generated_at_utc.
- Use semantic versions to track structural or policy changes.

2. Define storage profiles
- Register each storage backend in storage_profiles.
- Use storage_type filesystem or cloud.
- For filesystem, set filesystem.root_path.
- For cloud, set provider, container, and region.

3. Register parties
- Add internal and external parties in parties.
- Keep party_id stable for auditability and access controls.

4. Define file groups by purpose
- Create file_groups to represent business purpose boundaries.
- Set default_storage_id, visibility, and versioning_mode.
- Add allowed file types, max size, and retention policy.

5. Register files
- Add file entries linked to group_id and storage_id.
- Set current_version to match the active version_number.
- Populate status and visibility according to operating policy.

6. Add file versions
- Capture version_id, version_number, storage_uri, and access_scope.
- Track uploader identity, upload time, checksum, and change_summary.
- Use allowed_party_ids for explicit allow-list access when required.

7. Populate optional stats
- Keep profile, group, file, and version counts synchronized with payload content.

## Storage Modeling Guidance

Storage profile requirements:

- storage_id
- storage_type
- name
- status

Conditional config guidance:

- storage_type filesystem requires filesystem.root_path.
- storage_type cloud requires cloud.provider, cloud.container, and cloud.region.

Best practices:

- Use one active primary storage profile per operational purpose.
- Use cloud prefixes and filesystem path patterns for partitioning.
- Keep storage_id stable even if physical endpoints are rotated.

## Group and Visibility Guidance

Group purpose practices:

- Define one group per business purpose and policy boundary.
- Use shared visibility only when both internal and external access are required.
- Use internal visibility for operational or reference artifacts.

Versioning mode guidance:

- semantic for formal release packages
- sequence for straightforward incremental files
- timestamp for event-time driven publication
- manual for externally controlled version labels

## File and Version Lifecycle Guidance

File status values:

- active
- inactive
- retired

Version status values:

- active for current usable version
- superseded for replaced but retained versions
- withdrawn for revoked versions

Best practices:

- Keep only one active version per file for operational clarity.
- Use checksum for integrity checks and tamper detection.
- Keep storage_uri immutable after publication.

## Party Access Guidance

Party type usage:

- internal for employees, teams, and internal services
- external for regulators, partners, and clients

Access control recommendations:

- Use access_scope for broad policy intent.
- Use allowed_party_ids for explicit party-level restrictions.
- Keep external access minimal and time-bounded in operational procedures.

## Governance and Versioning

Recommended governance lifecycle:

1. draft
2. review
3. approved
4. deprecated

Versioning approach:

- major for breaking structure or policy changes
- minor for additive groups, files, or attributes
- patch for non-breaking corrections

## Validation and Testing Checklist

Before release:

- JSON validates against library-file-upload.schema.json.
- Every file_groups.default_storage_id exists in storage_profiles.storage_id.
- Every files.group_id exists in file_groups.group_id.
- Every files.storage_id exists in storage_profiles.storage_id.
- Every uploaded_by_party_id and allowed_party_ids value exists in parties.party_id when parties are provided.
- current_version exists in files.versions.version_number.
- Exactly one active version per file unless your policy explicitly allows multiple active versions.
- Stats values match current payload counts.

## Common Pitfalls to Avoid

- Missing storage profile references from file groups or files
- Using shared visibility without explicit external access controls
- Inconsistent version numbering across files in the same group
- Missing checksums on externally distributed files
- Stale stats after version updates

## Suggested Companion Artifacts

- RUNBOOK.md for upload operations, rollback, and incident handling
- ACCESS-REVIEW.md for internal and external permission attestation
- RETENTION-POLICY.md for legal hold and archival controls
- CHANGELOG.md for file and version release history
