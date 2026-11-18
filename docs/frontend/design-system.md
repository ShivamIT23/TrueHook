# Design System & Color Tokens

## 1. TrueHook Strict 3-Color Tokens & Semantic Mappings

TrueHook employs a strict 3-color palette engineered for deep focus, clarity, and minimalist developer tooling:
1. **`#F3EEE3` (Cream Canvas & Surfaces)**: 90% main surface canvas in light mode, text and border tones in dark mode.
2. **`#111111` (Obsidian Canvas & Text)**: 90% main text in light mode, canvas and surface backdrops in dark mode.
3. **`#D9541E` (Warm Terracotta Accent)**: Remaining 10% intentional accent for primary actions, buttons, links, active indicators, focus rings, highlights, and alerts.

All other extraneous colors (such as nautical blue, coral red, brass gold, arbitrary grays, and multi-colored gradients) are completely eliminated.

### ⚠️ MANDATORY RULE: Always Use Custom Semantic Colors from `globals.css` `:root`
**Never use default Tailwind color scales (`gray-*`, `slate-*`, `zinc-*`, `blue-*`, `red-*`, `amber-*`, etc.) or arbitrary hardcoded hex strings.**
All styles must use semantic classes mapped from `globals.css` `:root`:

| Role | Color Value | Tailwind Utility Class | Description | Target Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Cream Neutral** | `#F3EEE3` | `bg-background`, `bg-canvas`, `text-foreground` (dark), `text-primary-foreground` | Main canvas, card surfaces, and dark-mode high-contrast copy | **~45%** |
| **Obsidian Dark** | `#111111` | `text-foreground` (light), `bg-background` (dark), `bg-canvas` (dark), `border-border` | High-contrast text in light mode; background canvas in dark mode; crisp borders | **~45%** |
| **Terracotta Accent** | `#D9541E` | `bg-primary`, `text-primary`, `bg-secondary`, `bg-destructive`, `ring-ring` | Sole brand accent for buttons, CTAs, links, active indicators, badges, and focus rings | **10% Max** |
| **Neutral Surface** | `#F3EEE3` (light) / `#111111` (dark) | `bg-secondary2`, `text-secondary2` | Clean neutral background for table headers, hover states, badges, and code tags | Part of 90% |
| **Error / Destructive** | `#D9541E` (light) / `#E05E28` (dark) | `text-error`, `bg-error`, `text-destructive` | Error toasts, destructive indicators, failure tags | Semantics |
| **Warning Tone** | `#C38B22` (light) / `#E5A93C` (dark) | `text-warning`, `bg-warning` | Warning toasts, cautionary alerts | Semantics |
| **Success Tone** | `#2D6A4F` (light) / `#4EBA6F` (dark) | `text-success`, `bg-success` | Success toasts, completion status badges | Semantics |
| **Info Tone** | `#124060` (light) / `#4A90E2` (dark) | `text-info`, `bg-info` | Informational toasts and notices | Semantics |

### Translation Matrix:
| ❌ Forbidden (Tailwind / Hex) | ✅ Required Custom Utility |
| :--- | :--- |
| `text-gray-500`, `text-slate-400`, `text-zinc-500` | `text-muted-foreground` |
| `text-gray-900`, `text-slate-900`, `text-black` | `text-foreground` |
| `bg-gray-100`, `bg-slate-50`, `bg-zinc-100` | `bg-secondary2` or `bg-muted` |
| `border-gray-200`, `border-slate-200`, `border-zinc-200` | `border-border` or `border-input` |
| `bg-white` (containers / cards) | `bg-canvas` or `bg-card` or `bg-background` |
| `bg-blue-600`, `bg-[#124060]`, `bg-[#155eef]` | `bg-primary` or `bg-secondary` (`#D9541E`) |
| `bg-orange-500`, `bg-[#FF7034]` | `bg-secondary` or `bg-primary` (`#D9541E`) |
| `text-red-600`, `bg-red-500`, `bg-[#ea5c47]` | `text-destructive`, `bg-destructive` (`#D9541E`) |
| `text-yellow-600`, `text-amber-500`, `text-[#c39f59]` | `text-primary` (`#D9541E`) |
| `ring-blue-500`, `ring-[#124060]` | `ring-ring` (`#D9541E`) |

---

## 2. Palette Balance, Theme Modes & Rules

### Application Theme Modes:
- **`apps/web`**: Light/cream mode throughout (`bg-[#F3EEE3]`, high-contrast `#111111` typography, `#D9541E` accent).
- **`apps/dashboard`**: **Light mode for workspace views** (overview, applications, endpoints, events, deliveries, metrics) using `#F3EEE3` surfaces and `#111111` typography. **Customer `/signin` and `/signup` routes** are dark mode (`.dark`, `bg-[#111111]`, `BackgroundSVG`, `#F3EEE3` text, `#D9541E` accent).
- **`apps/admin`**: Operator console using `#111111`, `#F3EEE3`, and `#D9541E`.

- **Major Scheme Dominance (90%)**: Cream (`#F3EEE3`) and Obsidian (`#111111`) form the foundation of every interface.
- **Sole Accent (10%)**: `#D9541E` is reserved strictly for interactive actions, focus rings, badges, status highlights, and active navigation.
- **No Palette Creep**: Extraneous colors, blues, greens, yellows, and heavy drop shadows are completely prohibited.

---

## 3. Minimalist Design Principles

1. **Utilitarian Focus**: Every pixel serves a functional purpose for developers monitoring and configuring webhooks.
2. **Whitespace & Rhythm**: Generous, deliberate whitespace (`p-4`, `p-6`, `gap-4`) creates hierarchy without resorting to heavy containers.
3. **Borders over Shadows**: Use clean 1px borders (`border border-border`) with subtle opacity rather than heavy fuzzy drop shadows.
4. **Subtle Micro-Interactions**:
   - **Button Hover**: Terracotta action buttons (`+ Create Event Type`, `+ Publish Event`, etc.) shift to deep burnt terracotta (`#B83D0E`), lift with a crisp micro-elevation (`translateY(-1.5px)`), and cast a warm accent glow (`box-shadow: 0 4px 14px rgba(217, 84, 30, 0.35)`). Outline/canvas buttons tint to `#E8E2D5` with border definition.
   - **Click/Press**: Tactile press down feedback (`active:scale-[0.98]` and `translateY(0)`).
   - **Transitions**: Snappy 150ms transitions (`transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1)`).
   - **Links**: Clear color shift (`hover:text-primary`, `opacity: 0.88`) with underline.
   - **Text Selection**: Custom terracotta selection (`::selection { background-color: var(--primary); color: var(--primary-foreground); }`) replacing default browser blue.
5. **Clear Typography**:
   - Primary: `Geist Sans` / `Inter` for clean, highly legible UI copy.
   - Monospace: `Geist Mono` for payload previews, webhook URLs, headers, signatures, and UUIDs.

---

## 4. Theme Declaration in Tailwind CSS v4

Theme variables are declared in `apps/{app}/src/app/globals.css`:

```css
@import "tailwindcss";

:root {
  --background: #F3EEE3;
  --foreground: #111111;
  --canvas: #F3EEE3;
  --primary: #D9541E;
  --primary-foreground: #F3EEE3;
  --secondary: #D9541E;
  --secondary-foreground: #F3EEE3;
  --secondary2: #F3EEE3;
  --secondary2-foreground: #111111;
  --accent: #D9541E;
  --accent-foreground: #F3EEE3;
  --destructive: #D9541E;
  --destructive-foreground: #F3EEE3;
  --border: #11111126;
  --ring: #D9541E;
  --error: #D9541E;
  --warning: #C38B22;
  --success: #2D6A4F;
  --info: #124060;
  --toast-morph-duration: 300ms;
  --toast-morph-ease: cubic-bezier(0.32, 0.72, 0, 1);
}

.dark {
  --background: #111111;
  --foreground: #F3EEE3;
  --canvas: #111111;
  --primary: #D9541E;
  --primary-foreground: #F3EEE3;
  --secondary: #D9541E;
  --secondary-foreground: #F3EEE3;
  --secondary2: #111111;
  --secondary2-foreground: #F3EEE3;
  --accent: #D9541E;
  --accent-foreground: #F3EEE3;
  --destructive: #D9541E;
  --destructive-foreground: #F3EEE3;
  --border: #F3EEE326;
  --ring: #D9541E;
  --error: #E05E28;
  --warning: #E5A93C;
  --success: #4EBA6F;
  --info: #4A90E2;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-canvas: var(--canvas);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary2: var(--secondary2);
  --color-secondary2-foreground: var(--secondary2-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-ring: var(--ring);
  --color-error: var(--error);
  --color-warning: var(--warning);
  --color-success: var(--success);
  --color-info: var(--info);
}
}
```

---

## 5. Tactile Raised Buttons (`t-raise`)

For tactile interactive CTA buttons (such as public marketing action links and primary trigger buttons):
- Uses `.t-raise` with `::before` pseudo-element layer for 3D elevation and inset specular highlights (`inset 0 1px 0 0 rgba(255, 255, 255, 0.2)`).
- `.t-raise-primary` applies TrueHook's `--primary` (`#D9541E`) background on `::before` with deep terracotta hover (`#B83D0E`) and glow (`0 4px 14px rgba(217, 84, 30, 0.35)`).
- The button surface scales `::before` down (`active:before:scale-[0.985]`) upon click/press without causing jitter or subpixel shift in the label content.

