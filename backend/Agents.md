# TrueHook Backend Services (`backend/`)

This directory contains the Go backend services, HTTP APIs, background workers, and shared Go packages for TrueHook.

---

## 1. Applicable Skills

When working in `backend/`, AI agents must consult and follow:
- **`go-backend`** (`.agents/skills/go-backend/SKILL.md`): Idiomatic Go, error wrapping, bounded concurrency, graceful shutdown, context propagation.
- **`api-design`** (`.agents/skills/api-design/SKILL.md`): REST API conventions, input validation, consistent JSON error responses, pagination.
- **`webhook-delivery`** (`.agents/skills/webhook-delivery/SKILL.md`): At-least-once delivery, attempt recording, exponential backoff with jitter, worker lifecycle.
- **`database-design`** (`.agents/skills/database-design/SKILL.md`): PostgreSQL schemas, SQL migrations, query indexes, UTC timestamps, avoiding N+1 queries.
- **`security-review`** (`.agents/skills/security-review/SKILL.md`): SSRF protection (blocking loopback/private/metadata IPs), constant-time HMAC-SHA256 verification, safe header filtering.
- **`testing`** (`.agents/skills/testing/SKILL.md`): Unit tests, database integration tests, queue delivery tests, concurrency checks.

---

## 2. Directory Layout & Architecture

- `backend/api/`: Public & internal HTTP REST API server (`cmd/api`, `internal/handlers`, `internal/service`, `internal/routes`).
- `backend/worker/`: Asynchronous webhook delivery consumer worker processing events published to NATS JetStream.
- `backend/packages/`: Shared Go packages:
  - `database/`: Database connection pool, schema, migrations, queries.
  - `nats/`: JetStream connection and stream publishers/consumers.
  - `common/`: Standard errors and response helpers.

---

## 3. Core Architectural & Security Rules

1. **At-Least-Once Delivery**: Never promise exactly-once. Store each HTTP attempt with status code, latency, headers, and bounded response body.
2. **SSRF Protection**: Strictly validate endpoint URLs. Block loopback (`127.0.0.1`), private RFC1918 ranges, link-local, and cloud metadata (`169.254.169.254`). Revalidate DNS on connection.
3. **Webhook Signatures**: Sign payloads with HMAC-SHA256, include timestamp headers, use constant-time comparison (`subtle.ConstantTimeCompare`).
4. **Context Propagation**: Always pass `context.Context` through all I/O calls. Never drop context deadlines.
5. **Database Discipline**: All schema changes require explicit migrations. All timestamps stored in UTC. Design indexes for actual query patterns.
6. **Documentation**: Keep `docs/api/`, `docs/architecture/`, and `docs/database/` updated on every change.
