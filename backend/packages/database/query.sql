-- name: GetAdminById :one
SELECT * FROM admins
WHERE id = $1 LIMIT 1;

-- name: GetAdminByEmail :one
SELECT * FROM admins
WHERE email = $1 LIMIT 1;

-- name: CreateAdmin :one
INSERT INTO admins (
  name, email, password_hash
) VALUES (
  $1, $2, $3
)
RETURNING *;

-- name: UpdateAdmin :exec
UPDATE admins
  set name = $2,
  email = $3
WHERE id = $1;

-- name: UpdateAdminPassword :exec
UPDATE admins
  set password_hash = $2
WHERE id = $1;

-- name: GetUserById :one
SELECT * FROM users
WHERE id = $1 LIMIT 1;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1 LIMIT 1;

-- name: ListUsers :many
SELECT * FROM users
ORDER BY email;

-- name: CreateUser :one
INSERT INTO users (
  name, email, password_hash
) VALUES (
  $1, $2, $3
)
RETURNING *;

-- name: UpdateUser :exec
UPDATE users
  set name = $2,
  email = $3,
  password_hash = $4,
  logo_url = $5
WHERE id = $1;

-- name: DeleteUser :exec
DELETE FROM users
WHERE id = $1;

-- name: GetApplicationById :one
SELECT * FROM applications
WHERE id = $1 AND user_id = $2 LIMIT 1;

-- name: GetApplicationByName :one
SELECT * FROM applications
WHERE name = $1 AND user_id = $2 LIMIT 1;

-- name: GetApplicationsByUserId :many
SELECT * FROM applications
WHERE user_id = $1;

-- name: ListApplications :many
SELECT * FROM applications
ORDER BY name;

-- name: CreateApplication :one
INSERT INTO applications (
  user_id, name, description, logo_url
) VALUES (
  $1, $2, $3, $4
)
RETURNING *;

-- name: UpdateApplication :exec
UPDATE applications
  set name = $3, description = $4, logo_url = $5
WHERE id = $1 AND user_id = $2;

-- name: DeleteApplication :exec
DELETE FROM applications
WHERE id = $1 AND user_id = $2;

-- name: CreateEventType :one
INSERT INTO event_types (
  application_id, name, description
) VALUES (
  $1, $2, $3
)
RETURNING *;

-- name: UpdateEventType :exec
UPDATE event_types et
SET
    name = $3,
    description = $4
FROM applications a
WHERE et.id = $1
  AND et.application_id = a.id
  AND a.user_id = $2;

-- name: GetEventTypesByApplicationId :many
SELECT et.*
FROM event_types et
JOIN applications a
    ON et.application_id = a.id
WHERE et.application_id = $1
  AND a.user_id = $2;

-- name: GetEventTypeById :one
SELECT et.*
FROM event_types et
JOIN applications a
    ON et.application_id = a.id
WHERE et.id = $1
  AND a.user_id = $2;

  
-- name: ListEventTypes :many
SELECT * FROM event_types
ORDER BY name;

-- name: DeleteEventType :exec
DELETE FROM event_types et
USING applications a
WHERE et.id = $1
  AND et.application_id = a.id
  AND a.user_id = $2;

-- name: CreateEndpoints :one
INSERT INTO endpoints (
  application_id, url, secret_encrypted
) VALUES (
  $1, $2, $3
)
RETURNING *;

-- name: UpdateEndpoints :exec
UPDATE endpoints et
SET
    url = $3,
    secret_encrypted = $4,
    enabled = $5
FROM applications a
WHERE et.id = $1
  AND et.application_id = a.id
  AND a.user_id = $2;

-- name: GetEndpointsByApplicationId :many
SELECT et.*
FROM endpoints et
JOIN applications a
    ON et.application_id = a.id
WHERE et.application_id = $1
  AND a.user_id = $2;

-- name: GetEndpointsById :one
SELECT et.*
FROM endpoints et
JOIN applications a
    ON et.application_id = a.id
WHERE et.id = $1
  AND a.user_id = $2;

  
-- name: ListEndpoints :many
SELECT * FROM endpoints
ORDER BY id;

-- name: DeleteEndpoints :exec
DELETE FROM endpoints et
USING applications a
WHERE et.id = $1
  AND et.application_id = a.id
  AND a.user_id = $2;

-- ============================================================================
-- Endpoint Event Types Queries
-- ============================================================================

-- name: AddEndpointEventType :exec
INSERT INTO endpoint_event_types (
  endpoint_id, event_type_id
) VALUES (
  $1, $2
)
ON CONFLICT DO NOTHING;

-- name: RemoveEndpointEventType :exec
DELETE FROM endpoint_event_types
WHERE endpoint_id = $1 AND event_type_id = $2;

-- name: DeleteEndpointEventTypesByEndpointId :exec
DELETE FROM endpoint_event_types
WHERE endpoint_id = $1;

-- name: GetEventTypesByEndpointId :many
SELECT et.*
FROM event_types et
JOIN endpoint_event_types eet ON et.id = eet.event_type_id
WHERE eet.endpoint_id = $1
ORDER BY et.name ASC;

-- name: GetSubscribedEventTypeIdsByEndpointId :many
SELECT event_type_id
FROM endpoint_event_types
WHERE endpoint_id = $1;

-- name: GetEndpointsByEventTypeId :many
SELECT ep.*
FROM endpoints ep
JOIN endpoint_event_types eet ON ep.id = eet.endpoint_id
WHERE eet.event_type_id = $1 AND ep.enabled = TRUE
ORDER BY ep.created_at ASC;

-- name: GetEndpointsForEventDelivery :many
SELECT ep.*
FROM endpoints ep
WHERE ep.application_id = $1
  AND ep.enabled = TRUE
  AND EXISTS (
    SELECT 1 FROM endpoint_event_types eet
    WHERE eet.endpoint_id = ep.id AND eet.event_type_id = $2
  )
ORDER BY ep.created_at ASC;

-- ============================================================================
-- Events Queries
-- ============================================================================

-- name: CreateEvent :one
INSERT INTO events (
  application_id, event_type_id, payload
) VALUES (
  $1, $2, $3
)
RETURNING *;

-- name: GetEventById :one
SELECT e.*, et.name AS event_type_name
FROM events e
JOIN applications a ON e.application_id = a.id
JOIN event_types et ON e.event_type_id = et.id
WHERE e.id = $1 AND a.user_id = $2
LIMIT 1;

-- name: ListEventsByApplicationId :many
SELECT e.*, et.name AS event_type_name
FROM events e
JOIN applications a ON e.application_id = a.id
JOIN event_types et ON e.event_type_id = et.id
WHERE e.application_id = $1 AND a.user_id = $2
ORDER BY e.created_at DESC
LIMIT $3 OFFSET $4;

-- name: CountEventsByApplicationId :one
SELECT COUNT(*)
FROM events e
JOIN applications a ON e.application_id = a.id
WHERE e.application_id = $1 AND a.user_id = $2;

-- ============================================================================
-- Deliveries Queries
-- ============================================================================

-- name: CreateDelivery :one
INSERT INTO deliveries (
  event_id, endpoint_id, status, attempts, next_attempt_at
) VALUES (
  $1, $2, $3, $4, $5
)
RETURNING *;

-- name: GetDeliveryById :one
SELECT d.*, ep.url AS endpoint_url, et.name AS event_type_name, e.payload AS event_payload
FROM deliveries d
JOIN endpoints ep ON d.endpoint_id = ep.id
JOIN events e ON d.event_id = e.id
JOIN event_types et ON e.event_type_id = et.id
JOIN applications a ON ep.application_id = a.id
WHERE d.id = $1 AND a.user_id = $2
LIMIT 1;

-- name: ListDeliveriesByApplicationId :many
SELECT d.*, ep.url AS endpoint_url, et.name AS event_type_name
FROM deliveries d
JOIN endpoints ep ON d.endpoint_id = ep.id
JOIN events e ON d.event_id = e.id
JOIN event_types et ON e.event_type_id = et.id
JOIN applications a ON ep.application_id = a.id
WHERE a.id = $1 AND a.user_id = $2
ORDER BY d.created_at DESC
LIMIT $3 OFFSET $4;

-- name: ListDeliveriesByEventId :many
SELECT d.*, ep.url AS endpoint_url, et.name AS event_type_name
FROM deliveries d
JOIN endpoints ep ON d.endpoint_id = ep.id
JOIN events e ON d.event_id = e.id
JOIN event_types et ON e.event_type_id = et.id
JOIN applications a ON ep.application_id = a.id
WHERE d.event_id = $1 AND a.user_id = $2
ORDER BY d.created_at DESC;

-- name: ListDeliveriesByEndpointId :many
SELECT d.*, ep.url AS endpoint_url, et.name AS event_type_name
FROM deliveries d
JOIN endpoints ep ON d.endpoint_id = ep.id
JOIN events e ON d.event_id = e.id
JOIN event_types et ON e.event_type_id = et.id
JOIN applications a ON ep.application_id = a.id
WHERE d.endpoint_id = $1 AND a.user_id = $2
ORDER BY d.created_at DESC
LIMIT $3 OFFSET $4;

-- name: UpdateDeliveryStatus :exec
UPDATE deliveries
SET status = $2, attempts = $3, next_attempt_at = $4
WHERE id = $1;

-- name: CountDeliveriesByApplicationId :one
SELECT COUNT(*)
FROM deliveries d
JOIN endpoints ep ON d.endpoint_id = ep.id
JOIN applications a ON ep.application_id = a.id
WHERE a.id = $1 AND a.user_id = $2;

-- ============================================================================
-- Delivery Attempts Queries
-- ============================================================================

-- name: CreateDeliveryAttempt :one
INSERT INTO delivery_attempts (
  delivery_id, attempt_number, request_headers, response_status, response_body, error_message, duration_ms
) VALUES (
  $1, $2, $3, $4, $5, $6, $7
)
RETURNING *;

-- name: ListDeliveryAttemptsByDeliveryId :many
SELECT da.*
FROM delivery_attempts da
JOIN deliveries d ON da.delivery_id = d.id
JOIN endpoints ep ON d.endpoint_id = ep.id
JOIN applications a ON ep.application_id = a.id
WHERE da.delivery_id = $1 AND a.user_id = $2
ORDER BY da.attempt_number ASC;

-- name: GetDeliveryAttemptById :one
SELECT da.*
FROM delivery_attempts da
JOIN deliveries d ON da.delivery_id = d.id
JOIN endpoints ep ON d.endpoint_id = ep.id
JOIN applications a ON ep.application_id = a.id
WHERE da.id = $1 AND a.user_id = $2
LIMIT 1;
