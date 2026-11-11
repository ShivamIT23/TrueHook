# TrueHook Frontend Architecture

## 1. Multi-App Architecture

TrueHook organizes frontend concerns into three dedicated Next.js applications located in `apps/`:

| Application | Directory | Intended Audience | Core Responsibilities |
| :--- | :--- | :--- | :--- |
| **Web** | `apps/web` | Public Visitors | Marketing landing pages, product features, and public documentation. |
| **Dashboard** | `apps/dashboard` | Logged-in Customers | Customer portal authentication (`/login`, `/register`) and webhook management: applications, endpoints, event payload streams, delivery attempts, manual retries, and API metrics. |
| **Admin** | `apps/admin` | Internal TrueHook Team | Back-office operations strictly for company operators: operator authentication (`/login`), platform configuration, frontend content/flag updates, cross-tenant management, and system metrics. |

---

## 2. Core Architectural Pillars

All three frontend applications strictly uphold four design pillars:

1. **Strict Modularity**:
   - `src/component/ui/`: Atomic, reusable, generic UI primitives (Button, Input, Card, Badge, Modal) with zero business logic.
   - `src/modules/<feature>/`: Domain-scoped feature modules (auth, endpoints, events, deliveries, admin-controls) encapsulating components, hooks, and types.
   - `src/component/`: Shared layout structures (Navbar, Sidebar, Backgrounds).
   - `src/app/**/page.tsx`: Thin Next.js App Router route orchestrators (<80 lines) that assemble modules.
2. **Minimalist Aesthetic**:
   - Utilitarian, developer-focused, uncluttered aesthetics.
   - Generous whitespace, precise typography, crisp borders, and subtle micro-transitions.
   - Avoid decorative gimmicks, noisy gradients, or heavy drop shadows.
3. **Strict 5-Color System**:
   - `#141412` (Obsidian Canvas) & `#f2f2e8` (Parchment Cream): Dominant major scheme (**85–90%** visual weight).
   - `#124060` (Nautical Blue), `#ea5c47` (Coral Red), and `#c39f59` (Warm Brass): Reserved for slight, deliberate accent usage (**10–15% max**).
4. **Mandatory Documentation on Every Change**:
   - Every page, component, or architectural change must be documented in `docs/frontend/` immediately.

---

## 3. Directory Blueprint (Per-App)

Every app (`apps/web`, `apps/dashboard`, `apps/admin`) adheres to this standardized layout:

```
apps/<app-name>/src/
├── app/                      # Next.js App Router (thin route composition only)
│   ├── layout.tsx            # Root layout and font variables
│   ├── globals.css           # Global Tailwind CSS v4 theme variables
│   └── page.tsx              # Thin page shell composing domain modules
│
├── component/                # Shared, cross-cutting UI
│   ├── ui/                   # Reusable atomic UI primitives (NO business logic)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── modal.tsx
│   ├── layout/               # Global layout structures (Navbar, Sidebar)
│   └── background/           # Background wrappers and SVG backdrops
│
└── modules/                  # Feature/domain-scoped logic
    ├── auth/                 # Domain components, hooks, and types
    ├── endpoints/            # Feature module
    └── ...
```

---

## 4. Documentation Index

- [Design System & 5-Color Palette](file:///T:/Personal%20(Working)/TrueHook/docs/frontend/design-system.md)
- [Component & Module Guidelines](file:///T:/Personal%20(Working)/TrueHook/docs/frontend/components.md)
- [Pages & Routes Catalog](file:///T:/Personal%20(Working)/TrueHook/docs/frontend/pages.md)

---

## 5. Agent & Developer Working Agreement

When building or updating pages and components across any frontend application:
1. Follow the `frontend-components` skill ([`.agents/skills/frontend-components/SKILL.md`](file:///T:/Personal%20(Working)/TrueHook/.agents/skills/frontend-components/SKILL.md)).
2. Respect the role separation (`web` for public/auth, `dashboard` for logged-in users, `admin` for internal operations).
3. Adhere strictly to the 5-color palette ratios.
4. Ensure all props have explicit TypeScript interfaces.
5. Run formatting and linting: `pnpm --filter <app> format && pnpm --filter <app> lint`.
6. Update `docs/frontend/` documentation on every change.
