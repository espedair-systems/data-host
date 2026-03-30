# Data Product Specification: UDP Data Product Access Modes

## Product Summary

- Product name or pattern: UDP data product access modes
- Producing component: Unified Data Platform (UDP)
- Product or asset type: ingestion pipeline, event ingestion, external file feed, self-service explore, dashboard, subscribable dataset, outbound delivery
- Delivery channel or destination: ingestion pipeline, event endpoint/stream, landing zone/file delivery, Looker Explore, PowerBI dashboard, Looker dashboard, subscribable tables, outbound managed delivery
- Purpose: Enable users to answer business questions through governed data products at different transformation levels
- Scope or variant: Ingress, Access, Subscription, Egress across Bronze (raw), Silver (modelled), Gold (focused)

## Naming and Trigger Path

- Naming or delivery pattern: Access mode selected by user or consuming team use case
- Trigger event: User query, dashboard publication, consumer subscription request
- Generation path: Source ingest to transformation layer to publication surface (Explore, dashboard, table subscription)
- Destination path or recipient set: Business users, analysts, and consumer projects
- Transport mechanism: Interactive query surfaces or table subscription through approved consumer projects

## Runtime and Timing Rules

- Execution cadence: On-demand for self-service and dashboards; schedule-dependent for subscribed tables
- Runtime parameters: Product filters, selected fields, time windows, and consumer project context
- Time tokens or naming suffixes: Environment-specific and pipeline-specific naming conventions
- Override or rerun behavior: Subscription refresh and transformation rerun controlled by pipeline operations
- Ordering constraints: Bronze published before Silver; Silver published before Gold for dependent models

## Source Data Inputs

- Source-system raw datasets
  - Role: Provide original records in source-defined format for Bronze products
- Modelled transformation pipelines
  - Role: Standardize and reshape data into reusable business models for Silver products
- Business-problem specific transformation logic
  - Role: Produce fit-for-purpose Gold products aligned to agreed definitions

## Intermediate Data and Processing Layer

Describe the layer between source inputs and the final artifact.

- Staging or intermediate objects: Bronze and Silver datasets, transformation jobs, semantic models
- Materialization logic: Layered transformations from source-preserving to modelled to focused outputs
- Processing sequence: Ingest to model to business-focused publish

Optional structured view:

```text
<UDP Data Product Pipeline>
1. Ingest source data as Raw (Bronze)
2. Transform into reusable models as Modelled (Silver)
3. Transform into use-case outputs as Focused (Gold)
4. Publish via Explore, Dashboard, or Subscribable Tables
```

## Transformation Logic

### Step 1: Raw (Bronze)

Data is published in source-system format with minimal transformation. This supports lineage transparency and reusability for downstream modelling.

### Step 2: Modelled (Silver)

Data is transformed into a general purpose model serving multiple use cases, or an intermediate form that is not yet a full business solution.

### Step 3: Focused (Gold)

Data is transformed to solve a specific business problem with well-understood logic and agreed business definitions.

## Business Requirements and Controls

- Required validations: Data contract and schema checks per layer
- Business rules: Layer definitions must remain consistent (Bronze = source format, Silver = reusable model, Gold = business-focused)
- Error handling: Failed transformations or refreshes are handled by pipeline operational controls
- Notification or audit requirements: Standard platform audit logging for publishes and subscriptions
- Compliance or operational controls: Access is controlled through approved consumer projects for subscribable datasets
- Governance metadata: Each product should carry lifecycle status, owner, and steward assignments
- Lineage metadata: Each product should identify a producer system and primary consumers
- Operational metadata: Each product should define an SLA and refresh expectation
- Evidence metadata: Each product should include evidence anchors to notes, code, config, or operating models

## Operational Frequency

- Primary schedule: Mixed model (on-demand exploration and dashboard use; scheduled data refresh for subscribed datasets)
- Expected volume or frequency: Varies by consumer demand and pipeline cadence
- SLA or review expectation: Defined by platform operations and product-level agreements

## Upstream-Downstream Lineage

### Upstream Producers

- Source systems feeding UDP
- Data transformation pipelines

### Processing Layer

- Bronze, Silver, Gold transformation and publication flow

### Downstream Consumers

- Self-service users in Looker Explore
- Dashboard users in PowerBI or Looker
- Consumer projects subscribed to table datasets

## Evidence Anchors

| Evidence Source | Location | Detail |
|----------------|----------|--------|
| UDP data product notes | stakeholder notes | Defines access modes and Bronze/Silver/Gold semantics |
| Platform operating model | UDP delivery patterns | Defines subscription requirement for consumer projects |

## Data Product Types Captured

### Ingress products

#### Ingestion data product (Source to Raw)

- Group: ingress
- Lifecycle: active
- Owner: UDP Platform Team
- Steward: UDP Ingestion Operations
- Producer system: UDP Ingestion Pipeline
- Primary consumers: UDP Transformation Pipelines, Technical Data Consumers
- SLA: Data landed and available within 4 hours of scheduled source extract completion
- Refresh expectation: Per source ingestion schedule or on approved backfill request
- Evidence anchors: UDP platform notes; platform operating model for ingestion and raw landing
- Description: Pipeline product that ingests source-system data and lands it to Raw (Bronze)
- Typical surface: Ingestion pipeline
- Transformation level: Bronze (source-aligned landing)
- Primary consumer: Platform transformation pipelines and technical data consumers
- Requirement: Approved source connector and ingestion configuration

#### Feed data product (External File to Raw)

- Group: ingress
- Lifecycle: active
- Owner: UDP Platform Team
- Steward: UDP Ingestion Operations
- Producer system: External Feed Landing Service
- Primary consumers: UDP Ingestion Pipeline, UDP Transformation Pipelines
- SLA: External feed files processed and landed within 2 hours of successful receipt
- Refresh expectation: On file arrival according to external feed delivery schedule
- Evidence anchors: UDP platform notes; external feed operating model for landing controls
- Description: File-based product that receives an external source data feed and lands it to Raw (Bronze)
- Typical surface: Landing zone or managed file delivery
- Transformation level: Bronze (source-aligned landing)
- Primary consumer: Platform ingestion and downstream transformation pipelines
- Requirement: Approved external feed contract, landing zone, and ingestion configuration

#### Event ingestion data product (Event to Raw)

- Group: ingress
- Lifecycle: active
- Owner: UDP Platform Team
- Steward: UDP Streaming Operations
- Producer system: UDP Event Ingestion Service
- Primary consumers: UDP Streaming Consumers, UDP Transformation Pipelines
- SLA: Events available in Raw tables within 15 minutes of successful event receipt
- Refresh expectation: Near real-time continuous ingestion
- Evidence anchors: UDP platform notes; streaming operating model for near real-time landing
- Description: Event-driven product that receives source events or messages and lands them to Raw (Bronze)
- Typical surface: Event endpoint, topic, queue, or stream ingestion service
- Transformation level: Bronze (source-aligned landing)
- Primary consumer: Platform streaming ingestion and downstream transformation pipelines
- Requirement: Approved event contract, ingestion endpoint, and streaming configuration

### Access products

#### Self-service model

- Group: access
- Lifecycle: active
- Owner: UDP Analytics Enablement
- Steward: Semantic Model Stewardship
- Producer system: UDP Semantic Model Layer
- Primary consumers: Analysts, Business Users
- SLA: Explore surface available during business hours with platform-standard query performance
- Refresh expectation: Aligned to underlying semantic model refresh cadence
- Evidence anchors: UDP platform notes; analytics operating model for Explore publication
- Description: Users drag and drop fields to answer questions directly
- Typical surface: Looker Explore
- Primary consumer: Analysts and business users

#### Dashboards

- Group: access
- Lifecycle: active
- Owner: UDP Analytics Enablement
- Steward: Dashboard Operations
- Producer system: UDP BI Publishing Layer
- Primary consumers: Decision Makers, Operational Teams
- SLA: Published dashboards refreshed and available by agreed reporting window
- Refresh expectation: Scheduled dashboard refresh based on underlying dataset cadence
- Evidence anchors: UDP platform notes; BI publication model for dashboard refresh and publication
- Description: Curated visual representation built to answer a known question
- Typical surface: PowerBI dashboard or Looker dashboard
- Primary consumer: Decision-makers and operational teams

### Egress products

#### Published external delivery

- Group: egress
- Lifecycle: active
- Owner: UDP Data Delivery Team
- Steward: Outbound Delivery Operations
- Producer system: UDP Outbound Delivery Service
- Primary consumers: External Recipients, Regulators, Partner Platforms
- SLA: Outbound data delivered within the agreed regulatory or partner reporting window
- Refresh expectation: Per agreed outbound schedule, event trigger, or reporting cycle
- Evidence anchors: UDP delivery model; partner or regulatory contract defining outbound obligations
- Description: Outbound product that packages approved UDP data for delivery to external consumers, regulators, or partner platforms
- Typical surface: Managed outbound file or API delivery
- Transformation level: Typically Gold, where outbound definitions are explicit and controlled
- Primary consumer: External recipients, regulators, and partner platforms
- Requirement: Approved outbound contract, recipient registration, and delivery control configuration

### Subscription products

#### Subscribable datasets

#### Raw (Bronze)

- Group: subscription
- Lifecycle: active
- Owner: UDP Platform Team
- Steward: Dataset Subscription Operations
- Producer system: UDP Dataset Publication Layer
- Primary consumers: Consumer Projects, Technical Data Teams
- SLA: Raw subscription datasets available after successful ingestion completion
- Refresh expectation: Refreshed on each successful source ingestion cycle
- Evidence anchors: UDP platform notes; subscription operating model for Bronze access controls
- Format: Subscribable tables
- Transformation level: No transformation beyond source extraction format
- Requirement: Consumer project required to subscribe

#### Modelled (Silver)

- Group: subscription
- Lifecycle: active
- Owner: UDP Platform Team
- Steward: Dataset Subscription Operations
- Producer system: UDP Dataset Publication Layer
- Primary consumers: Consumer Projects, Analytics Engineers, Data Teams
- SLA: Modelled datasets refreshed within 4 hours of dependent Bronze data availability
- Refresh expectation: Scheduled transformation cycle after upstream Raw refresh
- Evidence anchors: UDP platform notes; transformation operating model for Silver publication
- Format: Subscribable tables
- Transformation level: General-purpose model or intermediate transformation layer
- Requirement: Consumer project required to subscribe

#### Focused (Gold)

- Group: subscription
- Lifecycle: active
- Owner: UDP Platform Team
- Steward: Dataset Subscription Operations
- Producer system: UDP Dataset Publication Layer
- Primary consumers: Consumer Projects, Business Domain Teams, Reporting Consumers
- SLA: Focused datasets refreshed in time for agreed business or reporting commitments
- Refresh expectation: Scheduled or event-based refresh aligned to business use case requirements
- Evidence anchors: UDP platform notes; business delivery model for Gold publication
- Format: Subscribable tables
- Transformation level: Business-problem-specific transformation with clear definitions
- Requirement: Consumer project required to subscribe
