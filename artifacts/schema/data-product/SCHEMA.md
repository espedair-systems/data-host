# Data Product Specification Schema

This document defines the standard structure for data product specification files derived from operational notes, inventories, and implementation evidence.

The goal is to make data products describable in a repeatable way across:

- inbound files
- outbound files
- emails and notifications
- logs and audit artifacts
- folders and movement patterns
- generated reports and workbooks

---

## File Location

Data product specifications should be stored as Markdown files in the relevant documentation collection, for example:

```text
data-products/
  product-slug.md
  another-product.md
  index.md
```

This template folder contains the reusable contract used to author those files:

```text
template/
  data-product/
    SCHEMA.md
    TEMPLATE.md
```

---

## Naming Convention

Recommended file naming pattern:

```text
data-product-<producer>-<artifact-pattern>.md
```

If the surrounding documentation set already uses a different naming convention, preserve the established local pattern.

Document titles should follow this form:

```text
# Data Product Specification: <artifact name or pattern>
```

Examples:

- `# Data Product Specification: APRA_FormSRS533_<form>_<fund>_yyyymmddhhmm.csv`
- `# Data Product Specification: Completion Email with Attachments (.xlsx and optional Option_Errors.CSV)`
- `# Data Product Specification: Failed/Invalid Inbound Files Moved to Errors Folder`

---

## Document Purpose

Each specification should answer these questions:

- What is the artifact or operational output?
- Which component produces it?
- What triggers it?
- What inputs, transformations, and controls shape it?
- Where does it go and who consumes it?
- What source code, configuration, or inventory evidence supports the description?

The specification is intended to capture the publishing contract of the data product, not just its file name.

---

## Required Sections

Every data product specification should include these sections, in this order.

### 1. Product Summary

Describe the artifact at a glance.

Must cover:

- product or artifact name/pattern
- producing component or job
- product or asset type
- delivery channel or destination
- purpose and business meaning
- scope or variant where relevant

### 2. Naming and Trigger Path

Describe how the artifact is identified and when it is created.

This section may be titled to suit the artifact form, for example:

- `## File Naming and Trigger Path`
- `## Folder / Movement Pattern`
- `## Delivery Pattern and Trigger`

Must cover, where applicable:

- file name pattern
- folder or destination path
- trigger point in code or job flow
- generation call chain
- transport mechanism such as file write, SMTP, or folder move

### 3. Runtime and Timing Rules

Describe when the data product is generated and which runtime parameters affect it.

Typical content:

- schedule or cadence
- execution window
- date parameters and overrides
- runtime timestamp tokens
- sequencing rules
- archival or rerun behavior

### 4. Source Data Inputs

Describe upstream inputs used to create or populate the data product.

May include:

- inbound files
- staging tables
- application settings or config values
- global variables
- stored procedures
- reference tables

For each important input, provide the business role it plays.

### 5. Intermediate Data and Processing Layer

Describe the materialization, staging, or orchestration layer between raw inputs and the final artifact.

Use this section for:

- staging tables
- intermediate tables
- in-memory state
- attachment assembly logic
- folder scanning and dispatch logic
- multi-step pipelines

Structured bullets or fenced code blocks are acceptable.

### 6. Transformation Logic

Explain how the final artifact is assembled.

Break this into numbered steps when practical.

Typical content:

- normalization or standardization
- enrichment or joins
- classification or mapping logic
- scaling, filtering, exclusions, and apportionment
- final output formatting or delivery logic

This section should make the business logic understandable without reproducing the entire source code.

### 7. Business Requirements and Controls

Capture explicit requirements, validations, controls, and operational safeguards.

Examples:

- mandatory input validation
- allowed parameter values
- exception handling
- notification requirements
- overwrite behavior
- regulatory or compliance rules
- data quality checks

### 8. Operational Frequency

State the expected cadence and operational usage pattern.

Examples:

- quarterly regulatory run
- daily inbound load
- event-driven on file arrival
- exception-only artifact

### 9. Upstream-Downstream Lineage

Summarize the producer-consumer chain.

Must identify:

- key upstream producers or source systems
- immediate processing layer
- downstream consumers, recipients, or operational users
- delivery format if relevant

### 10. Evidence Anchors

List the source evidence supporting the specification.

Evidence may include:

- source files and routines
- config files
- stored procedures
- inventory notes
- runbooks or operational notes

Use concise bullets or a simple table.

---

## Optional Sections

These sections may be added when they materially improve the specification.

- `## Operational Context`
- `## Variant Covered by This Spec`
- `## Data Quality Rules`
- `## Error Scenarios`
- `## Notification Chain`
- `## Inventory Reference`
- `## Related Specs`
- `## Known Gaps or Assumptions`

Optional sections should appear after the most relevant required section, not necessarily at the end.

---

## Writing Rules

Follow these conventions:

- Use Markdown headings and bullet lists.
- Be explicit about system names, table names, config keys, functions, and file patterns.
- Prefer concrete evidence over speculation.
- Separate verified behavior from assumptions.
- Preserve placeholders such as `<fund>`, `<group>`, `<timestamp>`, or `YYYYMMDD` when the artifact is pattern-based.
- If the product is not a file, adapt the headings instead of forcing file terminology.

Avoid:

- vague summaries without implementation anchors
- copying raw code blocks when a concise explanation will do
- mixing multiple unrelated artifacts into one specification

---

## Minimum Quality Bar

A specification is complete when a reader can determine:

- what the artifact is
- how it is produced
- what inputs it depends on
- what controls govern it
- where it goes
- what evidence supports the description

If implementation evidence is incomplete, record the gap explicitly in the document.

---

## Canonical Skeleton

```markdown
# Data Product Specification: <artifact name or pattern>

## Product Summary

## Naming and Trigger Path

## Runtime and Timing Rules

## Source Data Inputs

## Intermediate Data and Processing Layer

## Transformation Logic

## Business Requirements and Controls

## Operational Frequency

## Upstream-Downstream Lineage

## Evidence Anchors
```