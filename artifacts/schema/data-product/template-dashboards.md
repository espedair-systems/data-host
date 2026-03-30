# Data Product Specification: Dashboards

## Product Summary

- Product name or pattern: `Dashboards`
- Producing component: `<BI publishing layer, reporting service, dashboard workspace>`
- Product or asset type: `dashboard`
- Delivery channel or destination: `PowerBI dashboard, Looker dashboard, or similar visual reporting surface`
- Purpose: Present curated visual answers to specific business questions
- Scope or variant: `<executive dashboard, operational dashboard, domain dashboard>`

## Naming and Trigger Path

- Naming or delivery pattern: `<dashboard title, workspace naming convention, release version>`
- Trigger event: `Scheduled refresh or manual publication`
- Generation path: `<modelled/focused datasets -> BI model -> dashboard publication>`
- Destination path or recipient set: `<workspace, app, user group, stakeholder audience>`
- Transport mechanism: `curated-visual`

## Runtime and Timing Rules

- Execution cadence: `<scheduled refresh plus on-demand viewing>`
- Runtime parameters: `<filter defaults, period parameters, audience-specific variants>`
- Time tokens or naming suffixes: `<reporting period or release version>`
- Override or rerun behavior: `<manual refresh, republish, rollback>`
- Ordering constraints: `<upstream dataset refresh before dashboard refresh>`

## Source Data Inputs

- `<silver or gold dataset>`
  - Role: Supplies underlying reporting data
- `<dashboard semantic model>`
  - Role: Defines visuals, metrics, and filtering behavior
- `<publishing configuration>`
  - Role: Controls audience and refresh settings

## Intermediate Data and Processing Layer

- Staging or intermediate objects: `<BI models, extracts, cached query results>`
- Materialization logic: `<how dashboard datasets and visuals are refreshed>`
- Processing sequence: `<refresh model, render visuals, publish dashboard>`

```text
<Dashboard Delivery Pipeline>
1. Refresh curated reporting datasets
2. Refresh dashboard model and visuals
3. Publish dashboard to target audience
```

## Transformation Logic

### Step 1: Prepare reporting model

Ensure metrics and dimensions align with approved reporting definitions.

### Step 2: Refresh dashboard visuals

Update charts, filters, and summary objects.

### Step 3: Publish curated output

Make the dashboard available to the target audience.

## Business Requirements and Controls

- Required validations: `<metric validation, filter validation, dashboard QA>`
- Business rules: `<approved KPIs, reporting definitions, display rules>`
- Error handling: `<refresh failure handling, notification, rollback>`
- Notification or audit requirements: `<publish log, access audit, refresh log>`
- Compliance or operational controls: `<role-based access, review and sign-off>`

## Operational Frequency

- Primary schedule: `<daily, weekly, monthly, business cycle aligned>`
- Expected volume or frequency: `<dashboard views, refresh count, audience size>`
- SLA or review expectation: `<refresh completion window>`

## Upstream-Downstream Lineage

### Upstream Producers

- `<silver or gold subscription product>`
- `<semantic or BI model>`

### Processing Layer

- `<dashboard service, render engine, workspace publication>`

### Downstream Consumers

- `<decision makers>`
- `<operational teams>`

## Evidence Anchors

| Evidence Source | Location | Detail |
|----------------|----------|--------|
| `<dashboard note>` | `<workspace or note>` | `<what proves dashboard business purpose>` |
| `<refresh config>` | `<BI configuration object>` | `<what proves timing and audience>` |
