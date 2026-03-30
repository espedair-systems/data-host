# Data Governance Tree

## Overview

A **data governance tree** is a hierarchical visualization and organizational structure that manages data assets, their ownership, stewardship, and compliance across an organization. It provides a clear framework for understanding data flows, accountability, and regulatory requirements.

## Hierarchical Structure

### Level 1: Organization / Root
The top level representing the entire data governance domain.

**Example:**
- Insignia Business Information Model (BIM)

### Level 2: Data Domains
Major business areas or logical groupings of related data.

**Examples:**
- **Account** — Client accounts, balances, transactions
- **Party** — Members, employers, advisers, beneficiaries
- **Transaction** — Transactions, payments, transfers
- **Finance** — Financial reporting, fees, costs
- **Risk** — Risk assessments, exposures, concentrations

**Characteristics:**
- Asset Type: `Data Domain`
- Represents major business areas
- Top-level governance responsibility
- Contains multiple Data Concepts

### Level 3: Data Concepts
Individual business entities or logical groupings within a domain.

**Examples within Account Domain:**
- Account Advisor
- Account Balance
- Account Beneficiary
- Account Details
- Account Transaction

**Examples within Party Domain:**
- Member
- Employer
- Adviser
- Beneficiary

**Characteristics:**
- Asset Type: `Data Concept`
- Represents entities or logical data groups
- Can be grouped by other concepts or domains
- Contains metadata and ownership information

### Level 4: Data Elements
Individual attributes or fields representing specific data points.

**Examples:**
- ABN (Australian Business Number)
- Member ID
- Account Balance (USD)
- Transaction Date
- Transaction Amount

**Characteristics:**
- Lowest level of granularity
- Physical implementation in databases/systems
- Subject to data quality rules
- Mapped to specific columns in database tables

## Hierarchical Relationships

The model captures four types of relationships:

### 1. Data Concept → Data Concept Grouping
A data concept can group other data concepts.

**Example:**
- "Account Details" groups "Account Advisor"
- "Employer Details" groups "ABN"

### 2. Data Concept → Data Domain Grouping
A data concept is organized within a data domain.

**Example:**
- "Account Advisor" belongs to "Account" domain
- "Member" belongs to "Party" domain

### 3. Domain Coverage
Domains group multiple related concepts for governance purposes.

**Example:**
- **Account Domain** contains: Account Advisor, Account Balance, Account Details, etc.
- **Party Domain** contains: Member, Employer, Adviser, etc.

### 4. Cross-Domain Relationships
Concepts may reference entities from other domains.

**Example:**
- Account Advisor (Account domain) references Adviser (Party domain)
- Account Beneficiary (Account domain) references Member (Party domain)

## Governance Metadata

Each entity in the hierarchy includes governance metadata:

### Ownership Roles

| Role | Responsibilities |
|------|-----------------|
| **Data Owner** | Ultimate accountability for data quality and compliance |
| **Business Steward** | Defines business rules and usage policies |
| **Data Custodian** | Manages technical implementation and infrastructure |
| **Data Steward** | Daily management of data quality and updates |

### Classification Levels

| Level | Examples | Handling |
|-------|----------|----------|
| **Public** | Non-sensitive business data | Wide distribution allowed |
| **Internal** | General business data | Distribution within organization |
| **Confidential** | Sensitive business data | Restricted to authorized personnel |
| **Restricted** | Highly sensitive data | Minimal access, audit trails required |

## Business Information Model (BIM) Implementation

### File Structure
**Source:** `C:\workspace\BIM\bim\business-information-model.json`

### Statistics
- **Total Entities:** 511 (deduplicated)
- **Source Rows:** 871
- **Duplicates Removed:** 360

### Entity Breakdown

#### Data Domains (Examples)
- Account
- Advice
- Asset Allocation
- Corporate Governance
- Finance
- Legal
- Party
- Risk
- Transaction
- And 14+ more domains

#### Data Concepts by Domain

**Account Domain:**
- Account
- Account Advisor
- Account Beneficiary
- Account Details
- Account Transaction
- Account Type
- And 20+ more concepts

**Party Domain:**
- Adviser
- Client
- Employer
- Member
- Party Details
- Trustee
- And 15+ more concepts

### Governance Coverage

**Roles Distribution:**
- Data Owners assigned to 85+ entities
- Business Stewards assigned to 120+ entities
- Data Custodians assigned to 65+ entities
- Data Stewards assigned to 95+ entities

**Confidentiality Classification:**
- **Internal:** 240+ entities
- **Confidential:** 180+ entities
- **Public:** 45+ entities
- **Restricted:** 30+ entities
- **Unclassified:** 16+ entities

## Data Governance Tree Use Cases

### 1. Ownership & Accountability
**Purpose:** Identify who is responsible for each data asset
**Usage:**
```
Query: "Who owns the Account domain?"
Result: Data Owner = Amalie White
        Team responsible for all account-related data
```

### 2. Impact Analysis
**Purpose:** Understand what data is affected by changes
**Usage:**
```
Query: "What breaks if we modify the Member concept?"
Result: 
- Party Domain (impacted)
- Account Advisor → references Member
- Beneficiary → references Member
- 8 additional dependent concepts
```

### 3. Access Control & Compliance
**Purpose:** Enforce data access policies by classification
**Usage:**
```
Query: "Who can access Confidential data in Account domain?"
Result: Only users with Confidential data clearance
        Subject to audit logging
```

### 4. Data Lineage Tracking
**Purpose:** Trace data from source to consumption
**Usage:**
```
Source System → Data Element (ABN)
               → Data Concept (Employer Details)
               → Data Domain (Party)
               → Consuming System/Report
```

### 5. Regulatory Compliance
**Purpose:** Map regulatory requirements to data elements
**Usage:**
```
Regulation: APRA SRS 550.0 (Counterparty Reporting)
Related Concepts:
- Counterparty (Party domain)
- Counterparty Exposure (Risk domain)
- Derivative (Asset domain)
- Margin/Collateral (Finance domain)
```

### 6. Data Quality Management
**Purpose:** Define quality rules at appropriate hierarchy level
**Usage:**
```
Domain Rule: All Account transactions must be reconciled daily
Concept Rule: Member ID must be unique and non-null
Element Rule: Account Balance must be numeric, >= 0
```

## Schema Reference

### Data Concept Record Structure
```json
{
  "name": "Account Advisor",
  "asset_type": "Data Concept",
  "description": "Financial Advisor associated to advising on account",
  "information_confidentiality_classification": "Confidential",
  "roles": {
    "data_owner_first_name": "Name",
    "business_steward_group_name": "Team Name",
    "data_custodian_first_name": "Name",
    "data_steward_group_name": "Team Name"
  },
  "relationships": [
    {
      "data_concept_is_grouped_by_data_concept_name": "Account Details",
      "data_domain_groups_data_concept_name": "Account"
    }
  ]
}
```

## Building a Visual Data Governance Tree

To visualize this hierarchy, you can create diagrams using:

### Tree Format
```
Insignia Business Information Model
│
├── Account (Data Domain)
│   ├── Account Advisor (Data Concept)
│   │   └── Owner: Amalie White
│   ├── Account Balance (Data Concept)
│   ├── Account Details (Data Concept)
│   │   └── Groups: Account Advisor, Account Beneficiary
│   └── Account Transaction (Data Concept)
│
├── Party (Data Domain)
│   ├── Adviser (Data Concept)
│   ├── Employer (Data Concept)
│   │   └── Groups: ABN, Employer Details
│   ├── Member (Data Concept)
│   └── Trustee (Data Concept)
│
├── Finance (Data Domain)
│   ├── Fee (Data Concept)
│   ├── Commission (Data Concept)
│   └── Cost Component (Data Concept)
│
└── Risk (Data Domain)
    ├── Risk Rating (Data Concept)
    ├── Counterparty (Data Concept)
    └── Concentration Limit (Data Concept)
```

### Tools for Visualization
- **Draw.io / Miro:** Manual tree diagrams
- **Mermaid:** Code-based hierarchy diagrams
- **D3.js:** Interactive hierarchical visualizations
- **Neo4j:** Graph database for relationship queries
- **Collibra / Alation:** Enterprise data governance platforms

## Best Practices

### 1. Maintain Clear Hierarchy
- Keep domains to 10-20 top-level categories
- Organize concepts logically within domains
- Avoid deep nesting (limit to 4 levels)

### 2. Consistent Naming
- Use PascalCase for domains and concepts
- Use descriptive, business-friendly names
- Avoid acronyms in formal names (can add aliases)

### 3. Complete Ownership
- Assign at least a Data Owner to each domain
- Assign Data Stewards to high-value concepts
- Document transition plans for vacant roles

### 4. Regular Review
- Review hierarchy annually
- Update classifications as regulations change
- Remove obsolete concepts
- Merge overly granular hierarchies

### 5. Documentation
- Maintain glossary (like APRA/BIM glossaries)
- Document domain-specific rules
- Create runbooks for common operations
- Link to technical data models (ERDs, schemas)

## Related Files

**Glossary Resources:**
- [Business Glossary](../glossary/business-glossary.json) — 1,763 business terms
- [APRA Glossary](../../example-data/apra-glossary.json) — 15 regulatory terms
- [Generic Glossary Schema](../../example-data/generic-glossary.schema.json) — Universal glossary schema

**Model Files:**
- [Business Information Model](../business-information-model.json) — Complete BIM with 511 entities
- [Business Information Model Schema](../business-information-model.schema.json) — BIM schema definition
- [Concept Domain Model](../business-information-model.concept-domain.json) — Concept-level breakdown

## Summary

A data governance tree transforms the business-information-model.json file into an operational framework for:

✓ **Clear accountability** through defined ownership roles  
✓ **Effective compliance** through classification and traceability  
✓ **Efficient operations** through consistent naming and structure  
✓ **Strategic alignment** between business and data management  

The 511 entities in the Insignia BIM, organized into domains and concepts with complete governance metadata, provide the foundation for building a robust, scalable data governance program.

---

**Last Updated:** March 28, 2026  
**Document Version:** 1.0  
**Related Standards:** APRA SRS 101.0, APRA SRS 604-607, ISO 8601
