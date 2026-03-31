# Data Host Database Design

The Data Host system utilizes a unified database schema (currently backed by SQLite) to maintain a live, querying-optimized registry of all tracked data structures (tables, columns, relations). 

Unlike pure file-based documentation tools, Data Host unpacks JSON artifact schemas into strict relational tables, allowing cross-schema querying, lineage mapping, and rich analytics.

## Architectural Approach

Data Host implements a **hybrid storage model**:
1. **Relational Meta-Store (SQLite)**: Stores granular configurations, schema structural data, and relationships.
2. **Filesystem Archive (`r.fsRepo`)**: Acts as a backup and primary store for long-form Markdown documents (guidelines/training) and raw `.json` schema artifacts used as single-sources-of-truth.

*Note: The `SQLiteRepository` often fetches from the Database first, explicitly falling back to the `FilesystemRepository` if the DB lacks the requested domain.*

## Core Relational Tables

### 1. Site Configuration
- **`db_site_config`**: A key-value store handling global states, site preferences, and dashboard choices.
  - `key` (PK), `content` (JSON blob)

### 2. High-Level Schemas
- **`db_schemas`**: Represents a bundled data dictionary or database structure (e.g., "Finance Module").
  - `id` (PK), `name`, `desc`, `driver_name`, `driver_database_version`, `driver_meta_current_schema`, `created_at`, `updated_at`.

### 3. Registry Entities
- **`db_tables`**: Stores actual table or conceptual entity representations within a schema.
  - `id` (PK), `schema_id` (FK), `name`, `type`, `comment`, `def`, `labels`, `referenced_tables`.
- **`db_columns`**: Links granular column/attribute data to tables.
  - `id` (PK), `table_id` (FK), `name`, `type`, `nullable`, `default_value`, `comment`, `extra_def`, `tags`.

### 4. Constraints & Relationships
To render Entity-Relationship Diagrams (ERDs) and track metadata accurately, relationships are broken down completely:
- **Keys & Constraints**: 
  - `db_constraints`, `db_constraint_columns`, `db_constraint_referenced_columns`.
- **Indexes**: 
  - `db_indexes`, `db_index_columns`.
- **Relations (Foreign Keys / Logical Links)**: 
  - `db_relations` (links table to parent table), `db_relation_columns`, `db_relation_parent_columns`.

### 5. Advanced Database Features
The repository correctly maps higher-order RDBMS features to support complex enterprise architecture tracing:
- **`db_triggers`**: Stores trigger definitions tied to tables.
- **`db_functions`**: Stores stored procedure definitions tied to the overarching schema.
- **`db_enums` / `db_enum_values`**: Maps allowed value iterations to schemas.

### 6. Observability
- **`db_viewpoints` & `db_viewpoint_tables`**: Viewpoints are subsets of tables used to render context-specific ERDs without overloading the UI (e.g., "Just the Authentication subset"). These tables map bounding boxes around specific table names.
