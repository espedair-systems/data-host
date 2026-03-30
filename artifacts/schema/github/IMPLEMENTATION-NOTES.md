# GitHub Integration Implementation Notes

This document provides practical guidance for implementing GitHub integration data based on:

- github-integration.schema.json
- github-integration.example.json

## Purpose

Use this schema to standardize GitHub connectivity and repository authorization for platform and delivery workloads, including:

- integration endpoint and API version controls
- authentication mode and credential references
- organizations and repository scope
- principal-based access rules
- webhook subscriptions for event-driven processing

## Recommended Implementation Sequence

1. Define integration metadata first
- Set name, version, source, and generated_at_utc.
- Keep version semantic so policy and scope changes are traceable.

2. Configure provider endpoint and authentication
- Set provider to github and specify base_url.
- Start with github-app mode where possible.
- Store only credential references; do not embed secrets in the file.

3. Register organizations in scope
- Use stable org_id values that match your enterprise naming standards.
- Set visibility_policy to reflect allowed repository profiles.

4. Register repositories in scope
- Add repo_id, org_id, full_name, visibility, and default_branch.
- Mark archived repositories explicitly and downgrade status where required.

5. Define access rules
- Map principal_type and principal_id to repo_id with least-privilege permission.
- Use expires_at_utc for temporary grants.
- Use branch_scope pattern only when you need narrow branch access.

6. Add webhook subscriptions when needed
- Subscribe only to events required by downstream automation.
- Store endpoint_ref as a managed integration reference.

7. Populate optional stats
- Keep organization_count, repository_count, and access_rule_count in sync for operational review.

## Authentication Guidance

Preferred order:

1. github-app
2. fine-grained-pat
3. oauth-app
4. personal-access-token

Best practices:

- Rotate tokens regularly via token_rotation_days.
- Restrict scopes to minimum needed for use cases.
- Keep credential_ref in a managed secret vault.

## Repository Modeling Guidance

Recommended conventions:

- repo_id: enterprise-stable identifier independent of repository rename risk
- full_name: owner/repo format used for API operations
- compliance_tier: map to enterprise controls and approval workflows

Best practices:

- Keep org_id and full_name owner consistent.
- Use topics for discovery only, not for security decisions.
- Keep status aligned with operational support lifecycle.

## Access Rule Guidance

Permission model:

- read: clone and read metadata
- triage: issue/label workflows without write code access
- write: push changes and manage branches
- maintain: repository settings and broad collaboration
- admin: full administrative control

Policy suggestions:

- Prefer team or app principals over individual users.
- Time-box elevated access with expires_at_utc.
- Use protected branch scope for production repositories.

## Webhook Guidance

Use webhooks for:

- workflow_run events to trigger orchestration updates
- pull_request events for review and compliance controls
- release events for deployment metadata synchronization

Operational notes:

- Keep endpoint_ref abstracted to an integration registry or secret store.
- Validate downstream idempotency for duplicate delivery handling.

## Validation and Testing Checklist

Before release:

- JSON validates against github-integration.schema.json.
- integration.provider is github.
- Every repositories.org_id value exists in organizations.org_id.
- Every access_rules.repo_id value exists in repositories.repo_id.
- branch_pattern is present when branch_scope is pattern.
- Auth mode and scope set are approved by security architecture.
- stats values match current payload counts.

## Common Pitfalls to Avoid

- Embedding tokens or private keys directly in configuration
- Granting admin permission broadly to user principals
- Missing expiry for temporary elevated access
- Tracking repositories without owner org scope
- Enabling webhooks with unmanaged endpoint references

## Suggested Companion Artifacts

- RUNBOOK.md for token rotation and integration incident handling
- ACCESS-REVIEW.md for periodic permission attestation
- WEBHOOK-OPERATIONS.md for endpoint reliability and replay procedures
- CHANGELOG.md for integration scope and policy version history
