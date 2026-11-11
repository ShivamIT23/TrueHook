# TrueHook Go Services (`services/`)

This directory houses service modules and workers for TrueHook.

---

## 1. Applicable Skills

- **`go-backend`** (`.agents/skills/go-backend/SKILL.md`): Idiomatic Go, error handling, worker loops, bounded concurrency, graceful shutdown.
- **`webhook-delivery`** (`.agents/skills/webhook-delivery/SKILL.md`): JetStream event processing, HTTP attempts, exponential backoff retries, delivery states.
- **`api-design`** (`.agents/skills/api-design/SKILL.md`): HTTP handlers, middleware, request validation, structured JSON errors.
- **`database-design`** (`.agents/skills/database-design/SKILL.md`): PostgreSQL transactions, migrations, indexing, UTC timestamps.
- **`security-review`** (`.agents/skills/security-review/SKILL.md`): SSRF protection, HMAC-SHA256 signature verification, secret masking.
- **`testing`** (`.agents/skills/testing/SKILL.md`): Service unit and integration tests.

---

## 2. Directory Structure

- `services/api/`: HTTP API server implementation and endpoint routing.
- `services/worker/`: Webhook delivery consumer worker and retry scheduler.
- `services/config/`: Centralized service configuration loading from environment variables.

---

## 3. Core Architectural Rules

1. **Separation of Concerns**: Keep HTTP transport, business logic, data access, and event queues strictly separated.
2. **Context Deadlines**: Outgoing webhook deliveries must have strict timeouts and respect context cancellation.
3. **SSRF Guard**: Never send an outgoing webhook request without validating the target IP and blocking private/link-local/cloud metadata addresses.
4. **Reliability**: Exponential backoff with random jitter for retries. Do not rely exclusively on in-memory timers.
5. **Documentation**: Update documentation in `docs/` whenever service behavior or APIs change.
