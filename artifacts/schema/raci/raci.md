# RACI Schema — `raci.schema.json`

**Schema ID**: `https://espedair.io/schema/raci`  
**JSON Schema draft**: 2020-12  
**File**: `schema/raci.schema.json`

---

## Overview

The RACI schema provides a structured, machine-readable format for capturing accountability and responsibility assignments across any set of activities — regulatory reporting pipelines, data governance frameworks, project workflows, or compliance obligations.

Each instance document defines:

- A **party registry** — who is involved (people, teams, systems, external entities)
- An **activity list** — what needs to be done, when, and how often
- **Assignments** — which RACI roles each party holds for each activity

The schema enforces the core RACI constraint: **exactly one Accountable (A) party per activity**.

---

## RACI Roles

| Code | Role | Meaning |
|---|---|---|
| `R` | **Responsible** | Does the work. May be shared across multiple parties. |
| `A` | **Accountable** | Owns the outcome. Signs off. **Exactly one per activity.** |
| `C` | **Consulted** | Provides input before or during the activity. Two-way communication. |
| `I` | **Informed** | Notified of outcome or progress. One-way communication. |

A single party may hold more than one role on an activity (e.g. `["R", "A"]` for a working manager).

---

## Schema Structure

```
RaciMatrix                  ← root document
├── id                      string, required — unique matrix identifier
├── name                    string, required — human-readable label
├── description             string — scope and purpose
├── domain                  string — subject domain
├── owner                   string — who maintains this document
├── version                 string — semantic version (e.g. "1.0.0")
├── effective_date          date   — ISO 8601 when this matrix comes into force
├── review_date             date   — ISO 8601 next scheduled review
├── parties[]               Party[], required (min 1)
│   ├── id                  string, required — unique reference key
│   ├── name                string, required — display name
│   ├── type                enum,   required — Person | Role | Team | System | External | Committee
│   ├── contact             string — email or contact reference
│   └── description         string — function or scope notes
└── activities[]            Activity[], required (min 1)
    ├── id                  string, required — unique activity identifier (e.g. "ACT-001")
    ├── name                string, required — short activity label
    ├── description         string — full description of the activity and expected outcome
    ├── category            string — logical grouping (e.g. "Validation", "Submission")
    ├── tags                string[] — freeform keywords
    ├── trigger             string — what initiates the activity
    ├── frequency           enum   — Continuous | Daily | Weekly | Monthly | Quarterly | Annual | Ad-hoc | Event-driven
    ├── deadline_days       integer ≥ 0 — days after trigger by which activity must complete
    ├── standard_refs       string[] — regulatory standard IDs satisfied (e.g. "SRS_550.0")
    └── assignments[]       RaciAssignment[], required (min 1)
        ├── party_id        string, required — must match a Party.id in this document
        ├── roles           RaciRole[], required (min 1, unique) — R | A | C | I
        └── notes           string — optional conditions or escalation notes
```

---

## Type Definitions

### `RaciMatrix` (root)

The top-level document object.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | ✅ | Unique identifier for this matrix instance (e.g. `raci-apra-reporting`) |
| `name` | string | ✅ | Human-readable name |
| `parties` | `Party[]` | ✅ | Registry of all parties referenced in assignments |
| `activities` | `Activity[]` | ✅ | All activities governed by this matrix |
| `description` | string | — | Scope and purpose narrative |
| `domain` | string | — | Subject domain (e.g. `APRA Superannuation Reporting`) |
| `owner` | string | — | Role or person responsible for maintaining this document |
| `version` | string | — | Semantic version string |
| `effective_date` | date | — | ISO 8601 date this matrix takes effect |
| `review_date` | date | — | ISO 8601 date of next scheduled review |

---

### `Party`

A person, role, team, system, or external entity that can hold RACI assignments.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | ✅ | Unique key referenced in `RaciAssignment.party_id` |
| `name` | string | ✅ | Display name |
| `type` | enum | ✅ | One of: `Person`, `Role`, `Team`, `System`, `External`, `Committee` |
| `contact` | string | — | Email or contact reference |
| `description` | string | — | Additional context about this party's function |

**Party types:**

| Type | When to use |
|---|---|
| `Person` | A named individual (e.g. `Jane Smith`) |
| `Role` | A job title or position (e.g. `CFO`, `Regulatory Reporting Manager`) |
| `Team` | An organisational unit (e.g. `Investment Operations`) |
| `System` | An automated system or platform (e.g. `APRA Connect System`) |
| `External` | A party outside the organisation (e.g. `APRA`, `Auditor`) |
| `Committee` | A governance body or board committee |

---

### `Activity`

A discrete task, process step, or obligation that has defined ownership.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | ✅ | Unique activity identifier within this matrix (e.g. `ACT-001`) |
| `name` | string | ✅ | Short, action-oriented label |
| `assignments` | `RaciAssignment[]` | ✅ | Who does what — must include exactly one party with role `A` |
| `description` | string | — | Full description of the activity and its expected outcome |
| `category` | string | — | Logical grouping (e.g. `Data Extraction`, `Submission`, `Governance`) |
| `tags` | string[] | — | Keywords for filtering |
| `trigger` | string | — | What initiates the activity |
| `frequency` | enum | — | How often the activity recurs |
| `deadline_days` | integer ≥ 0 | — | Days after the trigger by which the activity must complete |
| `standard_refs` | string[] | — | Regulatory or policy standards this activity satisfies |

**Frequency values:**

`Continuous` · `Daily` · `Weekly` · `Monthly` · `Quarterly` · `Annual` · `Ad-hoc` · `Event-driven`

---

### `RaciAssignment`

Links a party to one or more RACI roles for a specific activity.

| Field | Type | Required | Description |
|---|---|---|---|
| `party_id` | string | ✅ | Must match an `id` in the `parties` array |
| `roles` | `RaciRole[]` | ✅ | One or more of `R`, `A`, `C`, `I` (unique per assignment) |
| `notes` | string | — | Conditions, qualifications, or escalation path for this assignment |

---

## Constraints

The schema itself does not enforce cross-field constraints at the JSON Schema level (JSON Schema 2020-12 does not have cross-array referential integrity). Consuming tools must validate the following rules:

| Rule | Description |
|---|---|
| **One Accountable per activity** | Exactly one `RaciAssignment` across each activity's `assignments[]` must contain role `A`. |
| **Party references resolve** | Every `party_id` in every `RaciAssignment` must match an `id` in the root `parties[]` array. |
| **No duplicate party per activity** | A party should not appear more than once in an activity's `assignments[]`. Combine roles into a single assignment instead. |
| **At least one Responsible** | Every activity should have at least one party with role `R`. |

---

## File Naming Convention

| File | Purpose |
|---|---|
| `schema/raci.schema.json` | Schema definition (this file) |
| `regulations/{authority}/raci.json` | Domain-specific RACI instance for a regulatory authority |
| `regulations/{authority}/{project}-raci.json` | Project-scoped RACI for a specific initiative within an authority |

---

## Minimal Valid Example

```json
{
  "$schema": "../schema/raci.schema.json",
  "id": "raci-example",
  "name": "Example RACI",
  "parties": [
    { "id": "P1", "name": "Data Team",   "type": "Team" },
    { "id": "P2", "name": "Data Manager","type": "Role" }
  ],
  "activities": [
    {
      "id": "ACT-001",
      "name": "Produce monthly report",
      "frequency": "Monthly",
      "deadline_days": 5,
      "assignments": [
        { "party_id": "P1", "roles": ["R"] },
        { "party_id": "P2", "roles": ["A"] }
      ]
    }
  ]
}
```

---

## Full Example

See [`regulations/apra/apra-raci.json`](../regulations/apra/apra-raci.json) for a complete real-world instance covering the APRA superannuation regulatory reporting pipeline (12 parties, 14 activities).

---

## Validation

The following checks should be run against any RACI instance document:

```powershell
# Parse check
$raci = Get-Content 'path/to/raci.json' -Raw | ConvertFrom-Json

# One Accountable per activity + party refs resolve
$errors = @()
foreach ($act in $raci.activities) {
    $aCount = @($act.assignments | Where-Object { @($_.roles) -contains 'A' }).Count
    if ($aCount -ne 1) {
        $errors += "$($act.id): $aCount Accountable assignments (expected 1)"
    }
    foreach ($asgn in $act.assignments) {
        if (-not @($raci.parties | Where-Object { $_.id -eq $asgn.party_id })) {
            $errors += "$($act.id): party_id '$($asgn.party_id)' not found in parties"
        }
    }
}
if ($errors.Count -eq 0) { "RACI_INTEGRITY: OK" } else { $errors }
```

---

## Related Files

| File | Description |
|---|---|
| [`raci.schema.json`](./raci.schema.json) | This schema — JSON Schema 2020-12 |
| [`regulations/apra/apra-raci.json`](../regulations/apra/apra-raci.json) | APRA superannuation reporting RACI instance |
| [`regulations/apra/schedule.md`](../regulations/apra/schedule.md) | Submission schedule aligned to RACI activities |
| [`regulations/apra/APRA.md`](../regulations/apra/APRA.md) | Master index of all 12 APRA SRS standard drafts |

---

*Schema version: 1.0.0 — Last updated: 2026-03-23*
