# TrueHook Marketing & Public Site (`apps/web`)

The public-facing website, marketing landing page, and documentation for TrueHook.

---

## 1. Applicable Skills

- **`frontend-components`** (`.agents/skills/frontend-components/SKILL.md`): Clean modular component layers, exported TypeScript interfaces, thin route shells.
- **`frontend-design`** (`.agents/skills/frontend-design/SKILL.md`): Utilitarian developer-focused landing page aesthetic, strict 5-color palette, high-contrast typography, generous whitespace.
- **`testing`** (`.agents/skills/testing/SKILL.md`): Public page rendering, accessibility checks, links and CTA tests.

---

## 2. Scope & Responsibilities

- **Public Marketing**: Clear value proposition (Svix-style webhook reliability, developer experience, security, observability).
- **Public Documentation**: Getting started guides, webhook signature verification code samples, API overview, SDK usage.
- **Auth Entry**: Direct links into `@truehook/dashboard` auth flows (`/login`, `/register`).

---

## 3. Directory Layout & Active Components

```
apps/web/src/
├── app/                      # Next.js App Router (thin route shells)
│   ├── layout.tsx            # Global HTML layout & typography
│   ├── page.tsx              # Landing page route shell
│   └── not-found.tsx         # Custom 404 page shell
│
├── components/               # Active local component adapters
│   └── ui/                   # Used UI adapters re-exported from @truehook/ui
│       └── not-found.tsx     # Custom interactive 404 primitive
│
└── modules/                  # Marketing feature domains (landing, docs, features)
```

> **Important**: Do not add unused component wrappers to `src/components/ui/` or `src/components/background/`. Only import adapters from `@truehook/ui` when they are actively required by a page or module.

---

## 4. Design System & Constraints

- **Strict 5-Color System**:
  - Dominant major scheme (85–90%): `#141412` (obsidian canvas) and `#f2f2e8` (parchment cream text and borders).
  - Subtle accents (10–15%): `#124060` (primary CTA buttons), `#ea5c47` (rare accent), `#c39f59` (subtle warm highlights).
- **Minimalist Aesthetic**: Sharp borders, zero flashy decorative gradients or heavy drop shadows, fast load performance, responsive mobile layout.
- **Documentation**: Record changes in `docs/frontend/pages.md` and `docs/frontend/components.md`.
