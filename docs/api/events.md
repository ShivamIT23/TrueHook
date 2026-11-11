# Events API Specification

Events are webhook messages published by applications. Publishing an event automatically creates fanout delivery tasks for all active endpoints that subscribe to that event type (or all active endpoints if no specific filter is configured).

---

## 1. Publish Event

Publishes a new event for the specified application.

- **Method**: `POST`
- **Path**: `/api/v1/application/{application_id}/events` (or `/application/{application_id}/events`)
- **Authentication**: Bearer JWT (`Authorization: Bearer <token>`)

### Request Body
```json
{
  "event_type_id": "8fa95861-12f7-41ab-854e-4f38e68e4210",
  "payload": {
    "event": "order.completed",
    "order_id": "ord_99812",
    "amount_cents": 4900
  }
}
```

### Response (`201 Created`)
```json
{
  "status": true,
  "message": "Event published successfully",
  "data": {
    "id": "1e5db5ad-323b-465d-a068-15a995724e88",
    "application_id": "33c5e80d-a7c8-477d-815c-3f41ee1765c3",
    "event_type_id": "8fa95861-12f7-41ab-854e-4f38e68e4210",
    "event_type_name": "order.completed",
    "payload": {
      "event": "order.completed",
      "order_id": "ord_99812",
      "amount_cents": 4900
    },
    "deliveries_count": 2,
    "created_at": "2026-11-11T22:30:00Z",
    "deliveries": [
      {
        "id": "a90df7f2-c94b-489e-8fa1-0164c8f2f2e8",
        "endpoint_id": "d04135e6-7648-4cb2-bb8d-71b315ca40fa",
        "endpoint_url": "https://api.merchant.com/webhooks",
        "status": "pending",
        "attempts": 0,
        "created_at": "2026-11-11T22:30:00Z"
      }
    ]
  }
}
```

---

## 2. List Events

Returns a paginated stream of published events.

- **Method**: `GET`
- **Path**: `/api/v1/application/{application_id}/events` (or `/application/{application_id}/events`)
- **Query Parameters**:
  - `limit` (optional, default 50, max 100)
  - `offset` (optional, default 0)

### Response (`200 OK`)
```json
{
  "status": true,
  "message": "Events retrieved successfully",
  "data": {
    "events": [
      {
        "id": "1e5db5ad-323b-465d-a068-15a995724e88",
        "application_id": "33c5e80d-a7c8-477d-815c-3f41ee1765c3",
        "event_type_id": "8fa95861-12f7-41ab-854e-4f38e68e4210",
        "event_type_name": "order.completed",
        "payload": { "event": "order.completed" },
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

## 3. Get Event Details

Retrieves an event by its ID along with the list of fanout deliveries created for it.

- **Method**: `GET`
- **Path**: `/api/v1/application/{application_id}/events/{event_id}` (or `/application/{application_id}/events/{event_id}`)

### Response (`200 OK`)
```json
{
  "status": true,
  "message": "Event retrieved successfully",
  "data": {
    "id": "1e5db5ad-323b-465d-a068-15a995724e88",
    "application_id": "33c5e80d-a7c8-477d-815c-3f41ee1765c3",
    "event_type_id": "8fa95861-12f7-41ab-854e-4f38e68e4210",
    "event_type_name": "order.completed",
    "payload": { "event": "order.completed" },
    "deliveries_count": 1,
    "created_at": "2026-11-11T22:30:00Z",
    "deliveries": [
      {
        "id": "a90df7f2-c94b-489e-8fa1-0164c8f2f2e8",
        "endpoint_id": "d04135e6-7648-4cb2-bb8d-71b315ca40fa",
        "endpoint_url": "https://api.merchant.com/webhooks",
        "status": "pending",
        "attempts": 0,
        "created_at": "2026-11-11T22:30:00Z"
      }
    ]
  }
}
```
