# Data Product Specification: Feed - External File to Raw (Bronze)

## Product Summary

- Product name or pattern: `Feed - External File to Raw (Bronze)`
- Producing component: `<external party, managed file transfer, landing service>`
- Product or asset type: `external file feed`
- Delivery channel or destination: `<landing zone, raw bronze dataset, inbound folder>`
- Purpose: Receive external file feeds and land them into Raw (Bronze) structures
- Scope or variant: `<provider, format, frequency, jurisdiction, environment>`

## Naming and Trigger Path

- Naming or delivery pattern: `<file naming convention and landing path>`
- Trigger event: `File arrival or scheduled delivery window`
- Generation path: `<external sender -> landing zone -> ingestion pipeline -> bronze tables>`
- Destination path or recipient set: `<landing location and target raw tables>`
- Transport mechanism: `file-delivery`

## Runtime and Timing Rules

- Execution cadence: `<daily | weekly | monthly | ad hoc>`
- Runtime parameters: `<delivery date, batch id, file type, sender id>`
- Time tokens or naming suffixes: `<yyyymmdd, timestamp, batch marker>`
- Override or rerun behavior: `<reprocess landed files, replay batch, replace file>`
- Ordering constraints: `<validation before raw load, control totals before publish>`

## Source Data Inputs

- `<external source file>`
  - Role: Primary inbound payload
- `<feed manifest or control file>`
  - Role: Defines batch completeness and expected counts
- `<landing configuration>`
  - Role: Controls file parsing and landing behavior

## Intermediate Data and Processing Layer

- Staging or intermediate objects: `<landing folder, quarantine folder, manifest table>`
- Materialization logic: `<how files are validated and parsed before bronze load>`
- Processing sequence: `<receive, validate, parse, land>`

```text
<External Feed to Raw Pipeline>
1. Receive external file in landing zone
2. Validate file naming, schema, and completeness
3. Load source-aligned records to Raw (Bronze)
```

## Transformation Logic

### Step 1: Receive file

Accept file into managed landing controls.

### Step 2: Validate inbound contract

Check file format, naming, manifest, and control totals.

### Step 3: Publish Raw (Bronze)

Load records into source-aligned Bronze tables.

## Business Requirements and Controls

- Required validations: `<filename, schema, row count, duplicate delivery checks>`
- Business rules: `Preserve source representation except for technical parsing controls`
- Error handling: `<move to quarantine, reject, notify sender, create incident>`
- Notification or audit requirements: `<arrival log, processing log, batch reconciliation>`
- Compliance or operational controls: `<retention, encryption, sender allowlist>`

## Operational Frequency

- Primary schedule: `<file delivery schedule>`
- Expected volume or frequency: `<files per cycle, expected size, periodicity>`
- SLA or review expectation: `<time from receipt to Bronze availability>`

## Upstream-Downstream Lineage

### Upstream Producers

- `<external source or partner>`
- `<managed transfer service>`

### Processing Layer

- `<landing service, ingestion pipeline, bronze publication>`

### Downstream Consumers

- `<raw subscribers or silver transformation pipelines>`
- `<operations and reconciliation users>`

## Evidence Anchors

| Evidence Source | Location | Detail |
|----------------|----------|--------|
| `<feed contract>` | `<path or agreement>` | `<what proves file layout and delivery obligations>` |
| `<landing configuration>` | `<path or service object>` | `<what proves landing and validation behavior>` |
