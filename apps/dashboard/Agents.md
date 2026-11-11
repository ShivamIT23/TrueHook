# TrueHook Customer Dashboard (`apps/dashboard`)

The customer-facing authenticated portal for developers and teams using TrueHook.

---

## 1. Applicable Skills

- **`frontend-components`** (`.agents/skills/frontend-components/SKILL.md`): Modular component layers, generic atomic UI primitives, feature module scoping, typed props interfaces.
- **`frontend-design`** (`.agents/skills/frontend-design/SKILL.md`): Utilitarian developer-focused UX, strict 5-color palette, high-contrast tables and attempt logs, subtle snappy micro-interactions.
- **`api-design`** (`.agents/skills/api-design/SKILL.md`): Aligning frontend data models and queries with backend REST contracts.
- **`webhook-delivery`** (`.agents/skills/webhook-delivery/SKILL.md`): Accurately displaying delivery attempts, HTTP status codes, backoff timelines, event replays, and endpoint health states.
- **`security-review`** (`.agents/skills/security-review/SKILL.md`): Never exposing full signing secrets after creation, sanitizing payloads, enforcing workspace/organization scoping.
- **`testing`** (`.agents/skills/testing/SKILL.md`): User interactions, delivery filtering, manual replay triggering, API error states.

---

## 2. Core Domain & Customer Workflows

- **Applications**: Managing logical sources of events.
- **Endpoints**: Registering customer destination webhook URLs, configuring subscriptions, secret rotation, disabling failed endpoints.
- **Events & Payloads**: Inspecting published events, payload content, event timestamps, and delivery fanout.
- **Deliveries & Attempts**: Real-time attempt inspection, HTTP response codes, response headers (sanitized), attempt duration, failure reasons, and manual re-triggering.
- **Endpoint Health & Metrics**: Delivery success rates, latency histograms, backoff retry indicators.

---

## 3. Directory Layout & Active Components

```
apps/dashboard/src/
├── app/                      # Next.js App Router (thin route shells)
│   ├── layout.tsx            # Global dashboard layout & providers
│   ├── page.tsx              # Overview/home route shell
│   ├── login/page.tsx        # Customer login route shell
│   ├── register/page.tsx     # Customer registration route shell
│   └── not-found.tsx         # Custom 404 route shell
│
├── components/               # Active local component adapters
│   ├── background/
│   │   └── BackgroundSVG.tsx # Subtle dark wave backdrop for auth
│   └── ui/                   # Used UI adapters re-exported from @truehook/ui
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── not-found.tsx
│       └── separator.tsx
│
└── modules/                  # Customer feature domains
    └── auth/                 # Authentication module
        ├── AuthFooter.tsx
        ├── LoginForm.tsx
        ├── RegisterForm.tsx
        ├── SocialButtons.tsx
        └── TrueHookLogo.tsx
```

> **Important**: Do not add unused component wrappers to `src/components/ui/`. Only add adapters from `@truehook/ui` when they are actively imported and used by a dashboard module or page.

---

## 4. Design & Delivery Presentation Rules

- **Theme Modes (White/Light Default, Dark Auth Only)**:
  - **White/Light Mode by Default**: The dashboard portal (`/`, endpoints, events, deliveries, metrics, settings) uses **white/light mode for everything**, just like `apps/web`.
    - Canvas: Clean white (`#ffffff` / `bg-white`).
    - Text: High-contrast obsidian (`#141412`) for primary typography, `#70706a` for muted labels.
    - Surfaces & Cards: `#ffffff` background with crisp light borders (`#e5e5dc`).
    - Accents: Nautical blue (`#124060`) for primary buttons/CTAs, warm brass (`#c39f59`) for pending/warning states, coral red (`#ea5c47`) for errors/destructive actions.
  - **Dark Mode Scoped Exception**: **ONLY `/login` and `/register`** routes use black/dark mode (`.dark` class, `bg-[#141412]` canvas, `BackgroundSVG`, `#f2f2e8` text, translucent `#181816`/90 cards).
- **Strict 5-Color System**:
  - Major Scheme (85–90%): White (`#ffffff`) / Obsidian (`#141412`) and Parchment (`#f2f2e8` in dark auth).
  - Subtle Accents (10–15% max): Nautical Blue (`#124060`), Coral Red (`#ea5c47`), Warm Brass (`#c39f59`).
- **Delivery Truthfulness**: Webhook delivery is at-least-once. Clearly show attempt counts, timestamps in UTC, and distinguish between a failed attempt and a permanently failed delivery.
- **Documentation**: Update `docs/frontend/pages.md` and `docs/frontend/components.md` on every change.
