# Backend API Documentation

## Overview

| Property | Value |
|----------|-------|
| **Framework** | Express 5 (TypeScript) |
| **Database** | MongoDB via Mongoose 8 |
| **Authentication** | Clerk (`@clerk/express`) |
| **Base URL** | `/api` |
| **Port** | 5001 (default) |

## Authentication

All API endpoints require authentication via Clerk. Requests must include a valid Clerk session token.

Two middleware levels are applied to routes:

| Middleware | Effect |
|-----------|--------|
| `requireAuth()` | Returns **401** if no valid Clerk session (applied to all endpoints) |
| `adminOnly()` | Returns **403** if user's `publicMetadata.role` is not `admin` (applied to admin-only endpoints) |

## Error Responses

All errors return a consistent format:

```json
{ "message": "string" }
```

| HTTP Status | Error Class | When |
|-------------|-------------|------|
| 400 | `ValidationError` | Missing or invalid input |
| 401 | `AuthenticationError` | Unauthenticated |
| 403 | `AuthorisationError` | Insufficient permissions |
| 404 | `NotFoundError` | Resource not found |
| 500 | — | Internal server error |

---

## Auth — `/api/auth`

### GET /api/auth/profile

Retrieve the authenticated user's supplementary profile data.

- **Auth**: Any authenticated user

**Response** `200`:

```json
{ "address": "string", "phone": "string" }
```

**Error** `404`: `{ "message": "Profile not found" }`

---

### PUT /api/auth/profile

Create or update the authenticated user's address and phone (upsert).

- **Auth**: Any authenticated user

**Request Body**:

```json
{ "address": "string (optional)", "phone": "string (optional)" }
```

**Response** `200`:

```json
{ "address": "string", "phone": "string" }
```

---

## Product Groups — `/api/groups`

### GET /api/groups

List all product groups, sorted alphabetically by name.

- **Auth**: Any authenticated user

**Response** `200`:

```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "imageUrl": "string | null",
    "thumbnailUrl": "string | null"
  }
]
```

---

### POST /api/groups

Create a new product group.

- **Auth**: Admin only

**Request Body**:

```json
{ "name": "string (required, non-empty)" }
```

**Response** `201`:

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "imageUrl": "string | null",
  "thumbnailUrl": "string | null"
}
```

**Error** `400`: `{ "message": "Name is required" }`

---

### POST /api/groups/:id/photo

Upload a photo for a product group.

- **Auth**: Admin only
- **Content-Type**: `multipart/form-data`
- **File constraints**: 5MB max, JPEG/PNG/WebP only
- **Field**: `photo` (image file)

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the group |

**Response** `200`: Photo URLs (full-size and thumbnail).

---

### DELETE /api/groups/:id/photo

Delete a product group's photo.

- **Auth**: Admin only

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the group |

**Response** `200`: `{ "success": true }`

---

### PATCH /api/groups/:id

Update a product group's name and/or description.

- **Auth**: Admin only

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the group |

**Request Body**:

```json
{ "name": "string (optional)", "description": "string (optional)" }
```

**Response** `200`: Updated ProductGroup object.

**Errors**:
- `400`: `{ "message": "Name cannot be empty" }` (if name is empty string)
- `404`: `{ "message": "group not found" }`

---

### DELETE /api/groups/:id

Delete a product group. Cascade-deletes all child AssetTypes and Assets. Cleans up associated photo files.

- **Auth**: Admin only

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the group |

**Response** `200`: `{ "success": true }`

**Error** `404`: `{ "message": "Group not found" }`

---

## Asset Types — `/api/types`

### GET /api/types

List all asset types, sorted alphabetically by name.

- **Auth**: Any authenticated user

**Response** `200`:

```json
[
  {
    "id": "string",
    "groupId": "string",
    "name": "string",
    "description": "string",
    "pricePerDay": 0,
    "imageUrl": "string | null",
    "thumbnailUrl": "string | null"
  }
]
```

---

### POST /api/types

Create a new asset type within a product group.

- **Auth**: Admin only

**Request Body**:

```json
{ "groupId": "string (required)", "name": "string (required, non-empty)" }
```

**Response** `201`: Created AssetType object.

**Error** `400`: `{ "message": "groupId and name are required" }`

---

### POST /api/types/:id/photo

Upload a photo for an asset type.

- **Auth**: Admin only
- **Content-Type**: `multipart/form-data`
- **File constraints**: 5MB max, JPEG/PNG/WebP only
- **Field**: `photo` (image file)

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the type |

**Response** `200`: Photo URLs (full-size and thumbnail).

---

### DELETE /api/types/:id/photo

Delete an asset type's photo.

- **Auth**: Admin only

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the type |

**Response** `200`: `{ "success": true }`

---

### PATCH /api/types/:id

Update an asset type's name and/or description.

- **Auth**: Admin only

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the type |

**Request Body**:

```json
{ "name": "string (optional)", "description": "string (optional)" }
```

**Response** `200`: Updated AssetType object.

**Error** `404`: `{ "message": "type not found" }`

---

### DELETE /api/types/:id

Delete an asset type. Cascade-deletes all child Assets. Cleans up associated photo files.

- **Auth**: Admin only

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the type |

**Response** `200`: `{ "success": true }`

**Error** `404`: `{ "message": "Type not found" }`

---

## Assets — `/api/assets`

### GET /api/assets

List all assets with optional filtering. Results are enriched with Clerk user name/email.

- **Auth**: Any authenticated user

**Query Parameters** (all optional):

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Case-insensitive partial match on asset name |
| `status` | string | Exact match: `Available`, `Rented`, `Pending Rental`, `Pending Return`, `Maintenance` |
| `typeId` | string | Filter by asset type ID |
| `groupId` | string | Filter by product group ID (joins via AssetType) |

**Response** `200`:

```json
[
  {
    "id": "string",
    "typeId": "string",
    "name": "string",
    "description": "string",
    "status": "Available | Rented | Pending Rental | Pending Return | Maintenance",
    "rentedByUserId": "string | null",
    "rentedByUserEmail": "string | null",
    "rentedByUserName": "string | null",
    "rentedAt": "string | null (ISO 8601)",
    "returnDate": "string | null (YYYY-MM-DD)",
    "extensionRequestedReturnDate": "string | null (YYYY-MM-DD)",
    "imageUrl": "string | null",
    "thumbnailUrl": "string | null"
  }
]
```

---

### GET /api/assets/reports/overview

Admin reporting dashboard. Returns a snapshot of current system state.

- **Auth**: Admin only

**Response** `200`:

```json
{
  "statusCounts": {
    "Available": 0,
    "Rented": 0,
    "Pending Rental": 0,
    "Pending Return": 0,
    "Maintenance": 0
  },
  "topRented": [
    { "typeId": "string", "typeName": "string", "count": 0 }
  ],
  "overdueCount": 0,
  "totalAssets": 0,
  "totalRented": 0,
  "generatedAt": "ISO 8601 timestamp"
}
```

---

### POST /api/assets

Create a single asset. Status defaults to `Available`.

- **Auth**: Admin only

**Request Body**:

```json
{ "typeId": "string (required)", "name": "string (required, non-empty)" }
```

**Response** `201`: Created Asset object.

---

### POST /api/assets/batch

Create multiple assets at once.

- **Auth**: Admin only

**Request Body**:

```json
{
  "typeId": "string (required)",
  "names": ["string (required, non-empty array)"]
}
```

**Response** `201`: Array of created Asset objects.

---

### PATCH /api/assets/bulk-status

Update status for one or more assets. Admins can perform any valid transition. Customers can only transition their own `Rented` assets to `Pending Return`.

- **Auth**: Any authenticated user (role-based authorization)

**Request Body**:

```json
{
  "ids": ["string (required, non-empty array of asset IDs)"],
  "status": "string (required: Available | Rented | Pending Rental | Pending Return | Maintenance)",
  "clearRentalData": "boolean (optional)"
}
```

**Response** `200`: Array of updated enriched Asset objects.

**Side effect**: Transitioning from `Pending Return` to `Available`/`Maintenance` records completed rentals in history.

**Error** `403`: `{ "message": "Not authorised to transition..." }` or `{ "message": "You can only update your own assets" }`

---

### POST /api/assets/request-rental

Request rental of available assets. Marks them as `Pending Rental`.

- **Auth**: Any authenticated user

**Request Body**:

```json
{
  "items": [{ "typeId": "string", "quantity": "number" }],
  "returnDate": "string (YYYY-MM-DD, required)"
}
```

**Response** `200`: Array of updated Asset objects (status changed to `Pending Rental`, `rentedByUserId` and `returnDate` set).

**Error** `409`: `{ "message": "Not enough units available" }`

---

### POST /api/assets/calculate-cost

Calculate rental cost using the pricing chain. Available so customers can preview costs before renting.

- **Auth**: Any authenticated user

**Request Body**:

```json
{
  "items": [{ "typeId": "string", "quantity": "number" }],
  "returnDate": "string (YYYY-MM-DD, required)"
}
```

**Response** `200`:

```json
{
  "days": 0,
  "returnDate": "YYYY-MM-DD",
  "items": [
    {
      "typeId": "string",
      "typeName": "string",
      "quantity": 0,
      "pricePerDay": 0,
      "perUnitCost": 0.00,
      "lineTotal": 0.00,
      "breakdown": ["string (pricing tier descriptions)"]
    }
  ],
  "grandTotal": 0.00
}
```

---

### POST /api/assets/request-extension

Customer requests a later return date for their currently rented asset.

- **Auth**: The renting customer only (ownership verified)

**Request Body**:

```json
{
  "assetId": "string (required)",
  "newReturnDate": "string (YYYY-MM-DD, required, must be later than current returnDate)"
}
```

**Response** `200`: Updated Asset object with `extensionRequestedReturnDate` set.

**Errors**:
- `400`: Various validation errors (not rented, no returnDate, extension already pending, newReturnDate not later)
- `403`: `{ "message": "You can only request an extension for your own rental" }`

---

### PATCH /api/assets/extension-request

Admin approves or denies pending extension requests.

- **Auth**: Admin only

**Request Body**:

```json
{
  "ids": ["string (required, non-empty array of asset IDs)"],
  "decision": "string (required: 'approve' or 'deny')"
}
```

**Response** `200`: Array of updated enriched Asset objects.

- If **approved**: `returnDate` is updated to `extensionRequestedReturnDate`, and `extensionRequestedReturnDate` is cleared.
- If **denied**: `extensionRequestedReturnDate` is cleared only.

---

### POST /api/assets/reset-seed

Full database reset. Deletes all Assets, AssetTypes, ProductGroups, and RentalHistory, then re-creates from seed data.

- **Auth**: Admin only

**Request Body**: None

**Response** `200`:

```json
{
  "assets": ["..."],
  "assetTypes": ["..."],
  "productGroups": ["..."],
  "skipped": []
}
```

---

### GET /api/assets/rental-history

List all completed rental history records, sorted by completion date (newest first).

- **Auth**: Any authenticated user

**Response** `200`:

```json
[
  {
    "id": "string",
    "assetId": "string",
    "typeId": "string",
    "assetName": "string",
    "assetTypeName": "string",
    "rentedByUserId": "string",
    "rentApprovedAt": "string | null (ISO 8601)",
    "rentDate": "string | null (YYYY-MM-DD)",
    "returnDate": "string (YYYY-MM-DD)",
    "finalStatus": "Available | Maintenance",
    "completedAt": "string (ISO 8601)"
  }
]
```

---

### POST /api/assets/:id/photo

Upload a photo for an asset.

- **Auth**: Admin only
- **Content-Type**: `multipart/form-data`
- **File constraints**: 5MB max, JPEG/PNG/WebP only
- **Field**: `photo` (image file)

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the asset |

**Response** `200`: Photo URLs (full-size and thumbnail).

---

### DELETE /api/assets/:id/photo

Delete an asset's photo.

- **Auth**: Admin only

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the asset |

**Response** `200`: `{ "success": true }`

---

### PATCH /api/assets/:id

Update an asset's name and/or description.

- **Auth**: Admin only

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the asset |

**Request Body**:

```json
{ "name": "string (optional)", "description": "string (optional)" }
```

**Response** `200`: Updated Asset object.

**Error** `404`: `{ "message": "asset not found" }`

---

### DELETE /api/assets/:id

Delete a single asset. Cleans up associated photo files.

- **Auth**: Admin only

**Path Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | MongoDB ObjectId of the asset |

**Response** `200`: `{ "success": true }`

**Error** `404`: `{ "message": "Asset not found" }`

---

## CPU Load Test — `/api/test-cpu`

### GET /api/test-cpu

CPU-intensive endpoint for load balancing and stress testing. Computes prime numbers using trial division up to a configurable limit.

- **Auth**: None (public endpoint)

**Query Parameters** (all optional):

| Parameter | Type | Description |
|-----------|------|-------------|
| `iterations` | number | Upper bound for prime search (default: 50000, max: 500000) |

**Response** `200`:

```json
{
  "primes": 5133,
  "elapsedMs": 342,
  "iterations": 50000
}
```

---

## Static Files

### GET /uploads/*

Serves uploaded photo files directly from disk via `express.static`. No authentication required.

---

## Endpoint Summary

| # | Method | Path | Auth | Admin Only |
|---|--------|------|------|------------|
| 1 | GET | `/api/auth/profile` | Yes | No |
| 2 | PUT | `/api/auth/profile` | Yes | No |
| 3 | GET | `/api/groups` | Yes | No |
| 4 | POST | `/api/groups` | Yes | Yes |
| 5 | POST | `/api/groups/:id/photo` | Yes | Yes |
| 6 | DELETE | `/api/groups/:id/photo` | Yes | Yes |
| 7 | PATCH | `/api/groups/:id` | Yes | Yes |
| 8 | DELETE | `/api/groups/:id` | Yes | Yes |
| 9 | GET | `/api/types` | Yes | No |
| 10 | POST | `/api/types` | Yes | Yes |
| 11 | POST | `/api/types/:id/photo` | Yes | Yes |
| 12 | DELETE | `/api/types/:id/photo` | Yes | Yes |
| 13 | PATCH | `/api/types/:id` | Yes | Yes |
| 14 | DELETE | `/api/types/:id` | Yes | Yes |
| 15 | GET | `/api/assets` | Yes | No |
| 16 | GET | `/api/assets/reports/overview` | Yes | Yes |
| 17 | POST | `/api/assets` | Yes | Yes |
| 18 | POST | `/api/assets/batch` | Yes | Yes |
| 19 | PATCH | `/api/assets/bulk-status` | Yes | No (role-based) |
| 20 | POST | `/api/assets/request-rental` | Yes | No |
| 21 | POST | `/api/assets/calculate-cost` | Yes | No |
| 22 | POST | `/api/assets/request-extension` | Yes | No |
| 23 | PATCH | `/api/assets/extension-request` | Yes | Yes |
| 24 | POST | `/api/assets/reset-seed` | Yes | Yes |
| 25 | GET | `/api/assets/rental-history` | Yes | No |
| 26 | POST | `/api/assets/:id/photo` | Yes | Yes |
| 27 | DELETE | `/api/assets/:id/photo` | Yes | Yes |
| 28 | PATCH | `/api/assets/:id` | Yes | Yes |
| 29 | DELETE | `/api/assets/:id` | Yes | Yes |
| 30 | GET | `/api/test-cpu` | No | No |
