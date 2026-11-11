# TrueHook — Frontend Applications (`apps/`)

This directory contains the user-facing web applications for TrueHook, built with Next.js (App Router), React 19, TypeScript, and Tailwind CSS.

---

## 1. Applicable Skills

When working inside `apps/`, AI agents must consult and follow these skills:
- **`frontend-components`** (`.agents/skills/frontend-components/SKILL.md`): Modular directory structure, component layers, prop interfaces, atomic design, and catalog documentation protocols.
- **`frontend-design`** (`.agents/skills/frontend-design/SKILL.md`): Design tokens, strict 5-color palette constraints, typography scale, visual hierarchy, and minimalist UX principles.
- **`testing`** (`.agents/skills/testing/SKILL.md`): Component unit tests, mock API handlers, error states, and user interaction tests.
- **`security-review`** (`.agents/skills/security-review/SKILL.md`): Client-side secret isolation, safe payload rendering (XSS prevention), and auth tokens.

---

## 2. Applications & Boundaries

| Directory | Application | Target Audience | Primary Responsibilities |
| :--- | :--- | :--- | :--- |
| `apps/web` | `@truehook/web` | Public visitors & developers | Marketing landing page, public documentation, product overview. |
| `apps/dashboard` | `@truehook/dashboard` | Authenticated customers | Managing webhook endpoints, viewing delivery attempts, payload inspection, manual replay triggers, API keys, delivery metrics. |
| `apps/admin` | `@truehook/admin` | Internal TrueHook operators | Internal company back-office console, system configuration, tenant management, cross-tenant telemetry, system health. |

---

## 3. Architecture & Modularity Rules

All apps follow the strict 3-tier modular hierarchy:

1. **Tier 1: Atomic UI Primitives (`src/components/ui/`)**:
   - Generic, accessible, and purely presentational (NO business logic, NO direct API calls).
   - Only include component adapters that are **actually used** in this app. Never dump unused re-exports or shadcn clones.
   - Base implementations live in `@truehook/ui` (`packages/ui`).
2. **Tier 2: Domain Feature Modules (`src/modules/<feature>/`)**:
   - Feature-specific UI, hooks, state, schemas, and API client interactions (`modules/auth/`, `modules/endpoints/`, `modules/events/`, etc.).
   - Handle all 4 UI states: Loading, Empty, Error, and Success.
3. **Tier 3: Route Shells (`src/app/**/page.tsx`)**:
   - Next.js App Router entry points must remain lightweight shells (<80 lines) composing feature modules and layouts.
   - No complex state management or inline queries in page files.

---

## 4. Strict 5-Color Palette & Theme Modes (Mandatory)

All UI elements across `apps/` must strictly adhere to the 5-color palette:

| Color | Hex | Visual Weight | Usage |
| :--- | :--- | :--- | :--- |
| **Major Dark** | `#141412` | 50–60% | Obsidian dark canvas in dark mode; primary high-contrast typography in light mode. |
| **Major Light** | `#f2f2e8` / `#ffffff` | 30–35% | White canvas in light mode (`#ffffff`), parchment cream text/borders in dark mode (`#f2f2e8`). |
| **Accent Blue** | `#124060` | 5–8% | Nautical blue. Primary CTAs, active nav items, focus rings, links. |
| **Accent Coral** | `#ea5c47` | 2–4% | Coral red. Failed attempt badges, destructive actions, critical error banners. |
| **Accent Brass** | `#c39f59` | 2–4% | Warm brass. Warning badges, retrying status, pending indicators. |

> **Rule**: Major scheme (`#141412` and `#ffffff` / `#f2f2e8`) must dominate **85–90%** of UI surfaces. Accents are used sparingly (10–15% max). Never introduce foreign colors.

### Theme Modes:
- **`apps/web`**: White/light mode throughout.
- **`apps/dashboard`**: **White/light mode for everything** (just like `apps/web`), **ONLY `/login` and `/register` are black/dark mode** (`.dark`, `bg-[#141412]`, `BackgroundSVG`, `#f2f2e8` text).
- **`apps/admin`**: Consistent with internal operator console specifications.

---

## 5. Security & Developer Rules

- **Zero Secret Exposure**: Never expose API signing secrets, private keys, or operator tokens in client bundles or public responses.
- **Payload Safety**: Truncate and sanitize webhook payloads and delivery response bodies rendered in the browser.
- **Update Documentation on Every Change**: Any addition or modification of pages, modules, or components must be documented in `docs/frontend/`.
