# Deliveries API Specification

Deliveries represent the dispatch lifecycle of a webhook event to a registered endpoint URL. Each delivery contains a durable log of individual HTTP attempts, status transitions (`pending`, `success`, `failed`, `retrying`), and retry capabilities.

---

## 1. List Deliveries

Returns a list of deliveries for the application.

- **Method**: `GET`
- **Path**: `/api/v1/application/{application_id}/deliveries` (or `/application/{application_id}/deliveries`)
- **Query Parameters**:
  - `limit` (default: 50, max: 100)
  - `offset` (default: 0)
  - `endpoint_id` (optional filter by destination endpoint)
  - `event_id` (optional filter by originating event)

### Response (`200 OK`)
```json
{
  "status": true,
  "message": "Deliveries retrieved successfully",
  "data": {
    "deliveries": [
      {
        "id": "a90df7f2-c94b-489e-8fa1-0164c8f2f2e8",
        "event_id": "1e5db5ad-323b-465d-a068-15a995724e88",
        "endpoint_id": "d04135e6-7648-4cb2-bb8d-71b315ca40fa",
        "endpoint_url": "https://api.merchant.com/webhooks",
        "event_type_name": "order.completed",
        "status": "success",
        "attempts": 1,
        "created_at": "2026-11-11T22:30:00Z"
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

---

## 2. Get Delivery Details

Retrieves full delivery state, originating event payload, and the historical log of HTTP delivery attempts.

- **Method**: `GET`
- **Path**: `/api/v1/application/{application_id}/deliveries/{delivery_id}` (or `/application/{application_id}/deliveries/{delivery_id}`)

### Response (`200 OK`)
```json
{
  "status": true,
  "message": "Delivery retrieved successfully",
  "data": {
    "id": "a90df7f2-c94b-489e-8fa1-0164c8f2f2e8",
    "event_id": "1e5db5ad-323b-465d-a068-15a995724e88",
    "endpoint_id": "d04135e6-7648-4cb2-bb8d-71b315ca40fa",
    "endpoint_url": "https://api.merchant.com/webhooks",
    "event_type_name": "order.completed",
    "status": "success",
    "attempts": 1,
    "created_at": "2026-11-11T22:30:00Z",
    "event_payload": {
      "event": "order.completed",
      "order_id": "ord_99812"
    },
    "attempts_list": [
      {
        "id": "4b684cb3-00e9-4e08-96aa-bca08779b69b",
        "delivery_id": "a90df7f2-c94b-489e-8fa1-0164c8f2f2e8",
        "attempt_number": 1,
        "request_headers": {
          "User-Agent": "TrueHook/1.0",
          "webhook-id": "del_123"
        },
        "response_status": 200,
        "response_body": "{\"received\": true}",
        "duration_ms": 42,
        "created_at": "2026-11-11T22:30:01Z"
      }
    ]
  }
}
```

---

## 3. Replay Delivery

Triggers a redelivery of a message to an endpoint using the exact original event payload and stable event ID.

- **Method**: `POST`
- **Path**: `/api/v1/application/{application_id}/deliveries/{delivery_id}/replay` (or `/application/{application_id}/deliveries/{delivery_id}/replay`)

### Response (`200 OK`)
```json
{
  "status": true,
  "message": "Delivery replay scheduled successfully",
  "data": {
    "id": "a90df7f2-c94b-489e-8fa1-0164c8f2f2e8",
    "status": "pending",
    "attempts": 1
  }
}
```

---

## 4. Delivery Attempts API

Inspect individual HTTP attempt records.

- **List Attempts**: `GET /api/v1/application/{application_id}/deliveries/{delivery_id}/attempts`
- **Get Attempt Details**: `GET /api/v1/application/{application_id}/deliveries/{delivery_id}/attempts/{attempt_id}`
- **Record Attempt**: `POST /api/v1/application/{application_id}/deliveries/{delivery_id}/attempts`
