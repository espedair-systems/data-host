# Lineage Implementation Notes

This document provides practical guidance for implementing lineage data based on:

- lineage.schema.json
- lineage.example-1.json
- lineage.example-2.json

## Purpose

Use this schema to standardize end-to-end data lineage across systems, transformations, delivery products, and reporting assets, including:

- governed lineage ownership and approval state
- typed node modeling for assets and processing components
- directed edges with operational expectations
- optional precomputed lineage_paths for impact and traceability analysis

## Recommended Implementation Sequence

1. Define lineage metadata first
- Set name, version, source, and generated_at_utc.
- Keep version semantic so graph changes are traceable over time.

2. Populate governance context
- Set governance owner and steward before promotion.
- Track approval_status and approved_at according to your release process.

3. Register nodes with stable identifiers
- Add all participating assets in nodes with consistent id conventions.
- Set node_type, platform, environment, and lifecycle_status for operational clarity.

4. Register directed edges
- Define from, to, and edge_type for each dependency.
- Add transformation, schedule, latency, criticality, and refresh_expectation where known.

5. Add evidence anchors for critical dependencies
- Provide source, location, and detail for auditability.
- Prioritize evidence on regulated and high criticality flows.

6. Add optional lineage paths
- Precompute end-to-end hops for common business outcomes.
- Keep path start_node and end_node aligned to the hop list boundaries.

7. Add optional stats
- Populate node_count, edge_count, path_count, and systems_count as a consistency summary.

## Node Modeling Guidance

Required node fields:

- id
- name
- node_type

Recommended optional fields:

- platform and environment for runtime context
- namespace and path for location precision
- owner and steward for accountability
- classification and lifecycle_status for control posture
- tags for discovery and grouping

Node conventions:

- Use lowercase stable identifiers for id.
- Keep id values globally unique within the lineage document.
- Use path when physical location matters, such as table, file, or topic locations.

## Edge Modeling Guidance

Required edge fields:

- from
- to
- edge_type

Recommended optional fields:

- transformation for business or technical processing summary
- schedule and refresh_expectation for cadence
- latency and sla for delivery expectations
- criticality for impact prioritization
- evidence_anchors for control and audit traceability

Edge type usage examples:

- reads-from for consumption dependencies
- writes-to for publication targets
- transforms for processing logic links
- publishes and delivers-to for distribution outcomes
- depends-on for prerequisite dependencies

## Path Modeling Guidance

Use lineage_paths when consumers need fast end-to-end navigation.

Best practices:

- Keep hops ordered from upstream to downstream.
- Ensure start_node equals first hop and end_node equals last hop.
- Use business_purpose to explain why each path is tracked.

## Governance and Lifecycle

Recommended governance flow:

1. draft
2. review
3. approved
4. deprecated

Node lifecycle suggestions:

- draft for planned assets
- active for operational assets
- deprecated for migration phase
- retired for decommissioned assets

Versioning approach:

- major for structural graph changes or breaking identifier changes
- minor for additive nodes, edges, or metadata
- patch for non-breaking corrections

## Validation and Testing Checklist

Before release:

- JSON validates against lineage.schema.json.
- Every edge from and to value exists in nodes.id.
- Node ids are unique and stable.
- Every lineage path hop exists in nodes.id.
- Path boundaries match start_node and end_node.
- Evidence anchors include source, location, and detail.
- Stats values match actual node, edge, and path totals.

## Common Pitfalls to Avoid

- Edges referencing nodes not present in nodes
- Inconsistent id naming conventions across teams
- Missing evidence for critical or regulated lineage links
- Path hop sequences that skip required intermediate assets
- Stale stats after node or edge updates

## Suggested Companion Artifacts

- RUNBOOK.md for lineage refresh and operational incident response
- DATA-QUALITY-RULES.md for lineage validation controls
- IMPACT-ASSESSMENT.md for downstream change impact workflows
- CHANGELOG.md for lineage model version history
