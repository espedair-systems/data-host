# Taxonomy Implementation Notes

This document provides practical guidance for implementing governed taxonomy artifacts based on:

- taxonomy.schema.json
- taxonomy.example-financial-products.json

## Purpose

Use this schema to standardize taxonomy structures for business, technical, regulatory, and product classification use cases, including:

- governed term definitions and lifecycle states
- hierarchical and associative term relationships
- reusable attribute and rule registries
- evidence-supported term definitions and controls

## Recommended Implementation Sequence

1. Define taxonomy metadata first
- Set name, version, taxonomy_type, source, and generated_at_utc.
- Use semantic versioning to track taxonomy evolution.

2. Define governance ownership
- Populate governance owner, steward, approver, and approval_status.
- Set approved_at when moving to approved state.

3. Define reusable attribute registry
- Add term_attributes for cross-term attribute consistency.
- Keep attribute_id stable and data_type aligned to schema values.

4. Define reusable rule registry
- Add rule_definitions with rule_id, rule_type, and severity.
- Write implementation-ready expression text for validation or quality controls.

5. Register terms and hierarchy
- Add term_id, label, and status for every term.
- Use parent_term_id and child_term_ids for primary hierarchy.
- Use broader_term_ids and narrower_term_ids for polyhierarchy where needed.

6. Add semantic and governance detail
- Populate definition, term_type, synonyms, acronyms, and classification.
- Add owner, steward, effective_from, and effective_to as required.

7. Add controls and evidence
- Use rule_refs to link terms to reusable rule_definitions.
- Use evidence_anchors for auditable justification of definitions and relationships.

8. Populate optional stats
- Keep term and relationship counts synchronized with current payload content.

## Term Modeling Guidance

Required term fields:

- term_id
- label
- status

Identifier and naming conventions:

- Use stable lowercase term_id values with dot-separated structure when useful.
- Keep label human-readable and definition precise.
- Avoid changing term_id for non-breaking wording updates.

Term type usage:

- category for high-level groupings
- class for structured taxonomic classes
- concept for domain semantics
- code for controlled code entries
- tag for labeling constructs

Status usage:

- proposed for under-development terms
- active for published terms
- deprecated for transition states
- retired for end-of-life terms

## Relationship Modeling Guidance

Hierarchy and semantic links:

- Use parent_term_id for single-parent navigation.
- Use child_term_ids for explicit downstream references.
- Use broader_term_ids and narrower_term_ids for additional semantic structure.
- Use related_term_ids for associative, non-hierarchical links.

Best practices:

- Keep parent-child links internally consistent.
- Avoid circular hierarchy references.
- Use associative relationships to model cross-domain concepts cleanly.

## Attributes and Rules Guidance

Attribute registry practices:

- Define common attributes once in term_attributes.
- Reuse consistent attribute names in term attributes objects.
- Use required true only for universally mandatory term attributes.

Rule registry practices:

- Define reusable rules in rule_definitions.
- Reference rule_id values from term rule_refs.
- Keep severity aligned to governance and release controls.

Severity guidance:

- critical for blocking integrity failures
- high for major quality or governance breaches
- medium for important but non-blocking issues
- low for advisory controls

## Governance and Versioning

Recommended governance lifecycle:

1. draft
2. review
3. approved
4. deprecated

Versioning approach:

- major for breaking term_id or structure changes
- minor for additive terms, attributes, or rules
- patch for non-breaking corrections

## Validation and Testing Checklist

Before release:

- JSON validates against taxonomy.schema.json.
- All term_id values are unique.
- Every parent_term_id and referenced term id exists.
- broader, narrower, related, and child references resolve to existing terms.
- rule_refs resolve to rule_definitions rule_id values.
- effective_from and effective_to are logically consistent.
- Governance fields are aligned to approval status.
- Stats values match current payload counts when included.

## Common Pitfalls to Avoid

- Duplicate term_id values across releases
- Broken parent_term_id or rule_refs references
- Circular parent-child relationships
- Ambiguous definitions for active terms
- Missing evidence for high-impact or regulated terms
- Inconsistent use of attributes across sibling terms

## Suggested Companion Artifacts

- CHANGELOG.md for taxonomy release history
- TERM-CHANGE-REQUESTS.md for governance workflow tracking
- VALIDATION-RULES.md for executable checks
- CONSUMER-IMPACT.md for downstream classification impact analysis
