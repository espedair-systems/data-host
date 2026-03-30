# Data Product Specification: Ingestion - Source to Raw (Bronze)

## Product Summary

- Product name or pattern: `Ingestion - Source to Raw (Bronze)`
- Producing component: `<source connector, ingestion service, or orchestrated pipeline>`
- Product or asset type: `ingestion pipeline`
- Delivery channel or destination: `<raw bronze landing tables, raw zone dataset, or landing schema>`
- Purpose: Land source-system data into Raw (Bronze) form with source-aligned structure
- Scope or variant: `<source system, domain, region, or environment>`

## Naming and Trigger Path

- Naming or delivery pattern: `<source system to bronze dataset/table naming convention>`
- Trigger event: `<scheduled extract | CDC cycle | manual backfill | operational rerun>`
- Generation path: `<source extract -> ingest pipeline -> raw landing tables>`
- Destination path or recipient set: `<dataset, schema, project, or table family>`
- Transport mechanism: `ingestion pipeline`

## Runtime and Timing Rules

- Execution cadence: `<hourly | daily | event-driven | ad hoc>`
- Runtime parameters: `<source window, watermark, extract date, batch id>`
- Time tokens or naming suffixes: `<batch timestamp, partition date, load id>`
- Override or rerun behavior: `<replay, backfill, partial reload, overwrite rules>`
- Ordering constraints: `<what upstream source conditions must complete first>`

## Source Data Inputs

- `<source system extract or API response>`
  - Role: Primary source payload landed into Bronze
- `<source metadata or control table>`
  - Role: Defines extraction scope and watermark state
- `<ingestion configuration>`
  - Role: Controls mapping, partitioning, and load behavior

## Intermediate Data and Processing Layer

- Staging or intermediate objects: `<landing files, transient batches, control tables>`
- Materialization logic: `<how source payload is staged before final raw landing>`
- Processing sequence: `<extract, validate, land, reconcile>`

```text
<Source to Raw Pipeline>
1. Extract source-system data
2. Apply technical validation and landing controls
3. Write source-aligned records to Raw (Bronze)
```

## Transformation Logic

### Step 1: Extract source payload

Capture source-system records with minimal reshaping.

### Step 2: Apply technical landing controls

Validate file, schema, partition, and batch metadata before landing.

### Step 3: Publish Raw (Bronze)

Write source-aligned records to Bronze for downstream transformation.

## Business Requirements and Controls

- Required validations: `<schema conformity, row count checks, watermark checks>`
- Business rules: `No business transformation beyond technical landing controls`
- Error handling: `<quarantine, retry, alerting, dead-letter handling>`
- Notification or audit requirements: `<run log, batch audit, reconciliation output>`
- Compliance or operational controls: `<access control, retention, replay governance>`

## Operational Frequency

- Primary schedule: `<source-aligned schedule>`
- Expected volume or frequency: `<batch count, table count, partition frequency>`
- SLA or review expectation: `<landing availability expectation>`

## Upstream-Downstream Lineage

### Upstream Producers

- `<source application or operational database>`
- `<source integration or extraction service>`

### Processing Layer

- `<UDP ingestion pipeline, landing service, raw dataset publication>`

### Downstream Consumers

- `<silver transformation pipelines>`
- `<technical data consumers>`

## Evidence Anchors

| Evidence Source | Location | Detail |
|----------------|----------|--------|
| `<platform note>` | `<note or path>` | `<what proves source-to-raw semantics>` |
| `<pipeline config>` | `<config or orchestrator object>` | `<what proves runtime behavior>` |
