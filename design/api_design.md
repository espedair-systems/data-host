# Data Host REST API Documentation

The Data Host system utilizes a `gin-gonic` HTTP server as its primary driving adapter. Below is a detailed description of the API routes, authentication standards, and data structures.

## Authentication

All secured routes require a standard Bearer Token. Requests should include:

`Authorization: Bearer <JWT_TOKEN>`

### `POST /auth/login`
- **Description:** Authenticates the user and returns a JSON Web Token (JWT) along with role claims.
- **Request Body:** `{ "username": "admin", "password": "password" }`
- **Response:**
  ```json
  {
    "token": "eyJhb...",
    "expires_in": 86400,
    "user": { "id": 1, "username": "admin", "role": "admin" }
  }
  ```

---

## Core System Operations

### `GET /health`
- **Description:** Simple health check. Returns service status and binary version.

---

## Data Ingestion & Validation

The `/ingestion` group is critical for processing structural files (DB Schemas, DFDs, Organization Trees, Business Glossaries).

### `POST /ingestion/validate`
- **Description:** Submits a JSON document for schema validation. Automatically determines the document type (e.g., ORG_STRUCTURE, DB_SCHEMA, TAXONOMY) based on JSON elements, then runs `gojsonschema` verification against built-in master templates.
- **Response:** Returns validation status, list of syntax errors, or diff conflict payloads.

### `POST /ingestion/ingest`
- **Description:** Officially commits a validated JSON payload.
- **Behavior:** Parses the payload and stores it via the repository (saving metadata to RDBMS backing and filing raw documents inside `archive/`). 
- **Supports:** Schemas, Data Flow Diagrams, Org Structures, Business Glossaries, BIM, RDM packages, and Taxonomies.

---

## Schema & Reference Data Management

### `GET /schemas/tree`
- **Description:** Returns the complete hierarchical structure of the schema registry.

### `GET /blueprint/schemas`
- **Description:** Returns a flat list of registered blueprint schemas.

### `POST /site/schemas/{module}/table`
- **Description:** Submits modifications (`UpdateTableRequest`) for a specific tracked database table, updating table descriptions and column types directly.

---

## Documentation & Knowledge Base

System-wide documentation is served out of the filesystem or database via these endpoints.

### `GET /guidelines`
- **Description:** Fetches an array of System Operational Guidelines. Returns filenames, titles, and descriptions.

### `GET /training`
- **Description:** Fetches available training modules and examples.

---

## Site Governance

### `GET /site/schemas`
- **Description:** Collects and standardizes dashboard metrics across all managed schema modules, enabling cross-comparison of table populations and relation configurations.

### `GET /site/selection` / `POST /site/selection`
- **Description:** Retrieves or mutates the end-user's local workspace preferences (such as selected guidelines or preferred dashboards).

---

## Organizational Models

### `GET /api/ingestion/ingest-org`
- **Description:** Serializes and returns the current state of the parsed Organizational Tree structure.

### `GET /api/ingestion/ingest-dfd`
- **Description:** Returns the reconstructed graph for the Data Flow Diagram elements.

---

*Note: The API natively supports OpenAPI (Swagger) documentation generation. Access `/swagger/index.html` on the running instance for real-time sandbox testing.*
