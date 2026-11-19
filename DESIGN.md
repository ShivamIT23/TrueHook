---
name: TrueHook
description: Developer-focused webhook delivery and observability platform
colors:
  primary: "#D9541E"
  primary-hover: "#B83D0E"
  neutral-bg: "#F3EEE3"
  neutral-fg: "#111111"
  surface-card: "#F3EEE3"
  surface-dark: "#181818"
  border-light: "rgba(17, 17, 17, 0.15)"
  border-dark: "rgba(243, 238, 227, 0.15)"
  muted-light: "#E8E2D5"
  muted-dark: "#1E1E1E"
typography:
  display:
    fontFamily: "Geist Sans, Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geist Sans, Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.714rem"
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Geist Sans, Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Geist Sans, Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "0.02em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
    height: "32px"
  button-outline:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.neutral-fg}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
    height: "32px"
  card-default:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.neutral-fg}"
    rounded: "{rounded.lg}"
    padding: "16px 16px"
  input-default:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-fg}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
    height: "32px"
---

# Design System: TrueHook

## Overview

**Creative North Star: "The Telegraph Station"**

TrueHook's visual identity embodies the focused precision of a wire-tight telegraph station: utilitarian, high-contrast, and stripped of all decorative pretense. Built specifically for engineers monitoring event pipelines and delivery attempts, the interface prioritizes high-fidelity observability and immediate diagnostic clarity over decorative embellishments.

The foundational canvas is built upon high-contrast dual tones: **Raw Cream (`#F3EEE3`)** and **Obsidian Black (`#111111`)**, punctuated with an intentional strike of **Signal Terracotta (`#D9541E`)**. Every screen feels grounded and architectural—resting surfaces remain flat and structured with crisp 1px borders, while micro-interactions provide tactile, responsive feedback.

**Key Characteristics:**
- **Extreme Contrast & Focus:** Unapologetic dual-tone canvas dominating 90% of surfaces, ensuring dense diagnostic data is scannable at a glance.
- **Signal-to-Noise Purity:** Total rejection of candy-colored status indicators, decorative gradients, and floating drop shadows.
- **Architectural Flatness:** Structural 1px boundaries over fuzzy elevation; depth is signaled through borders, tonal stepping, and crisp hover micro-elevations.
- **Engineer-Centric Typography:** Seamless pairing of modern sans-serif prose (`Geist Sans` / `Inter`) with prominent monospace typography (`Geist Mono`) for payloads, headers, UUIDs, and endpoints.

## Colors

The palette is an intentional, ultra-disciplined 3-color system formulated to reduce cognitive fatigue while highlighting operational anomalies instantly.

### Primary
- **Signal Terracotta** (`#D9541E`): The sole brand accent and operational beacon. Used exclusively for primary call-to-actions, active navigation highlights, focus rings, and critical interactive triggers. On hover, shifts to burnt terracotta (`#B83D0E`) with an accent glow (`0 4px 14px rgba(217, 84, 30, 0.35)`).

### Neutral
- **Raw Cream** (`#F3EEE3`): The primary light canvas, card background, and neutral surface in light mode; high-contrast text and border highlight in dark mode.
- **Obsidian Black** (`#111111`): The primary typography and border tone in light mode; foundational backdrop and canvas in dark mode.
- **Warm Parchment** (`#E8E2D5`): Secondary neutral surface in light mode for table headers, code blocks, outline button hovers, and subtle row alternating.
- **Carbon Dark** (`#181818` / `#1E1E1E`): Elevated card and secondary container fill in dark mode.
- **Hairline Border** (`rgba(17, 17, 17, 0.15)` in light, `rgba(243, 238, 227, 0.15)` in dark): The 1px structural dividing line for all cards, tables, drawers, and form fields.

### Named Rules
**The 90/10 Ratio Rule.** Raw Cream (`#F3EEE3`) and Obsidian Black (`#111111`) must account for at least 90% of any view. Signal Terracotta (`#D9541E`) is limited to 10% maximum surface coverage; its restraint is what preserves its urgent signal power.

**The Semantic Token Rule.** Direct Tailwind color scales (`gray-*`, `slate-*`, `blue-*`, `red-*`) and arbitrary raw hex classes are strictly prohibited. All styling must consume semantic tokens from `globals.css` (`bg-canvas`, `text-foreground`, `border-border`, `bg-primary`, `text-muted-foreground`).

## Typography

**Display Font:** Geist Sans (with Inter, -apple-system, BlinkMacSystemFont, sans-serif fallback)  
**Body Font:** Geist Sans (with Inter, -apple-system, BlinkMacSystemFont, sans-serif fallback)  
**Label/Mono Font:** Geist Mono (with ui-monospace, SFMono-Regular, monospace fallback)

**Character:** Technical, neutral, and razor-sharp. Prose is clean and legibly spaced, while technical data (event IDs, hashes, payloads, timestamps) takes center stage in fixed-width clarity.

### Hierarchy
- **Display** (600 SemiBold, 2.25rem / 36px, line-height 1.2, letter-spacing -0.02em): Top-level hero titles and public landing headlines.
- **Headline** (600 SemiBold, 1.714rem / 24px, line-height 1.33, letter-spacing -0.01em): Page headers across dashboard workspaces and overview cards.
- **Title** (500 Medium, 1.125rem / 18px, line-height 1.4, letter-spacing -0.005em): Card titles, modal headers, and table section titles.
- **Body** (400 Regular, 0.875rem / 14px, line-height 1.5, letter-spacing 0em): Default interface text, descriptions, table cell copy, and form instructions.
- **Label** (500 Medium, 0.75rem / 12px, line-height 1.33, letter-spacing 0.02em): Form field labels, status badges, metric keys, and table column headers.
- **Code / Mono** (400 Regular & 500 Medium, 0.8125rem / 13px, line-height 1.45, letter-spacing 0em): Raw payload inspection, webhook URLs, HTTP headers, secret prefixes, and cryptographic signatures.

### Named Rules
**The Code-Type Rule.** Any value representing an identifier, UUID, webhook URL, HTTP status code, secret preview, timestamp, or JSON payload MUST render in `Geist Mono` (`font-mono`).

## Layout

TrueHook interfaces adhere to a compact, information-dense spatial grid designed for complex event streams and debugging workflows.

- **Baseline Spacing:** 4px baseline rhythm (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`).
- **Container Strategy:** Max content widths of `1280px` (`max-w-7xl`) for dashboard workspaces and `1440px` for landing pages, centered with responsive horizontal padding (`px-4` sm, `px-6` lg).
- **Density Model:** High-density desktop layouts with concise row heights (`h-10` to `h-12` in data tables) to maximize observable logs per screen without requiring vertical scrolling.
- **Structural Rhythm:** Panels, log side-by-side split inspectors, and timeline views separate using clean 1px hairline dividers (`border border-border`) instead of wide empty gaps.

## Elevation & Depth

TrueHook rejects diffuse drop shadows and multi-layered skeuomorphic cards. Depth is established through flat architectural planes, crisp hairline borders, and responsive micro-elevations on user interaction.

### Shadow Vocabulary
- **Resting Surface** (`none`): All resting cards, containers, sidebars, and tables are completely flat (`box-shadow: none`).
- **Tactile Hover Lift** (`box-shadow: 0 4px 14px rgba(217, 84, 30, 0.35)`): Applied to primary Signal Terracotta action buttons on hover, paired with `translateY(-1.5px)` elevation.
- **Outline Button Glow** (`box-shadow: 0 1px 1px 1px rgba(17, 17, 17, 0.16)`): Subtle tactile border reinforcement when hovering canvas or outline buttons.
- **Floating Modals & Flyouts** (`box-shadow: 0 12px 32px rgba(17, 17, 17, 0.12)` in light mode, `0 12px 32px rgba(0, 0, 0, 0.5)` in dark mode): Restricted strictly to popovers, dropdown menus, and command palettes.

### Named Rules
**The Flat-By-Default Rule.** Surfaces rest entirely flat without ambient drop shadows. Depth is communicated via 1px border strokes (`border-border`) and tonal surface contrast. Shadows exist purely as interactive feedback.

## Shapes

- **Radius Strategy:**
  - Micro controls & tags: `6px` (`rounded-md`).
  - Standard buttons, form inputs, cards, and dialogue containers: `8px` to `12px` (`rounded-lg` / `rounded-xl`).
  - Circular icons & status pills: `9999px` (`rounded-full`).
- **Borders:** Consistent `1px` continuous solid borders with low opacity (`border-border` / `15%` opacity foreground stroke). Never use dashed or decorative borders on active components.
- **Geometric Silhouettes:** Rectilinear, engineered boxes with subtle corner softening. Shapes feel machined and precise.

## Components

### Buttons
- **Shape:** Rounded rectangle (`rounded-xl`, 12px radius).
- **Primary:** Background `bg-primary` (`#D9541E`), text `text-primary-foreground` (`#F3EEE3`), padding `8px 12px` (`h-8` default), font weight `500`.
- **Hover / Focus:** Hover elevates `translateY(-1.5px)`, darkens to `#B83D0E`, and casts `box-shadow: 0 4px 14px rgba(217, 84, 30, 0.35)`. Active presses down (`scale-[0.98]`). Focus ring casts `ring-2 ring-ring ring-offset-2`.
- **Outline / Ghost:** Background `bg-canvas`, border `border-border`, text `text-foreground`. On hover, backgrounds tint to `#E8E2D5` with crisp border reinforcement.
- **Destructive:** Background `bg-destructive` (`#D9541E`), with identical hover elevation and warning states.

### Cards / Containers
- **Corner Style:** `rounded-xl` (12px).
- **Background:** `bg-card` (`#F3EEE3` in light mode, `#181818` in dark mode).
- **Border:** 1px hairline `border border-border`.
- **Shadow Strategy:** Zero ambient resting shadow; hairline definition separates the card from canvas.
- **Internal Padding:** `p-4` (16px) or `p-6` (24px) with clear header/content/footer segmentations.

### Inputs / Fields
- **Style:** Height `h-8` (32px), radius `rounded-lg` (8px), background transparent or subtle input tint, border `border border-input` (`rgba(17,17,17,0.15)`).
- **Focus:** Sharp `focus-visible:border-ring` and `focus-visible:ring-3 focus-visible:ring-ring/50`.
- **Error / Disabled:** Invalid fields invoke `aria-invalid:border-destructive` with a subtle destructive ring highlight. Disabled inputs drop opacity to 50% with `cursor-not-allowed`.

### Badges & Status Indicators
- **Style:** Compact height (`h-5`), radius `rounded-full`, padding `px-2 py-0.5`, font `text-xs font-medium`.
- **Variants:**
  - **Primary / Active:** `bg-primary text-primary-foreground`.
  - **Muted / Inactive:** `bg-secondary2 text-foreground border border-border`.
  - **Destructive / Failed:** `bg-destructive/10 text-destructive border border-destructive/20`.
  - **Success / Delivered:** `bg-[#2D6A4F]/15 text-[#2D6A4F] border border-[#2D6A4F]/30`.

### Navigation
- **Sidebar & Topbar:** Light cream background (`#F3EEE3`) with 1px border divider (`border-r border-border`). Active route links highlight with `text-primary` and subtle accent indicator bar; hover states apply gentle `#E8E2D5` surface fills.

### Inspection Drawer / Payload Viewer (Signature Component)
- **Style:** Side-anchored sliding sheet or split pane featuring split JSON payload viewer, raw headers table, and chronological HTTP attempt timeline.
- **Typography:** Fully monospace body with syntax highlighting against `#F3EEE3` (light) or `#111111` (dark).

## Do's and Don'ts

### Do:
- **Do** use semantic tokens (`bg-canvas`, `text-foreground`, `border-border`, `bg-primary`, `ring-ring`) exclusively.
- **Do** preserve the 90/10 ratio between neutral surfaces and Signal Terracotta accents.
- **Do** render all IDs, endpoints, cryptographic signatures, HTTP status codes, and payloads in `Geist Mono`.
- **Do** use clean 1px hairline borders (`border-border`) to delineate containers and tables.
- **Do** provide tactile micro-interactions on buttons (`hover:-translate-y-0.5`, `active:scale-[0.98]`).
- **Do** keep customer `/signin` and `/signup` routes in Obsidian dark mode while keeping workspace apps in clean light cream mode.

### Don't:
- **Don't** use default Tailwind color scales (`text-gray-500`, `bg-blue-600`, `text-red-500`).
- **Don't** apply fuzzy ambient drop shadows or heavy blur cards to resting interface components.
- **Don't** introduce multi-colored gradient backgrounds or decorative floating blobs.
- **Don't** clutter views with non-standard status colors; failure, errors, and primary alerts remain anchored in Signal Terracotta.
- **Don't** compromise keyboard focus states; every interactive control must visibly project `ring-ring`.
