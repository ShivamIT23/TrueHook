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
  email, password_hash
) VALUES (
  $1, $2
)
RETURNING *;

-- name: UpdateUser :exec
UPDATE users
  set email = $2,
  password_hash = $3
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

-- name: GetApplicationsByUserId :one
SELECT * FROM applications
WHERE user_id = $1;

-- name: ListApplications :many
SELECT * FROM applications
ORDER BY name;

-- name: CreateApplication :one
INSERT INTO applications (
  user_id, name, description
) VALUES (
  $1, $2, $3
)
RETURNING *;

-- name: UpdateApplication :exec
UPDATE applications
  set name = $3 , description = $4
WHERE id = $1 AND user_id=$2;

-- name: DeleteApplication :exec
DELETE FROM applications
WHERE id = $1 AND user_id = $2;