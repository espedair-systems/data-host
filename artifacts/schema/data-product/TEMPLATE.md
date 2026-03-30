# Data Product Specification: <artifact name or pattern>

## Product Summary

- Product name or pattern: `<artifact pattern>`
- Producing component: `<job, service, package, script, module>`
- Product or asset type: `<csv | xlsx | email | log | folder move | table extract | report>`
- Delivery channel or destination: `<folder path | SMTP | shared drive | database | API>`
- Purpose: `<why this artifact exists>`
- Scope or variant: `<optional variant, fund scope, format version, or run context>`

## Naming and Trigger Path

- Naming or delivery pattern: `<file name pattern, folder move rule, or message type>`
- Trigger event: `<job completion | schedule | file arrival | manual run | exception>`
- Generation path: `<main call chain, package flow, or orchestration path>`
- Destination path or recipient set: `<output path, folder, mailbox, recipient list>`
- Transport mechanism: `<file write | move | email send | API post>`

## Runtime and Timing Rules

- Execution cadence: `<daily | quarterly | event-driven | ad hoc>`
- Runtime parameters: `<date parameters, flags, environment settings>`
- Time tokens or naming suffixes: `<YYYYMMDD | yyyymmddhhmm | period end>`
- Override or rerun behavior: `<backfill, rerun, archive, overwrite rules>`
- Ordering constraints: `<what must happen before this artifact is emitted>`

## Source Data Inputs

- `<input file, table, config key, or variable>`
  - Role: `<how it contributes to the output>`
- `<input file, table, config key, or variable>`
  - Role: `<how it contributes to the output>`
- `<input file, table, config key, or variable>`
  - Role: `<how it contributes to the output>`

## Intermediate Data and Processing Layer

Describe the layer between source inputs and the final artifact.

- Staging or intermediate objects: `<tables, temp files, variables, attachments, queues>`
- Materialization logic: `<how intermediate state is built or refreshed>`
- Processing sequence: `<ordered steps or pipeline summary>`

Optional structured view:

```text
<Data Product Pipeline>
1. <first stage>
2. <second stage>
3. <final stage>
```

## Transformation Logic

### Step 1: <name>

Describe the first transformation or control step.

### Step 2: <name>

Describe the next transformation or assembly step.

### Step 3: <name>

Describe final formatting, publication, or delivery.

## Business Requirements and Controls

- Required validations: `<mandatory checks and accepted values>`
- Business rules: `<classification, exclusions, scaling, formatting, routing>`
- Error handling: `<what happens on failure>`
- Notification or audit requirements: `<logs, emails, event log, audit trail>`
- Compliance or operational controls: `<regulatory rules, overwrite behavior, quarantine behavior>`

## Operational Frequency

- Primary schedule: `<daily, monthly, quarter-end, on demand>`
- Expected volume or frequency: `<once per run, per fund, per inbound file, exception only>`
- SLA or review expectation: `<if applicable>`

## Upstream-Downstream Lineage

### Upstream Producers

- `<system, file feed, package, table, or function>`
- `<system, file feed, package, table, or function>`

### Processing Layer

- `<intermediate tables, orchestrator, runtime variables, package pipeline>`

### Downstream Consumers

- `<team, regulator, downstream process, shared folder, reporting user>`
- `<team, regulator, downstream process, shared folder, reporting user>`

## Evidence Anchors

| Evidence Source | Location | Detail |
|----------------|----------|--------|
| `<code file or note>` | `<path or object>` | `<what it proves>` |
| `<config or inventory>` | `<path or object>` | `<what it proves>` |

## Optional Sections

Add any of these only when they are useful for the artifact:

- `## Operational Context`
- `## Variant Covered by This Spec`
- `## Notification Chain`
- `## Error Scenarios`
- `## Inventory Reference`
- `## Related Specs`
- `## Known Gaps or Assumptions`