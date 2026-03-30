# Data Product Specification: Self-service model

## Product Summary

- Product name or pattern: `Self-service model`
- Producing component: `<semantic model, curated explore, analytics layer>`
- Product or asset type: `self-service explore`
- Delivery channel or destination: `Looker Explore or equivalent semantic exploration surface`
- Purpose: Allow users to answer questions by selecting fields and filters directly
- Scope or variant: `<domain explore, subject area, business function>`

## Naming and Trigger Path

- Naming or delivery pattern: `<explore name, semantic model name, business domain label>`
- Trigger event: `User-driven interactive query`
- Generation path: `<modelled/focused datasets -> semantic model -> self-service surface>`
- Destination path or recipient set: `<analytics workspace, explore catalog, approved user group>`
- Transport mechanism: `interactive`

## Runtime and Timing Rules

- Execution cadence: `On demand`
- Runtime parameters: `<user filters, date ranges, selected fields, row limits>`
- Time tokens or naming suffixes: `<explore version or release label>`
- Override or rerun behavior: `<cache refresh, semantic model republish>`
- Ordering constraints: `<upstream dataset refresh before semantic model publish>`

## Source Data Inputs

- `<silver or gold dataset>`
  - Role: Supplies curated data for user exploration
- `<semantic model definitions>`
  - Role: Defines metrics, joins, dimensions, and governed business logic
- `<access controls>`
  - Role: Restricts data visibility and field-level access

## Intermediate Data and Processing Layer

- Staging or intermediate objects: `<semantic layer views, cached aggregates, metadata definitions>`
- Materialization logic: `<how the explore model is refreshed and published>`
- Processing sequence: `<dataset refresh, semantic publish, user query execution>`

```text
<Self-service Access Pipeline>
1. Refresh underlying modelled or focused datasets
2. Publish semantic model definitions
3. Enable interactive user exploration
```

## Transformation Logic

### Step 1: Curate semantic model

Define fields, joins, and governed business semantics.

### Step 2: Publish exploration surface

Expose the model in a user-facing self-service tool.

### Step 3: Execute user queries

Return answers based on selected fields and filters.

## Business Requirements and Controls

- Required validations: `<metric validation, join validation, access validation>`
- Business rules: `<approved metrics, governed definitions, row-level controls>`
- Error handling: `<query error handling, semantic publish rollback, incident response>`
- Notification or audit requirements: `<usage audit, model publish log, access log>`
- Compliance or operational controls: `<field masking, approval workflow, access certification>`

## Operational Frequency

- Primary schedule: `On demand with scheduled model refresh`
- Expected volume or frequency: `<user sessions, query volume, domain usage>`
- SLA or review expectation: `<availability and query performance target>`

## Upstream-Downstream Lineage

### Upstream Producers

- `<silver or gold data products>`
- `<semantic modeling layer>`

### Processing Layer

- `<Looker model, BI semantic layer, cached query services>`

### Downstream Consumers

- `<analysts>`
- `<business users>`

## Evidence Anchors

| Evidence Source | Location | Detail |
|----------------|----------|--------|
| `<analytics model note>` | `<path or workspace>` | `<what proves self-service semantics>` |
| `<semantic config>` | `<model definition>` | `<what proves governed metrics and fields>` |
