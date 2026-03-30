# Platform Agent Management Implementation Notes

This note explains how to operationalize the platform examples in this folder:

- platform-agent-management.example-gcp.json
- platform-agent-management.example-aws.json
- platform-agent-management.example-snowflake.json
- platform-agent-management.example-service-now.json

## 1. Required Schema Rules

1. Keep `$schema` pointing to `./platform-agent-management.schema.json`.
2. Keep `version` in semantic version format, for example `1.0.0`.
3. Ensure at least one `platform_connections` entry and one `agents` entry.
4. Keep `connection_id` and `agent_id` stable over time because these are referenced by `connection_ids` and policy controls.
5. Do not add unknown top-level fields because the schema has `additionalProperties: false`.

## 2. Platform Connection Guidance

1. Set `platform_type` correctly (`gcp`, `aws`, `snowflake`, `service-now`, `github`).
2. Only include the provider block that matches `platform_type`:
   - `gcp` for GCP
   - `aws` for AWS
   - `snowflake` for Snowflake
   - `service_now` for ServiceNow
   - `github` for GitHub
3. Store secrets in a managed secret store and reference them in `auth.credential_ref`.
4. Use `network_policy_ref` to tie each connection to controlled egress/ingress policy.
5. Keep connection lifecycle explicit with `status` (`active`, `inactive`, `retired`).

## 3. Agent Design Guidance

1. Define each agent as one primary responsibility (`orchestration`, `ingestion`, `monitoring`, `ticketing`, `governance`, etc.).
2. Keep `connection_ids` minimal and least-privilege.
3. Model runtime execution explicitly:
   - `runtime.host_type` defines where it runs.
   - `runtime.execution_mode` defines how it runs.
4. Add `schedule` only for scheduled agents.
5. Use tags for policy grouping and operational filtering.

## 4. Permission Modeling

1. Represent each access boundary as a separate `permissions` rule.
2. Prefer granular resources and actions (avoid broad wildcard grants where possible).
3. Use deny rules for critical guardrails where needed.
4. Use `condition` for time-bounded or context-bounded exceptions.
5. Review `permission_rule_count` in `stats` after policy updates.

## 5. Environment Promotion Pattern

1. Maintain separate files per environment (dev, test, prod).
2. Keep IDs stable across environments where feasible (for traceability), while allowing environment-specific `resource` values.
3. Promote by pull request with governance review and approval.
4. Update `generated_at_utc`, `version`, and governance metadata on every promoted change.

## 6. Validation and Change Control

1. Validate JSON syntax and schema compliance before merge.
2. Enforce code owners for platform/security review.
3. Record change reason in pull request description and release notes.
4. Run runtime smoke checks after deployment:
   - Connectivity check
   - Credential check
   - Read-only permission check
   - Scheduled trigger check (if applicable)

## 7. Per-Platform Notes

## GCP

1. Use service accounts with narrow IAM roles.
2. Prefer Workload Identity Federation over static keys where possible.
3. Scope resource strings to project and region to reduce blast radius.

## AWS

1. Use role assumption (`iam-role`) with short-lived credentials.
2. Restrict ARNs to required services/resources.
3. Prefer KMS-protected data paths and explicit deny for destructive operations.

## Snowflake

1. Keep dedicated technical roles and warehouses for automation agents.
2. Restrict agent rights to required databases/schemas/stages.
3. Use task/procedure execution grants rather than broad account-level privileges.

## ServiceNow

1. Use OAuth clients with constrained scopes.
2. Restrict table-level write access to required ITSM objects only.
3. Use assignment groups and routing conventions for automation-created tickets.

## 8. Stats Field Maintenance

When updating examples, keep these values accurate:

1. `platform_connection_count`: number of entries in `platform_connections`.
2. `agent_count`: number of entries in `agents`.
3. `active_agent_count`: number of agents with `status: active`.
4. `permission_rule_count`: sum of all permission rules across all agents.
