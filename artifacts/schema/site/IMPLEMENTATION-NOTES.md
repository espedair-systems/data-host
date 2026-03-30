# Astro Site Management Implementation Notes

This document provides practical guidance for implementing Astro site management artifacts based on:

- astro-site-management.schema.json
- astro-site-management.example.json

## Purpose

Use this schema to standardize management of Astro sites across build, deployment, environment, content, and operational controls, including:

- repository and release governance
- build and adapter consistency
- deployment strategy and environment mapping
- content collection controls
- security and observability configuration references

## Recommended Implementation Sequence

1. Define package metadata first
- Set name, version, source, and generated_at_utc.
- Keep semantic versioning aligned with governance and release changes.

2. Define governance ownership
- Populate owner, steward, approval_status, and approved_at.
- Promote to approved only after environment and deployment controls are validated.

3. Register site records
- Add site_id, site_name, framework, status, repo, build, deploy, and environments.
- Keep framework fixed to astro for consistency checks.

4. Define repository and domain settings
- Set provider, full_name, default_branch, and optional path for monorepos.
- Register primary, alias, and preview domains with TLS mode.

5. Configure build and deploy behavior
- Define node_version, package_manager, install_command, build_command, and output_mode.
- Add adapter for server or hybrid output when required.
- Set deployment target and release strategy.

6. Define environment mappings
- Register env_id and env_type values for lifecycle stages.
- Map base_url and branch.
- Store only env_var_refs, never secret values directly.

7. Define content and integrations
- Register Astro content collections with source and schema_mode.
- Add integration records for adapters, analytics, monitoring, CMS, search, and auth.

8. Define security and observability references
- Set auth_mode and WAF posture.
- Link headers, analytics, logging, and uptime monitor references.

9. Populate optional stats
- Keep site, environment, domain, collection, and integration counts synchronized.

## Site Modeling Guidance

Required site fields:

- site_id
- site_name
- framework
- repo
- build
- deploy
- environments
- status

Best practices:

- Use stable site_id values independent of domain or repository rename risk.
- Keep status aligned to operational support lifecycle.
- Use tags for grouping only, not policy enforcement.

## Build and Deploy Guidance

Build recommendations:

- Pin node_version to supported LTS range.
- Prefer deterministic install commands such as npm ci or pnpm install --frozen-lockfile.
- Keep output_mode aligned to hosting capabilities.

Deploy strategy guidance:

- branch-based for rapid preview and continuous delivery workflows.
- promote-artifact for controlled release assurance.
- manual or scheduled for high-control environments.

## Environment Guidance

Environment type usage:

- dev for active development
- test or uat for validation
- stage for pre-production readiness
- prod for live traffic
- preview for ephemeral review builds

Best practices:

- Keep branch mapping explicit for reproducibility.
- Keep env_var_refs in secret managers or platform settings only.
- Mark inactive environments explicitly rather than deleting history.

## Content and Integration Guidance

Content collection practices:

- strict schema_mode for regulated or critical content.
- permissive schema_mode for exploratory or less-structured content.
- Keep collection_id stable across releases.

Integration practices:

- Keep integration_id stable and descriptive.
- Use config_ref to link to source-of-truth configuration.
- Disable unused integrations by setting status inactive.

## Security and Observability Guidance

Security practices:

- Use oidc for internal protected sites where identity federation is required.
- Use headers_policy_ref to enforce consistent security headers.
- Enable WAF for internet-facing production sites.

Observability practices:

- Define analytics and logging providers per site.
- Maintain uptime monitor references for production and critical non-prod environments.

## Governance and Versioning

Recommended governance lifecycle:

1. draft
2. review
3. approved
4. deprecated

Versioning approach:

- major for breaking schema usage or site structure changes
- minor for additive sites, environments, or integrations
- patch for non-breaking corrections

## Validation and Testing Checklist

Before release:

- JSON validates against astro-site-management.schema.json.
- Every site framework is astro.
- Build output_mode and adapter combination is valid for deployment target.
- Environment base_url and branch values are set for active environments.
- No secrets are embedded in env_var_refs or config_ref fields.
- Domain definitions include primary host where required.
- Stats values match current payload counts.

## Common Pitfalls to Avoid

- Missing adapter when output_mode requires runtime support
- Inconsistent branch-to-environment mapping
- Deploying with unmanaged preview domains and TLS drift
- Embedding credentials directly in schema artifacts
- Stale stats after adding or removing sites or environments

## Suggested Companion Artifacts

- RUNBOOK.md for deployment and rollback procedures
- RELEASE-CONTROLS.md for promotion and approval gates
- INCIDENT-PLAYBOOK.md for outage response and mitigation
- CHANGELOG.md for site portfolio evolution history
