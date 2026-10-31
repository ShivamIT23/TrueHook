# TrueHook — Project Instructions

## 1. Project Overview

TrueHook is a developer-focused webhook infrastructure platform.

Its purpose is to allow applications to:

- Register webhook endpoints.
- Publish events.
- Deliver events to customer endpoints.
- Retry failed deliveries.
- Inspect delivery attempts and responses.
- Verify webhook signatures.
- Replay previous events.
- Monitor endpoint health and delivery statistics.

The product should prioritize reliability, security, observability, and developer experience.

Think of TrueHook as a simplified Svix-style webhook delivery platform.

## 2. Technology Stack

### Backend

- Go
- PostgreSQL
- NATS JetStream for asynchronous event processing
- Redis only when a concrete use case requires it

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Monorepo

- pnpm workspaces for JavaScript/TypeScript packages
- Go modules for Go services

Do not attempt to manage Go dependencies through pnpm.

Do not introduce additional infrastructure or dependencies without explaining why they are needed.

## 3. Architecture Principles

Use clear separation between:

1. API layer
2. Business logic
3. Data access
4. Event publishing
5. Event processing
6. Webhook delivery
7. Retry scheduling
8. Observability

Keep business logic independent of HTTP handlers and database implementation wherever practical.

Prefer explicit interfaces and dependency injection over unnecessary abstractions.

Avoid creating a distributed system more complicated than the current requirements.

## 4. Core Domain Concepts

Understand these concepts before changing related code:

- Organization: A customer account or workspace.
- Application: A logical source of events.
- Endpoint: A customer's registered webhook URL.
- Event: An event published by an application.
- Delivery: An attempt to deliver an event to an endpoint.
- Attempt: An individual HTTP request made during delivery.
- Signing Secret: A secret used to authenticate webhook payloads.

An event and a delivery are not the same thing.

One event may produce multiple deliveries because an application can have multiple endpoints.

One delivery may have multiple attempts because failed deliveries can be retried.

Preserve this distinction throughout the database schema and application logic.

## 5. Go Coding Standards

- Use idiomatic Go.
- Follow standard Go project conventions.
- Keep packages focused and avoid circular dependencies.
- Pass context.Context through operations involving I/O.
- Handle errors explicitly.
- Wrap errors with useful context.
- Never silently ignore errors.
- Avoid global mutable state.
- Use interfaces where they provide meaningful testability or decoupling.
- Use graceful shutdown for servers and workers.
- Avoid goroutine leaks.
- Use bounded concurrency.
- Respect context cancellation and deadlines.
- Do not create unnecessary abstractions.

Prefer small, testable functions.

## 6. Webhook Delivery Rules

Webhook delivery must be designed for at-least-once delivery.

Never promise exactly-once delivery.

A customer endpoint may receive the same event more than once.

Every event must have a stable, unique event ID.

Every delivery must have a stable delivery ID.

Use the same event ID and payload when retrying a delivery.

Do not generate a new event for every retry.

Record each HTTP attempt separately.

Store:

- HTTP status code
- Response body, subject to configured size limits
- Response headers, subject to safe filtering
- Request duration
- Attempt number
- Failure reason
- Timestamp

Do not let one failing endpoint block deliveries to unrelated endpoints.

## 7. Retry Policy

Implement retry behavior as an explicit policy.

- Use exponential backoff.
- Add jitter to prevent synchronized retries.
- Respect configured maximum attempts.
- Support endpoint-level retry configuration only when needed.
- Make retry scheduling durable.
- Do not rely exclusively on in-memory timers.
- Distinguish retryable failures from permanent failures.
- Handle worker crashes and duplicate queue messages safely.

Retry policy changes must include tests.

## 8. Security Requirements

Security is a first-class requirement.

- Sign webhook payloads using HMAC-SHA256.
- Include a timestamp in signed requests.
- Document the exact signature format.
- Use constant-time signature comparison.
- Never log signing secrets.
- Never expose secret values in API responses.
- Validate endpoint URLs.
- Protect against SSRF.
- Block loopback, private, link-local, and cloud metadata destinations.
- Revalidate DNS resolutions and the actual connection destination.
- Restrict redirects or validate every redirect destination.
- Apply request and response size limits.
- Apply timeouts to outgoing HTTP requests.
- Authenticate API requests.
- Enforce organization-level authorization.
- Never trust organization IDs supplied by the client without checking ownership.

Do not weaken security to make implementation easier.

## 9. Database Rules

- Use explicit database migrations.
- Never silently modify production schema.
- Add appropriate indexes for frequently queried fields.
- Use transactions when multiple database changes must succeed together.
- Define foreign keys and deletion behavior deliberately.
- Store timestamps consistently in UTC.
- Use pagination for potentially large result sets.
- Avoid N+1 queries.
- Design indexes around actual query patterns.

Before changing a schema, explain the migration impact.

## 10. API Design

- Use consistent resource naming.
- Validate all incoming input.
- Return consistent error responses.
- Use appropriate HTTP status codes.
- Paginate list endpoints.
- Document public API behavior.
- Keep internal APIs separate from customer-facing APIs where necessary.
- Make event publishing and delivery operations observable.

Do not expose internal database models directly as public API responses.

## 11. Frontend Rules

- Use TypeScript strict mode.
- Keep components focused.
- Separate API communication from UI components.
- Handle loading, empty, success, and error states.
- Use reusable components for common UI patterns.
- Avoid unnecessary client-side state.
- Do not expose API secrets or signing secrets in the browser.
- Make dashboard data consistent with backend API contracts.
- Ensure responsive layouts and accessible controls.

The dashboard should prioritize developer usability and clear delivery diagnostics.

## 12. Testing Requirements

Add tests for meaningful behavior changes.

Backend:

- Unit tests for business logic.
- Integration tests for database operations.
- Tests for queue publishing and consumption.
- Tests for retries and duplicate messages.
- Tests for signature generation and verification.
- Tests for endpoint validation and SSRF protections.

Frontend:

- Tests for important user interactions.
- Tests for API error states.
- Tests for delivery history and endpoint management.

Test failure cases, not only successful cases.

Never claim a test passed unless it was actually executed.

## 13. Working Agreement

Before implementing a significant feature:

1. Inspect the existing codebase.
2. Read relevant documentation and existing patterns.
3. Identify affected modules.
4. Explain the proposed implementation.
5. Identify security and reliability implications.
6. Implement incrementally.
7. Add or update tests.
8. Run relevant checks.

Do not rewrite working code unnecessarily.

Do not invent existing functions, database tables, environment variables, or API routes.

Do not modify unrelated files.

If a requirement is ambiguous, state your assumption or ask a focused question.

## 14. Documentation

Document:

- Public API endpoints.
- Event payload formats.
- Webhook signature formats.
- Retry behavior.
- Environment variables.
- Local development setup.
- Database migrations.
- Important architectural decisions.

Keep documentation synchronized with implementation.

## 15. Definition of Done

A feature is not complete merely because the code compiles.

Before declaring work complete:

- Verify expected behavior.
- Run relevant tests.
- Check error handling.
- Check authorization.
- Check security implications.
- Check logging and observability.
- Update documentation where necessary.
- Report what was changed and what was not verified.
