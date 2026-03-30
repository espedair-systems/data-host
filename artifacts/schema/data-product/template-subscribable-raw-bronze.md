# Data Product Specification: Subscribable dataset - Raw (Bronze)

## Product Summary

- Product name or pattern: `Subscribable dataset - Raw (Bronze)`
- Producing component: `<raw dataset publication layer>`
- Product or asset type: `subscribable dataset`
- Delivery channel or destination: `subscribable raw tables`
- Purpose: Expose Raw (Bronze) tables to approved consumer projects
- Scope or variant: `<domain, source family, environment>`

## Naming and Trigger Path

- Naming or delivery pattern: `<dataset and table naming convention>`
- Trigger event: `Successful source ingestion completion`
- Generation path: `<raw landing -> dataset publication -> consumer subscription>`
- Destination path or recipient set: `<consumer projects and subscribed datasets>`
- Transport mechanism: `dataset-subscription`

## Runtime and Timing Rules

- Execution cadence: `Per successful source ingestion cycle`
- Runtime parameters: `<consumer project, subscription scope, dataset version>`
- Time tokens or naming suffixes: `<partition date, batch id>`
- Override or rerun behavior: `<subscription refresh, backfill, access change>`
- Ordering constraints: `<raw landing completion before subscription exposure>`

## Source Data Inputs

- `<bronze raw tables>`
  - Role: Primary subscribed dataset content
- `<subscription controls>`
  - Role: Governs eligible projects and access scope
- `<publication metadata>`
  - Role: Describes dataset version and refresh state

## Intermediate Data and Processing Layer

- Staging or intermediate objects: `<publication views, access controls, metadata registry>`
- Materialization logic: `<how raw datasets are exposed for subscription>`
- Processing sequence: `<land, publish, grant, consume>`

```text
<Raw Subscription Pipeline>
1. Complete Raw landing
2. Publish subscribable Raw dataset
3. Allow approved consumer projects to subscribe
```

## Transformation Logic

### Step 1: Validate Raw publication readiness

Check that ingestion completed and publication controls are satisfied.

### Step 2: Publish subscribable Raw dataset

Expose source-aligned tables to approved consumers.

### Step 3: Enable subscription access

Grant or maintain consumer project subscription.

## Business Requirements and Controls

- Required validations: `<ingestion success, access control, metadata completeness>`
- Business rules: `No business transformation beyond source-aligned Raw semantics`
- Error handling: `<publication failure, subscription failure, alerting>`
- Notification or audit requirements: `<access audit, publication log, usage tracking>`
- Compliance or operational controls: `Consumer project required to subscribe`

## Operational Frequency

- Primary schedule: `Aligned to source ingestion cadence`
- Expected volume or frequency: `<dataset refresh frequency, consumer count>`
- SLA or review expectation: `<time from load completion to subscription availability>`

## Upstream-Downstream Lineage

### Upstream Producers

- `<source-to-raw ingestion products>`
- `<raw dataset publication layer>`

### Processing Layer

- `<dataset publication controls and subscription management>`

### Downstream Consumers

- `<consumer projects>`
- `<technical data teams>`

## Evidence Anchors

| Evidence Source | Location | Detail |
|----------------|----------|--------|
| `<subscription note>` | `<note or path>` | `<what proves Bronze subscription semantics>` |
| `<access config>` | `<access control object>` | `<what proves consumer project requirement>` |
