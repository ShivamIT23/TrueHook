# Project Structure

TrueHook is organized as a high-performance monorepo with explicit boundaries between frontend applications, backend services, documentation, and agent skills.

## Monorepo Layout

```
TrueHook/
├── .agents/                  # AI agent skills & instructions
│   └── skills/               # Reusable skills (frontend-components, go-backend, etc.)
│
├── apps/                     # Frontend Next.js applications (pnpm workspace)
│   ├── web/                  # Public website, marketing, documentation, auth entry (login/register)
│   ├── dashboard/            # Customer portal for logged-in users (webhooks, endpoints, logs)
│   └── admin/                # Internal administration console for TrueHook company operators
│
├── backend/                  # Backend Go services & packages
│   ├── api/                  # Main HTTP API service
│   ├── packages/             # Shared Go packages (database, models, etc.)
│   └── services/             # Background workers and delivery processors
│
├── docs/                     # Central project documentation
│   ├── api/                  # REST API & OpenAPI specifications
│   ├── architecture/         # System design, delivery flow, queue architecture
│   ├── database/             # Schema, migrations, relationships, indexes
│   ├── decisions/            # Architecture Decision Records (ADRs)
│   ├── development/          # Setup, testing, and structure guides
│   ├── frontend/             # Frontend architecture, design system, and component catalog
│   └── security/             # SSRF protection, signature verification, threat model
│
├── packages/                 # Shared TypeScript packages
│
├── AGENTS.md                 # Master project rules and agent instructions
├── docker-compose.yml        # Local development infrastructure (PostgreSQL, NATS)
├── package.json              # Monorepo root configuration & dev scripts
├── pnpm-workspace.yaml       # pnpm workspace definition
└── README.md                 # Project introduction
```

---

## Frontend Applications Comparison

| Application | Audience | Purpose & Key Features |
| :--- | :--- | :--- |
| **`apps/web`** | Public & Anonymous | Landing page, product overview, documentation, user registration, and authentication login. |
| **`apps/dashboard`** | Authenticated Customers | Organization workspace, webhook endpoint registration, event payload inspection, delivery attempt monitoring, manual delivery replay, and webhook secret rotation. |
| **`apps/admin`** | Internal Company Staff | TrueHook team back-office: platform-wide observability, cross-tenant management, frontend configuration/flag updates, and internal operations. |

---

## Shared Rules Across All Applications
1. **Modularity**: Code is structured into `src/component/ui/` (primitives), `src/modules/<feature>/` (domains), and `src/app/` (route shells).
2. **Color Palette**: Dominated by `#141412` and `#f2f2e8` (85–90%), with slight, deliberate usage of `#124060`, `#ea5c47`, and `#c39f59`.
3. **Minimalism**: Clean, utilitarian, developer-centric interfaces without visual clutter.
4. **Documentation**: Any modification must be documented immediately in `docs/`.
