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
