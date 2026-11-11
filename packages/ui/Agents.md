# TrueHook UI Package (`packages/ui`)

The central component design system package (`@truehook/ui`) for TrueHook applications (`apps/web`, `apps/dashboard`, `apps/admin`).

---

## 1. Applicable Skills

- **`frontend-components`** (`.agents/skills/frontend-components/SKILL.md`): Primitive UI design, headless accessibility, TypeScript prop contracts, atomicity.
- **`frontend-design`** (`.agents/skills/frontend-design/SKILL.md`): Design tokens, 5-color palette enforcement, crisp contrast, focus states.
- **`testing`** (`.agents/skills/testing/SKILL.md`): Component rendering tests, keyboard navigation, accessible role testing.

---

## 2. Package Purpose & Architectural Principles

- **Pure Presentation Primitives**: Every component in `packages/ui/src/components/ui/` must be 100% generic, reusable, headless/presentational, and completely decoupled from TrueHook backend APIs or business logic.
- **Adapter Consumer Pattern**: Next.js apps (`web`, `dashboard`, `admin`) import or re-export components from `@truehook/ui`.
- **Strictly Typed Props**: Export typed interfaces extending standard React HTML attributes (e.g. `React.ButtonHTMLAttributes<HTMLButtonElement>`).
- **File Length Target**: Keep components small, clean, and under 100–150 lines.

---

## 3. Strict Custom Color Tokens (`globals.css` `:root`)

**MANDATORY RULE**: UI primitives must use custom color utility classes defined from `globals.css` (`:root`) and never use default Tailwind color scales (`gray-*`, `slate-*`, `zinc-*`, `blue-*`, etc.) or arbitrary hardcoded hexes:
- **`bg-canvas` / `bg-background` / `bg-card`**: Clean surfaces and container fills.
- **`text-foreground` / `text-muted-foreground`**: Primary text and muted secondary typography.
- **`border-border` / `border-input`**: Crisp 1px structural dividers and input outlines.
- **`bg-primary` / `text-primary` / `ring-ring`**: Primary interactive buttons and focus states.
- **`bg-destructive` / `text-destructive`**: Destructive variants, danger badges, error alerts.
- **`bg-brass` / `text-brass`**: Warning tags, retrying badges, subtle muted accents.

---

## 4. Documentation Protocol

When adding or modifying a UI primitive in `@truehook/ui`:
1. Register its props interface, variants, and purpose in `docs/frontend/components.md`.
2. Format and lint using Biome: `pnpm --filter @truehook/ui format && pnpm --filter @truehook/ui lint`.
