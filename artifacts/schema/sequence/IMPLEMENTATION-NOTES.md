# Sequence Implementation Notes

This document provides practical guidance for implementing sequence diagram data based on:

- sequence.schema.json
- sequence.example-1.json

## Purpose

Use this schema to standardize interaction flow definitions across business and technical scenarios, including:

- participant lifelines
- ordered message exchanges
- control fragments (alt, loop, par)
- governance ownership and approval state
- evidence anchors for auditability

## Recommended Implementation Sequence

1. Define scenario metadata first
- Set name, version, scenario_type, and trigger.
- Add concise preconditions and postconditions for testability.

2. Register participants with stable identifiers
- Create participant ids that remain stable across versions.
- Use participant_type consistently (actor, service, system, external, and so on).

3. Model core messages in execution order
- Assign unique id values and strictly increasing sequence numbers.
- Capture from, to, message_type, and label for every message.

4. Add control fragments after base flow is stable
- Use fragments for alternatives, retries, and parallel branches.
- Set start_sequence and end_sequence to map each fragment boundary.

5. Add governance and evidence anchors
- Populate governance owner and steward before approval.
- Add evidence_anchors for critical message steps.

6. Add optional notes and stats
- Use notes for context that should not alter execution semantics.
- Use stats as a consistency summary for human review.

## Participant Modeling Guidance

Recommended conventions:

- id: lowercase stable key using dots, hyphens, underscores, or colons
- name: human-readable label for diagrams
- alias: short rendering label for compact views
- owner: accountable owner of participant behavior

Best practices:

- Prefer reusable participant ids across related scenarios.
- Keep participant_type semantic; do not overload with environment details.
- Use classification where interactions involve sensitive data.

## Message Design Guidance

Required message fields:

- id
- sequence
- from
- to
- message_type
- label

Recommended optional fields:

- operation for endpoint or command name
- payload_ref for contract traceability
- timeout_ms for runtime behavior
- condition for branch-specific flow
- evidence_anchors for validation and audit

Message type usage:

- sync: immediate request/response behavior
- async: queued or event-driven interaction
- reply: explicit response step
- error: explicit failure flow

## Fragment and Branching Guidance

Use fragment_type values intentionally:

- alt for mutually exclusive branches
- opt for optional behavior
- loop for retries or batch iteration
- par for concurrent branches

Design notes:

- Keep fragment ranges aligned to existing message sequence values.
- Use operands for explicit branch labeling in alt and par fragments.
- Keep conditions short and implementation-neutral.

## Governance and Lifecycle

Recommended approval lifecycle:

1. draft
2. review
3. approved
4. deprecated

Versioning approach:

- major for breaking structure changes
- minor for additive messages or optional metadata
- patch for non-breaking corrections

## Validation and Testing Checklist

Before release:

- JSON validates against sequence.schema.json.
- Every message from and to value matches a participant id.
- sequence values are unique and monotonic for readability.
- Fragment boundaries refer to valid sequence numbers.
- Operand ranges stay within parent fragment ranges.
- Approval status and approved_at are consistent with governance process.
- Evidence anchors are present for critical regulatory or operational steps.

## Common Pitfalls to Avoid

- Duplicated or out-of-order sequence numbers
- Fragment ranges that do not map to defined messages
- Ambiguous message labels without operation or payload references
- Overuse of notes for executable logic
- Missing governance fields for production scenarios

## Suggested Companion Artifacts

- RUNBOOK.md for operational execution and incident handling
- TEST-CASES.md for branch and retry behavior validation
- CHANGELOG.md for sequence version history
- TRACEABILITY.md linking messages to APIs, jobs, or tickets