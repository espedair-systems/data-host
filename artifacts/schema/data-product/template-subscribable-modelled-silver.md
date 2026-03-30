# Data Product Specification: Subscribable dataset - Modelled (Silver)

## Product Summary

- Product name or pattern: `Subscribable dataset - Modelled (Silver)`
- Producing component: `<silver transformation and publication layer>`
- Product or asset type: `subscribable dataset`
- Delivery channel or destination: `subscribable modelled tables`
- Purpose: Expose reusable transformed models to approved consumer projects
- Scope or variant: `<domain model, reusable subject area, environment>`

## Naming and Trigger Path

- Naming or delivery pattern: `<dataset and table naming convention>`
- Trigger event: `Successful modelled transformation cycle`
- Generation path: `<bronze data -> modelled transform -> silver publication -> subscription>`
- Destination path or recipient set: `<consumer projects and subscribed datasets>`
- Transport mechanism: `dataset-subscription`

## Runtime and Timing Rules

- Execution cadence: `Scheduled after upstream Raw refresh`
- Runtime parameters: `<transformation version, consumer scope, refresh window>`
- Time tokens or naming suffixes: `<release label, partition date>`
- Override or rerun behavior: `<rerun transformation, republish dataset, backfill>`
- Ordering constraints: `<Bronze availability before Silver publish>`

## Source Data Inputs

- `<bronze raw tables>`
  - Role: Primary input for reusable transformation logic
- `<transformation model>`
  - Role: Defines reusable joins, standardization, and shaping
- `<publication controls>`
  - Role: Governs publish readiness and subscription access

## Intermediate Data and Processing Layer

- Staging or intermediate objects: `<silver intermediate tables, views, quality checks>`
- Materialization logic: `<how reusable modelled outputs are built and published>`
- Processing sequence: `<transform, validate, publish, subscribe>`

```text
<Modelled Subscription Pipeline>
1. Transform Raw data into reusable modelled outputs
2. Validate and publish Silver dataset
3. Allow approved consumer projects to subscribe
```

## Transformation Logic

### Step 1: Apply reusable transformation model

Standardize and shape data into a multi-use-case model.

### Step 2: Validate modelled output

Check quality, completeness, and publish readiness.

### Step 3: Publish subscribable Silver dataset

Expose the reusable model for approved consumers.

## Business Requirements and Controls

- Required validations: `<quality checks, relationship checks, schema validation>`
- Business rules: `Silver provides reusable models or intermediate forms, not final business solutions`
- Error handling: `<publish failure, data quality breach, alerting>`
- Notification or audit requirements: `<transformation log, publication audit, access tracking>`
- Compliance or operational controls: `Consumer project required to subscribe`

## Operational Frequency

- Primary schedule: `Scheduled after Bronze refresh`
- Expected volume or frequency: `<dataset refresh frequency, subscriber count>`
- SLA or review expectation: `<time from Bronze availability to Silver availability>`

## Upstream-Downstream Lineage

### Upstream Producers

- `<bronze datasets>`
- `<silver transformation pipelines>`

### Processing Layer

- `<modelled publication controls and subscription management>`

### Downstream Consumers

- `<consumer projects>`
- `<analytics engineers and data teams>`

## Evidence Anchors

| Evidence Source | Location | Detail |
|----------------|----------|--------|
| `<transformation note>` | `<note or path>` | `<what proves Silver semantics>` |
| `<model config>` | `<pipeline or config object>` | `<what proves reusable transformation logic>` |
