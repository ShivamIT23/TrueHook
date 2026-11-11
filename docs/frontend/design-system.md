# Design System & Color Tokens

## 1. TrueHook Color Tokens & Semantic Mappings

TrueHook employs a deliberate 5-color palette engineered for deep focus, clarity, and minimalist developer tooling.

### ⚠️ MANDATORY RULE: Always Use Custom Colors from `globals.css` `:root`
**Never use default Tailwind color scales (`gray-*`, `slate-*`, `zinc-*`, `blue-*`, etc.) or hardcoded hex strings.**
All styles must use semantic classes mapped from `globals.css` `:root`:

| Role | Color Value | Tailwind Utility Class | Description | Target Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Major Dark** | `#141412` | `text-foreground`, `bg-foreground` | High-contrast text in light mode; obsidian canvas in dark auth | **50–60%** |
| **Major Light** | `#fef8f3` / `#ffffff` | `bg-background`, `bg-canvas`, `bg-card` | Clean canvas, page background, card surfaces | **30–35%** |
| **Accent: Nautical Blue** | `#124060` | `bg-primary`, `text-primary`, `ring-ring` | Deep nautical blue. Primary actions, active navigation, focus rings | **5–8% (Slight)** |
| **Accent: Coral Red** | `#ea5c47` | `bg-destructive`, `text-destructive`, `text-coral` | Coral red. Destructive actions, failed attempt tags, high-severity alerts | **2–4% (Slight)** |
| **Accent: Warm Brass** | `#c39f59` | `text-brass`, `bg-brass` | Warm brass / gold. Warning badges, retrying status, subtle accents | **2–4% (Slight)** |

### Translation Matrix:
| ❌ Forbidden (Tailwind / Hex) | ✅ Required Custom Utility |
| :--- | :--- |
| `text-gray-500`, `text-slate-400`, `text-zinc-500` | `text-muted-foreground` |
| `text-gray-900`, `text-slate-900`, `text-black` | `text-foreground` |
| `bg-gray-100`, `bg-slate-50`, `bg-zinc-100` | `bg-secondary` or `bg-muted` |
| `border-gray-200`, `border-slate-200`, `border-zinc-200` | `border-border` or `border-input` |
| `bg-white` (containers / cards) | `bg-canvas` or `bg-card` or `bg-background` |
| `bg-blue-600`, `bg-[#124060]` | `bg-primary` (or `bg-blue`) |
| `text-red-600`, `bg-red-500`, `bg-[#ea5c47]` | `text-destructive`, `bg-destructive` |
| `text-yellow-600`, `text-amber-500`, `text-[#c39f59]` | `text-brass`, `bg-brass` |
| `ring-blue-500`, `ring-[#124060]` | `ring-ring` |

---

## 2. Palette Balance, Theme Modes & Rules

### Application Theme Modes:
- **`apps/web`**: Light/white mode throughout (`bg-white`, high-contrast `#141412` typography).
- **`apps/dashboard`**: **White/light mode for everything** (overview, endpoints, events, deliveries, metrics) just like `apps/web`. **ONLY the customer `/login` and `/register` routes** are black/dark mode (`.dark`, `bg-[#141412]`, `BackgroundSVG`, `#f2f2e8` text).
- **`apps/admin`**: Controlled by back-office operator theme specs.

- **Major Scheme Dominance**: White (`#ffffff`) and Obsidian (`#141412`) in light mode; Obsidian (`#141412`) and Parchment (`#f2f2e8`) in dark auth form the core foundation of every view, encompassing 85–90% of all visual area.
- **Slight / Controlled Accents**: The three accent colors (`#124060`, `#ea5c47`, `#c39f59`) must be used sparingly. They serve as intentional signals (action, error, warning) rather than decorative wallpaper.
- **High Contrast**: Ensure contrast ratios strictly satisfy WCAG AA standards (minimum 4.5:1 for body copy).
- **No Palette Creep**: Do not introduce arbitrary colors, purple tints, or random neon accents.

---

## 3. Minimalist Design Principles

1. **Utilitarian Focus**: Every pixel serves a functional purpose for developers monitoring and configuring webhooks.
2. **Whitespace & Rhythm**: Generous, deliberate whitespace (`p-4`, `p-6`, `gap-4`) creates hierarchy without resorting to heavy containers.
3. **Borders over Shadows**: Use clean 1px borders (`border border-[#f2f2e8]/10` or `border border-[#f2f2e8]/20`) rather than fuzzy drop shadows.
4. **Subtle Micro-Interactions**: Hover, focus, and active transitions should be fast and subtle (`transition-colors duration-150`). Avoid loud bounce effects or distracting keyframe animations.
5. **Clear Typography**:
   - Primary: `Inter` or `Geist Sans` for clean, highly legible UI copy.
   - Monospace: `Geist Mono` for payload previews, webhook URLs, headers, signatures, and UUIDs.

---

## 4. Theme Configuration in Tailwind CSS v4

Theme variables are declared in `apps/web/src/app/globals.css`:

```css
@import "tailwindcss";

:root {
  --background: #141412;
  --foreground: #f2f2e8;
  --canvas: #141412;
  --cream: #f2f2e8;
  --blue: #124060;
  --coral: #ea5c47;
  --brass: #c39f59;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-canvas: var(--canvas);
  --color-cream: var(--cream);
  --color-blue: var(--blue);
  --color-coral: var(--coral);
  --color-brass: var(--brass);
}
```
