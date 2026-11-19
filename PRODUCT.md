# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary**: Backend engineers, fullstack developers, and platform teams building SaaS or API services who need to publish outbound webhooks reliably to third-party customer endpoints.
- **Secondary**: TrueHook company operators and infrastructure administrators managing tenant health, system configuration, and fleet performance.

## Product Purpose

TrueHook provides dependable, secure, and observable developer-focused webhook infrastructure. It enables applications to register endpoints, publish events, deliver payloads reliably with automatic retries and jitter, inspect HTTP attempts in real time, verify signatures, and replay failed deliveries without building custom queue and retry pipelines from scratch.

## Positioning

A developer-first, Svix-style webhook engine emphasizing rock-solid reliability, strict SSRF and payload security, deep delivery diagnostics, and a distraction-free developer experience with clean high-contrast interfaces.

## Operating Context

- **Developers & Consumers**: Publish events via backend APIs or SDKs; monitor delivery streams, inspect raw payloads/headers, and trigger event replays inside `apps/dashboard`; consume documentation and onboard through `apps/web`.
- **Operators**: Oversee cross-tenant health, system configurations, and delivery queues through `apps/admin`.
- **Runtime Environment**: Go backend services, PostgreSQL database, NATS JetStream event bus, and Next.js React frontend applications.

## Capabilities and Constraints

- **At-Least-Once Delivery**: Guaranteed at-least-once delivery semantics using stable event and delivery IDs (never promises exactly-once).
- **Durable Retries**: Exponential backoff with jitter to eliminate thundering herds; independent retry state per endpoint.
- **Full Observability**: Detailed logging of every HTTP attempt (status code, sanitized headers, truncated response body, latency, failure reason).
- **Security & Integrity**: Webhook payloads signed with HMAC-SHA256 and timestamps; constant-time comparison; zero secret exposure to client apps; strict SSRF protections blocking private subnets, loopback, and cloud metadata.
- **Architectural Scope**:
  - `apps/web`: Public website, landing pages, documentation, and authentication flows (`/signin`, `/signup`).
  - `apps/dashboard`: Authenticated customer workspace for endpoint configuration, delivery logs, event replay, and metrics.
  - `apps/admin`: Internal operator console for cross-tenant management and system settings.
  - `packages/ui`: Shared primitive UI components.

## Brand Commitments

- **Name**: TrueHook
- **Voice & Tone**: Direct, technical, transparent, engineer-to-engineer. Free of marketing fluff.
- **Color Palette & Contrast**: Strict dual-tone canvas of `#F3EEE3` (clean cream) and `#111111` (obsidian) paired with a focused `#D9541E` (terracotta) accent.
- **Design Philosophy**: Minimalist, utilitarian, dense with diagnostic information, fast micro-interactions.

## Evidence on Hand

- Source code across Go backend services (`backend/`), frontend apps (`apps/web`, `apps/dashboard`, `apps/admin`), and UI package (`packages/ui`).
- Comprehensive documentation catalog in `docs/` (`docs/frontend/design-system.md`, `components.md`, `pages.md`, `architecture/`, `security/`).
- Repository instructions and architecture contracts in `AGENTS.md`.

## Product Principles

1. **Reliability First**: Webhooks must never vanish silently. Deliveries and retries are durable, persistent, and verifiable.
2. **Security Without Compromise**: SSRF prevention, HMAC signature verification, and complete isolation of signing secrets are mandatory.
3. **Transparent Observability**: Give developers complete visibility into every HTTP attempt, duration, status code, and payload response.
4. **Developer-Centric Restraint**: High-contrast, clean typography, fast interactions, and zero unnecessary visual noise.

## Accessibility & Inclusion

- Adherence to WCAG 2.1 AA contrast requirements across the cream, obsidian, and terracotta color system.
- Full keyboard accessibility and visible focus states for data tables, inspection drawers, and interactive controls.
