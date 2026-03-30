# Data Product Specification: Event Ingestion to Raw (Bronze)

## Product Summary

- Product name or pattern: `Event Ingestion to Raw (Bronze)`
- Producing component: `<event source, topic publisher, streaming ingestion service>`
- Product or asset type: `event ingestion`
- Delivery channel or destination: `<topic, queue, event endpoint, raw bronze dataset>`
- Purpose: Ingest source events/messages into Raw (Bronze) with source-aligned structure
- Scope or variant: `<event family, topic, domain, environment>`

## Naming and Trigger Path

- Naming or delivery pattern: `<topic, queue, stream, or endpoint naming pattern>`
- Trigger event: `Event emission from source system`
- Generation path: `<source event -> event bus -> ingestion service -> raw bronze tables>`
- Destination path or recipient set: `<topic subscription, stream target, bronze table family>`
- Transport mechanism: `ingestion-pipeline`

## Runtime and Timing Rules

- Execution cadence: `Near real-time or continuous`
- Runtime parameters: `<consumer group, partition, watermark, replay window>`
- Time tokens or naming suffixes: `<event time, ingest time, partition key>`
- Override or rerun behavior: `<replay window, dead-letter reprocessing, offset reset>`
- Ordering constraints: `<event ordering, idempotency, partition sequencing>`

## Source Data Inputs

- `<event payload>`
  - Role: Primary business event content
- `<event metadata>`
  - Role: Carries keys, timestamps, and routing attributes
- `<stream configuration>`
  - Role: Controls subscriptions, checkpointing, and replay behavior

## Intermediate Data and Processing Layer

- Staging or intermediate objects: `<stream buffers, dead-letter queues, checkpoints>`
- Materialization logic: `<how messages are validated and persisted before Bronze publication>`
- Processing sequence: `<consume, validate, checkpoint, land>`

```text
<Event to Raw Pipeline>
1. Consume source events or messages
2. Validate event envelope and payload structure
3. Land source-aligned events into Raw (Bronze)
```

## Transformation Logic

### Step 1: Consume event stream

Read source messages from the configured endpoint or topic.

### Step 2: Apply streaming controls

Validate schema, checkpoint progress, and manage dead-letter handling.

### Step 3: Publish Raw (Bronze)

Persist source-aligned event records for downstream transformation and analysis.

## Business Requirements and Controls

- Required validations: `<event schema, idempotency, ordering, duplicate detection>`
- Business rules: `Retain event semantics with minimal technical normalization`
- Error handling: `<dead-letter queue, retry policy, replay, incident response>`
- Notification or audit requirements: `<lag monitoring, offset tracking, processing audit>`
- Compliance or operational controls: `<retention, event security, endpoint access control>`

## Operational Frequency

- Primary schedule: `Continuous`
- Expected volume or frequency: `<events per second/minute/hour>`
- SLA or review expectation: `<maximum lag or time-to-land expectation>`

## Upstream-Downstream Lineage

### Upstream Producers

- `<event-producing application>`
- `<event bus or messaging service>`

### Processing Layer

- `<stream consumer, checkpointing service, bronze landing pipeline>`

### Downstream Consumers

- `<streaming consumers>`
- `<silver transformation pipelines>`

## Evidence Anchors

| Evidence Source | Location | Detail |
|----------------|----------|--------|
| `<stream contract>` | `<topic schema or contract>` | `<what proves event structure>` |
| `<consumer config>` | `<service or config path>` | `<what proves lag, replay, and landing behavior>` |
