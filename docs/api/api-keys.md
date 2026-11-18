# API Keys & Credits Management API

The API Keys module manages developer API keys and tracks cumulative API credits consumed per key.

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/api` (or `/api/v1/api/create`, `/api-keys`) | Create an API key | Yes |
| `GET` | `/api/v1/api` (or `/api-keys`) | List all API keys for user | Yes |
| `GET` | `/api/v1/api/{id}` (or `/api-keys/{id}`) | Get API key details by ID | Yes |
| `PUT` / `PATCH` | `/api/v1/api/{id}/credits` (or `/api-keys/{id}/credits`) | Update or increment API credits | Yes |
| `POST` | `/api/v1/api/{id}/regenerate` (or `/api-keys/{id}/regenerate`) | Regenerate an API key | Yes |
| `DELETE` | `/api/v1/api/{id}` (or `/api-keys/{id}`) | Delete / revoke an API key | Yes |

---

## 1. Create API Key

### Request
`POST /api/v1/api`
`Content-Type: application/json`

```json
{
  "api_key": "th_live_custom_key_optional",
  "api_credits_used": 0
}
```
*Note: If `api_key` is omitted, TrueHook auto-generates a secure 24-byte random key with `th_live_` prefix.*

### Response (`201 Created`)
```json
{
  "success": true,
  "message": "API key created successfully",
  "data": {
    "id": "18f9720f-07ec-44f2-95f2-5369c0250df0",
    "api_key": "th_live_f893d5a4987f893f4124...",
    "user_id": "019318f7-7b24-7128-b80c-03c6ceeb07bc",
    "api_credits_used": 0,
    "created_at": "2026-11-19T01:00:00Z",
    "updated_at": "2026-11-19T01:00:00Z"
  }
}
```

---

## 2. List User API Keys

### Request
`GET /api/v1/api`

### Response (`200 OK`)
```json
{
  "success": true,
  "message": "API keys retrieved successfully",
  "data": {
    "apis": [
      {
        "id": "18f9720f-07ec-44f2-95f2-5369c0250df0",
        "api_key": "th_live_f893d5a4987f893f4124...",
        "user_id": "019318f7-7b24-7128-b80c-03c6ceeb07bc",
        "api_credits_used": 150,
        "created_at": "2026-11-19T01:00:00Z",
        "updated_at": "2026-11-19T01:05:00Z"
      }
    ]
  }
}
```

---

## 3. Update Credits

### Request
`PUT /api/v1/api/{id}/credits`

Increment credits:
```json
{
  "credits_to_add": 25
}
```

Or set absolute credits:
```json
{
  "api_credits_used": 1000
}
```

### Response (`200 OK`)
```json
{
  "success": true,
  "message": "API credits updated successfully",
  "data": {
    "id": "18f9720f-07ec-44f2-95f2-5369c0250df0",
    "api_key": "th_live_f893d5a4987f893f4124...",
    "user_id": "019318f7-7b24-7128-b80c-03c6ceeb07bc",
    "api_credits_used": 1000,
    "created_at": "2026-11-19T01:00:00Z",
    "updated_at": "2026-11-19T01:10:00Z"
  }
}
```

---

## 4. Regenerate Key

### Request
`POST /api/v1/api/{id}/regenerate`

```json
{
  "api_key": "optional_new_custom_key"
}
```

### Response (`200 OK`)
```json
{
  "success": true,
  "message": "API key regenerated successfully",
  "data": {
    "id": "18f9720f-07ec-44f2-95f2-5369c0250df0",
    "api_key": "th_live_new_secret_key...",
    "user_id": "019318f7-7b24-7128-b80c-03c6ceeb07bc",
    "api_credits_used": 1000,
    "created_at": "2026-11-19T01:00:00Z",
    "updated_at": "2026-11-19T01:12:00Z"
  }
}
```

---

## 5. Delete API Key

### Request
`DELETE /api/v1/api/{id}`

### Response (`200 OK`)
```json
{
  "success": true,
  "message": "API key deleted successfully",
  "data": {
    "id": "18f9720f-07ec-44f2-95f2-5369c0250df0",
    "api_key": "th_live_new_secret_key...",
    "user_id": "019318f7-7b24-7128-b80c-03c6ceeb07bc",
    "api_credits_used": 1000,
    "created_at": "2026-11-19T01:00:00Z",
    "updated_at": "2026-11-19T01:12:00Z"
  }
}
```
