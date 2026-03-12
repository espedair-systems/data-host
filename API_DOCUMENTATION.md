# DataHost API Documentation

## Overview
The DataHost API provides programmatic access to data schemas, tables, and column definitions.

## Interactive Documentation
Visit [Swagger UI](http://localhost:8080/swagger/index.html) for interactive API testing and detailed schema exploration.

## Authentication
All write operations and sensitive data endpoints require a JWT token.
*(Note: Full JWT authentication implementation is scheduled for Phase 1 P1_0005)*

### Getting a Token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

### Using the Token
Include the token in the `Authorization` header:
```bash
curl http://localhost:8080/api/site/schemas \
  -H "Authorization: Bearer <your-token>"
```

## Core Endpoints

### System
- `GET /api/health` - Check API status and version.

### Schemas
- `GET /api/schemas/tree` - Get hierarchical schema tree.
- `GET /api/site/schemas` - Get aggregated dashboard for modules.

### Site Management
- `POST /api/site/schemas/{module}/table` - Update table structure.
- `POST /api/site/selection` - Update guideline selection.

## Response Format
The API follows a standardized JSON format.

### Success
```json
{
  "status": "success",
  "data": { ... }
}
```

### Error
```json
{
  "error": "Error Type",
  "message": "Detailed explanation",
  "code": 400
}
```

## Validation Rules
Most inputs have strict validation:
- `ModuleName`: Required, max 100 chars.
- `TableName`: Required, max 255 chars.
- `Description`: Max 1000 chars.

## Rate Limiting
- **Reads**: 100 requests per minute per IP.
- **Writes**: 10 requests per minute per IP.
