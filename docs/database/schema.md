# TrueHook Database Schema

This document outlines the core relational database schema managed in PostgreSQL.

## Tables

### `admins`
Internal administration console operators.
- `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
- `name` (VARCHAR(255), Not Null, Default: `'Admin'`)
- `email` (VARCHAR(255), Unique, Not Null)
- `password_hash` (TEXT, Not Null)
- `created_at` (TIMESTAMPTZ, Default: `NOW()`)

### `users`
Customer accounts and organizations.
- `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
- `logo_url` (VARCHAR(500), Nullable) - Profile or organization avatar URL.
- `name` (VARCHAR(255), Not Null, Default: `'Guest'`) - Display / user name.
- `email` (VARCHAR(255), Unique, Not Null)
- `password_hash` (TEXT, Not Null)
- `created_at` (TIMESTAMPTZ, Default: `NOW()`)

### `applications`
Logical sources of webhook events.
- `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
- `logo_url` (VARCHAR(500), Nullable) - Brand logo or icon URL for the application.
- `user_id` (UUID, Not Null, Foreign Key: `users(id)` ON DELETE CASCADE)
- `name` (VARCHAR(255), Not Null)
- `description` (TEXT, Nullable)
- `created_at` (TIMESTAMPTZ, Default: `NOW()`)

### `event_types`
Registered event types belonging to an application.
- `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
- `application_id` (UUID, Not Null, Foreign Key: `applications(id)` ON DELETE CASCADE)
- `name` (VARCHAR(255), Not Null)
- `description` (TEXT, Nullable)
- `created_at` (TIMESTAMPTZ, Not Null, Default: `NOW()`)
- Constraints: `UNIQUE (application_id, name)`

### `endpoints`
Destination webhook URLs.
- `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
- `application_id` (UUID, Not Null, Foreign Key: `applications(id)` ON DELETE CASCADE)
- `url` (TEXT, Not Null)
- `secret_encrypted` (TEXT, Not Null)
- `enabled` (BOOLEAN, Not Null, Default: `TRUE`)
- `created_at` (TIMESTAMPTZ, Default: `NOW()`)

### `endpoint_event_types`
Join table mapping webhook endpoints to the specific event types they subscribe to. If an endpoint has no entries, it receives all event types by default.
- `endpoint_id` (UUID, Not Null, Foreign Key: `endpoints(id)` ON DELETE CASCADE)
- `event_type_id` (UUID, Not Null, Foreign Key: `event_types(id)` ON DELETE CASCADE)
- Primary Key: `(endpoint_id, event_type_id)`

### `events`
Published webhook events emitted by applications.
- `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
- `application_id` (UUID, Not Null, Foreign Key: `applications(id)` ON DELETE CASCADE)
- `event_type_id` (UUID, Not Null, Foreign Key: `event_types(id)`)
- `payload` (JSONB, Not Null)
- `created_at` (TIMESTAMPTZ, Default: `NOW()`)

### `deliveries`
Fanout dispatch tasks representing an attempt to deliver an event to a registered endpoint.
- `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
- `event_id` (UUID, Not Null, Foreign Key: `events(id)` ON DELETE CASCADE)
- `endpoint_id` (UUID, Not Null, Foreign Key: `endpoints(id)` ON DELETE CASCADE)
- `status` (VARCHAR(30), Not Null, Default: `'pending'`)
- `attempts` (INTEGER, Default: `0`)
- `next_attempt_at` (TIMESTAMPTZ, Nullable)
- `created_at` (TIMESTAMPTZ, Default: `NOW()`)
- Constraints: `UNIQUE (event_id, endpoint_id)`

### `delivery_attempts`
Individual HTTP request attempts performed for a delivery task.
- `id` (UUID, Primary Key, Default: `gen_random_uuid()`)
- `delivery_id` (UUID, Not Null, Foreign Key: `deliveries(id)` ON DELETE CASCADE)
- `attempt_number` (INTEGER, Not Null)
- `request_headers` (JSONB, Nullable)
- `response_status` (INTEGER, Nullable)
- `response_body` (TEXT, Nullable)
- `error_message` (TEXT, Nullable)
- `duration_ms` (INTEGER, Nullable)
- `created_at` (TIMESTAMPTZ, Default: `NOW()`)
