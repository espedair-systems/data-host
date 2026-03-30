# UDP Data Products Summary

Catalog of all Universal Data Platform (UDP) data product types organized by grouping and transformation tier.

**Last updated:** 2026-03-29  
**Source:** `example-data/udp-data-products.json`  
**Schema:** `data-product-catalog.schema.json`

---

## Product Groups

Products are organized into logical access/ingress/egress patterns:

| Group | Purpose | Count |
|-------|---------|-------|
| **ingress** | Source-aligned entry points for external data | 3 |
| **access** | User-facing exploration and reporting surfaces | 2 |
| **subscription** | Reusable dataset subscriptions at varying transformation tiers | 3 |
| **egress** | Outbound delivery to external consumers and regulators | 1 |

---

## Ingress Products (Bronze)

Entry points for external data into UDP raw landing zones.

### 1. Ingestion - Source to Raw (Bronze)
- **Product ID:** `ingestion_source_to_raw`  
- **Owner:** UDP Platform Team  
- **Steward:** UDP Ingestion Operations  
- **Producer System:** UDP Ingestion Pipeline  
- **Delivery Type:** Ingestion pipeline  
- **SLA:** Data landed and available within 4 hours of scheduled source extract completion  
- **Refresh Expectation:** Per source ingestion schedule or on approved backfill request  
- **Primary Consumers:** UDP Transformation Pipelines, Technical Data Consumers  
- **Consumer Requirement:** Approved source connector and platform ingestion configuration

### 2. Feed - External File to Raw (Bronze)
- **Product ID:** `external_file_feed_to_raw`  
- **Owner:** UDP Platform Team  
- **Steward:** UDP Ingestion Operations  
- **Producer System:** External Feed Landing Service  
- **Delivery Type:** File delivery  
- **SLA:** External feed files processed and landed within 2 hours of successful receipt  
- **Refresh Expectation:** On file arrival according to external feed delivery schedule  
- **Primary Consumers:** UDP Ingestion Pipeline, UDP Transformation Pipelines  
- **Consumer Requirement:** Approved external feed contract, landing zone, and ingestion configuration

### 3. Event Ingestion to Raw (Bronze)
- **Product ID:** `event_ingestion_to_raw`  
- **Owner:** UDP Platform Team  
- **Steward:** UDP Streaming Operations  
- **Producer System:** UDP Event Ingestion Service  
- **Delivery Type:** Ingestion pipeline  
- **SLA:** Events available in Raw tables within 15 minutes of successful event receipt  
- **Refresh Expectation:** Near real-time continuous ingestion  
- **Primary Consumers:** UDP Streaming Consumers, UDP Transformation Pipelines  
- **Consumer Requirement:** Approved event contract, ingestion endpoint, and platform streaming configuration

---

## Access Products

User-facing exploration and analytical surfaces.

### 4. Self-Service Model
- **Product ID:** `self_service_model`  
- **Owner:** UDP Analytics Enablement  
- **Steward:** Semantic Model Stewardship  
- **Producer System:** UDP Semantic Model Layer  
- **Delivery Type:** Interactive  
- **Surface:** Looker Explore  
- **SLA:** Explore surface available during business hours with platform-standard query performance  
- **Refresh Expectation:** Aligned to underlying semantic model refresh cadence  
- **Primary Consumers:** Analysts, Business Users  
- **Consumer Requirement:** User access to approved semantic model  
- **Description:** Users drag and drop fields to build their own answer to a data question.

### 5. Dashboards
- **Product ID:** `dashboards`  
- **Owner:** UDP Analytics Enablement  
- **Steward:** Dashboard Operations  
- **Producer System:** UDP BI Publishing Layer  
- **Delivery Type:** Curated visual  
- **Surface:** PowerBI or Looker dashboard  
- **SLA:** Published dashboards refreshed and available by agreed reporting window  
- **Refresh Expectation:** Scheduled dashboard refresh based on underlying dataset cadence  
- **Primary Consumers:** Decision Makers, Operational Teams  
- **Consumer Requirement:** Viewer access to published dashboards  
- **Description:** Visual representation of data created to answer specific questions.

---

## Subscription Products

Reusable dataset subscriptions at multiple transformation tiers.

### 6. Subscribable Dataset - Raw (Bronze)
- **Product ID:** `subscribable_raw_bronze`  
- **Owner:** UDP Platform Team  
- **Steward:** Dataset Subscription Operations  
- **Tier:** Bronze  
- **Producer System:** UDP Dataset Publication Layer  
- **Delivery Type:** Dataset subscription  
- **SLA:** Raw subscription datasets available after successful ingestion completion  
- **Refresh Expectation:** Refreshed on each successful source ingestion cycle  
- **Primary Consumers:** Consumer Projects, Technical Data Teams  
- **Consumer Requirement:** Consumer project required to subscribe  
- **Description:** Data remains in source-system format with no business transformation.

### 7. Subscribable Dataset - Modelled (Silver)
- **Product ID:** `subscribable_modelled_silver`  
- **Owner:** UDP Platform Team  
- **Steward:** Dataset Subscription Operations  
- **Tier:** Silver  
- **Producer System:** UDP Dataset Publication Layer  
- **Delivery Type:** Dataset subscription  
- **SLA:** Modelled datasets refreshed within 4 hours of dependent Bronze data availability  
- **Refresh Expectation:** Scheduled transformation cycle after upstream Raw refresh  
- **Primary Consumers:** Consumer Projects, Analytics Engineers, Data Teams  
- **Consumer Requirement:** Consumer project required to subscribe  
- **Description:** Data transformed into reusable general-purpose models or intermediate forms.

### 8. Subscribable Dataset - Focused (Gold)
- **Product ID:** `subscribable_focused_gold`  
- **Owner:** UDP Platform Team  
- **Steward:** Dataset Subscription Operations  
- **Tier:** Gold  
- **Producer System:** UDP Dataset Publication Layer  
- **Delivery Type:** Dataset subscription  
- **SLA:** Focused datasets refreshed in time for agreed business or reporting commitments  
- **Refresh Expectation:** Scheduled or event-based refresh aligned to business use case requirements  
- **Primary Consumers:** Consumer Projects, Business Domain Teams, Reporting Consumers  
- **Consumer Requirement:** Consumer project required to subscribe  
- **Description:** Data transformed to solve specific business problems with well-understood definitions.

---

## Egress Products

Outbound delivery to external consumers and regulators.

### 9. Published External Delivery
- **Product ID:** `published_external_delivery`  
- **Owner:** UDP Data Delivery Team  
- **Steward:** Outbound Delivery Operations  
- **Tier:** Gold  
- **Producer System:** UDP Outbound Delivery Service  
- **Delivery Type:** File delivery  
- **Surface:** Managed outbound file or API delivery  
- **SLA:** Outbound data delivered within the agreed regulatory or partner reporting window  
- **Refresh Expectation:** Per agreed outbound schedule, event trigger, or reporting cycle  
- **Primary Consumers:** External Recipients, Regulators, Partner Platforms  
- **Consumer Requirement:** Approved outbound contract, recipient registration, and delivery control configuration  
- **Description:** Outbound data product that packages approved UDP data for delivery to external consumers, regulators, or partner platforms.

---

## Transformation Tier Summary

| Tier | Products | Characteristics |
|------|----------|-----------------|
| **Bronze** | Ingestion, Feed, Event, Subscribable Raw | Source-aligned, minimal transformation |
| **Silver** | Subscribable Modelled | Reusable intermediate models |
| **Gold** | Subscribable Focused, Published External | Business problem-specific, polished |
| **Interactive** | Self-service, Dashboards | User-facing, governed exploration |

---

## Governance Model

All products include:

- **Owner:** Accountable party  
- **Steward:** Day-to-day operations  
- **Producer System:** System of origin  
- **Primary Consumers:** Key downstream users  
- **SLA:** Delivery and availability expectations  
- **Refresh Expectation:** Cadence and triggers  
- **Evidence Anchors:** Supporting documentation  

---

## Related Documentation

- [data-product-catalog.schema.json](data-product-catalog.schema.json) — JSON Schema definition
- [UDP-DATA-PRODUCTS.md](UDP-DATA-PRODUCTS.md) — Detailed narrative specifications
- [template-*.md](.) — Type-specific implementation templates
- [../example-data/udp-data-products.json](../example-data/udp-data-products.json) — Live catalog instance
