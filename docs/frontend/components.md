# Component & Module Guidelines

## 1. Component Modularity Layers

To ensure maintainability, testability, and clarity, components are strictly organized into three distinct tiers:

### Tier 1: Atomic UI Primitives (`src/components/ui/` in each app)
- **Scope**: Headless and presentational primitives (e.g. `Button`, `Input`, `Card`, `Badge`, `Separator`, `Dialog`, `Table`, `Select`, `Tooltip`, etc.).
- **Per-App Adapter Pattern**:
  - Base components reside in the shared `@truehook/ui` workspace package.
  - Each Next.js app (`apps/web`, `apps/dashboard`, `apps/admin`) maintains local adapters in `src/components/ui/<component>.tsx` re-exporting from `@truehook/ui/components/ui/<component>`.
  - All feature modules and route shells import exclusively from `@/components/ui/<component>`.
  - This decouples the apps and allows any application to override, wrap, or customize individual components independently without mutating the shared package or affecting sibling apps.
- **Rules**:
  - ZERO business logic or API calls.
  - Controlled purely through explicitly typed props.
  - Fully accessible (standard HTML elements, keyboard navigation, focus indicators).
  - Adhere strictly to the 5-color palette (#141412, #f2f2e8, #124060, #ea5c47, #c39f59).

### Tier 2: Domain Feature Modules (`apps/web/src/modules/<feature>/`)
- **Scope**: Feature-specific components, custom hooks, types, and client API routines.
- **Examples**:
  - `modules/endpoints/`: EndpointList, EndpointForm, EndpointHealthBadge.
  - `modules/events/`: EventStream, EventDetailViewer, PayloadViewer.
  - `modules/deliveries/`: DeliveryTable, AttemptTimeline, ReplayTrigger.
- **Rules**:
  - Self-contained. Module internals are not imported by unrelated feature modules.
  - Handles the 4 core states: Loading, Empty, Error, and Success.

### Tier 3: Route Shells (`apps/web/src/app/**/page.tsx`)
- **Scope**: Next.js App Router entry points.
- **Rules**:
  - Thin orchestrators (<80 lines of code).
  - Assembles domain modules and shared layout components.
  - Avoid dense JSX or complex inline logic.

---

## 2. Standard Props Pattern

Every component must export an explicit TypeScript interface:

```typescript
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}
```

---

## 3. Mandatory Component Catalog

When creating or modifying components, register them below:

### `Header` (Public Web Navigation Header)
- **Path**: `apps/web/src/components/layout/Header.tsx`, re-exported via `apps/web/src/components/layout/index.ts`
- **Layer**: Shared Cross-Page Layout Component
- **Description**: Global sticky navigation header rendered across all pages in `apps/web`. Features an obsidian black background using the `--foreground` token from `globals.css`, high-contrast parchment cream brand logo (`/small-logo-white.png`) and title, navigation links (`Features`, `Docs`, `Pricing`, `Changelog`), primary and secondary auth action CTAs (`Sign In` and `Get Started`), and a responsive mobile hamburger drawer toggle.
- **Color Usage (Strict Semantic Classes from `globals.css`)**:
  - Container Background: `bg-foreground` (`#111111`, Obsidian black token from `:root`)
  - Typography: `text-background` (`#F3EEE3`, Cream token) for brand and active elements; `text-background/80` for muted nav links
  - Hover Interactions: `hover:text-primary` (`#D9541E`) and `hover:bg-background/10`
  - Primary Action Button: `bg-primary text-primary-foreground hover:bg-primary/90` (`#D9541E` terracotta accent)
  - Dividing Borders: `border-b border-background/15`
  - Keyboard Focus Ring: `focus-visible:ring-ring` (`#D9541E`)
- **Props**:
  - `className?: string`: Optional custom styling wrapper classes.
  - `links?: HeaderNavLink[]`: Custom navigation items (`label`, `href`, `external?`).
  - `signInHref?: string`: URL for sign-in action (defaults to `/signin`).
  - `signUpHref?: string`: URL for primary CTA (defaults to `/signup`).


### `Select` (Dashboard Adapter & Base Primitive)
- **Path**: `apps/dashboard/src/components/ui/select.tsx`, primitive at `packages/ui/src/components/ui/select.tsx`
- **Layer**: Tier 1 UI Primitive
- **Description**: Robust searchable select component powered by `react-select`, custom-styled for TrueHook's strict 3-color palette. Supports live search filtering, single-select and multi-select modes, customizable option descriptions, right-aligned checkmark indicators on active items, rotating chevron indicator (`rotate-180` on open with smooth 200ms transition), and compact (`sm`) mode.
- **Color Usage**:
  - Control Box: `bg-canvas` (`#F3EEE3`), `border-input` (`#11111126`), rounded-xl (`0.75rem`), with terracotta focus ring (`#D9541E`).
  - Menu Dropdown: `bg-popover` (`#F3EEE3`), `border-border`, shadow-xl, rounded-xl with thin scrollbar.
  - Option Rows: `hover:bg-secondary2` / `focus:bg-secondary2` (`#E8E2D5`), `text-foreground` (`#111111`), with `Check` icon in `text-primary` (`#D9541E`) when selected.
  - Tag Pills (Multi-Select): `bg-secondary2` (`#E8E2D5`), `text-foreground`, `border-border`.
- **Props**: Accepts standard `react-select` props (`options`, `value`, `onChange`, `isSearchable`, `isClearable`, `isMulti`, etc.) plus `size?: "sm" | "default"`.

### `Button` (Dashboard Adapter)
- **Path**: `apps/dashboard/src/components/ui/button.tsx`
- **Layer**: Tier 1 UI Primitive
- **Description**: Application-level adapter wrapping `@truehook/ui/components/ui/button`. Configured with `variant = "secondary"` as default, mapping `default` to `secondary` so dashboard action buttons automatically adopt the brand terracotta theme (`#D9541E`).
- **Color & Interaction Usage**: Primary/secondary action buttons use `#D9541E` (`bg-secondary`, `bg-primary`) with an unmistakable deep burnt terracotta hover state (`#B83D0E`), physical elevation (`translateY(-1.5px)`), and a terracotta drop shadow (`0 4px 14px rgba(217, 84, 30, 0.35)`). Outline/ghost variants utilize `#E8E2D5` on hover. Pressed state provides tactile compression (`active:scale-[0.98]`).

### `XButton` (Dynamic Color & Rotation Button)
- **Path**: `packages/ui/src/components/ui/x-button.tsx`, adapter at `apps/dashboard/src/components/ui/x-button.tsx`
- **Layer**: Tier 1 UI Primitive
- **Description**: Highly configurable interactive button supporting custom width and height, two-tone color inversion (`mainColor` and `secondaryColor`), and a smooth 180° rotation effect on hover.
- **Props**:
  - `width` / `height`: Numeric (pixels) or CSS string (e.g. `32`, `"32px"`, `"100%"`).
  - `mainColor` / `maincolor`: Text color normally, background color on hover (defaults to brand terracotta `#D9541E`).
  - `secondaryColor` / `secondarycolor`: Text color on hover (defaults to clean cream `#F3EEE3`).
  - `rotateEffect`: `"icon"` (default, rotates nested SVG icons 180° on hover), `"button"` (rotates entire button), `"both"`, or `"none"`.
  - `rotateSelf`: Shorthand boolean to rotate the entire button 180° on hover.
  - `borderStyle`: `"subtle"` (default), `"solid"`, or `"none"`.
- **Usage Examples**:
  - **Table Actions (Inspect)**:
    ```tsx
    <XButton
      height={32}
      mainColor="#D9541E"
      secondaryColor="#F3EEE3"
      onClick={handleInspect}
    >
      <Eye className="h-3.5 w-3.5" />
      <span>Inspect</span>
    </XButton>
    ```
  - **Modal Dismiss ("X" Close Buttons)**:
    ```tsx
    <XButton
      width={32}
      height={32}
      borderStyle="none"
      onClick={onClose}
      aria-label="Close dialog"
      title="Close"
    >
      <X className="h-5 w-5" />
    </XButton>
    ```

### `Toast` & `Toasts` (Stacked Morph Notifications)
- **Path**: `packages/ui/src/components/ui/toast.tsx`, adapters in `apps/*/src/components/ui/toast.tsx`
- **Layer**: Tier 1 UI Primitive
- **Description**: Floating top-center stacked notifications engineered with spring animations, auto-dismiss timers, swipe-to-dismiss gestures, action buttons, and clean status glyphs (`success` emerald checkmark badge in `#2D6A4F`, `error` alert badge in destructive `#D9541E`, `warning` amber triangle in `#C38B22`, `info` nautical badge in `#124060`, and `pending` spinner). Styled to mirror the `@kobra/toast` aesthetic with rounded pill geometry (`rounded-full`) for single-line messages, rounded card geometry (`rounded-2xl`) for notifications with descriptions, fixed top-center placement (`top-5`), soft elevation shadows, crisp 1px borders (`border-border`), and full theme reactivity (`#F3EEE3` in light mode, `#111111` in dark mode).
- **Exports**: `ToastSide`, `ToastAlign`, `ToastPosition`, `ToastState`, `ToastAction`, `ToastInput`, `Note`, `toast`, `dismissToast`, `Toasts`.
- **Color Usage**: Strict tokens from `globals.css` `:root`: `bg-card` surface backdrop with `backdrop-blur-md`, `border-border`, `text-foreground`, `text-muted-foreground`, `text-[#2D6A4F]` for success glyph, `text-destructive` for error badge, and `bg-foreground` & `text-background` for action buttons. Supported by `.toast-container` and `.toast-pill` rules in `globals.css` and `transpilePackages: ["@truehook/ui"]`.

### `SoundEffects` (Audio Layer)
- **Path**: `packages/ui/src/components/ui/sound.tsx`, adapters in `apps/*/src/components/ui/sound.tsx`
- **Layer**: Tier 1 UI Primitive / Audio
- **Description**: Lightweight Web Audio API listener attached to `document` that detects interactive presses on `[data-slot]` and `[data-sound]` and plays non-intrusive procedural haptic feedback chimes and clicks without external audio files.

### `BackgroundSVG`
- **Path**: `apps/dashboard/src/components/background/BackgroundSVG.tsx`, `apps/admin/src/components/background/BackgroundSVG.tsx`
- **Layer**: Layout / Atmosphere
- **Description**: SVG wave pattern backdrop configured with `#1D1D1B` strokes and soft opacity. Exclusively scoped to authentication routes (`/signin` and `/signup`). Never used on 404 or other content routes.
- **Color Usage**: Background dark tones overlaid on `#141412`.

### `BottomWaves`
- **Path**: `packages/ui/src/components/ui/bottom-waves.tsx`, adapter at `apps/dashboard/src/components/background/BottomWaves.tsx`
- **Layer**: Layout / Atmosphere
- **Description**: Decorative SVG multi-layered wave graphic positioned at the bottom of pages (`h-[350px] sm:h-[450px]`). Features subtle pastel gradient waves in light blues (`#EAF2FF`, `#DCE9FF`, `#C9DCFF`) positioned with negative z-index (`pointer-events-none absolute bottom-0 left-0 -z-10`).
- **Color Usage**: Ambient nautical blue/cream tones for light mode surfaces.

### `TrueHookLogo`
- **Path**: `apps/dashboard/src/modules/auth/TrueHookLogo.tsx`, `apps/admin/src/modules/auth/TrueHookLogo.tsx`
- **Layer**: Branding / Auth
- **Description**: Interlocking webhook chain symbol with accessible SVG title, `small-logo-black.png` brand mark, and optional badge (e.g., "ADMIN").

### `SocialButtons`
- **Path**: `apps/dashboard/src/modules/auth/SocialButtons.tsx`, `apps/admin/src/modules/auth/SocialButtons.tsx`
- **Layer**: Auth Module
- **Description**: Stacked secondary action buttons for GitHub, Google, and SSO authentication with centered icon assets.

### `SignInForm` & `SignUpForm`
- **Path**: `apps/dashboard/src/modules/auth/SignInForm.tsx`, `apps/dashboard/src/modules/auth/SignUpForm.tsx`
- **Layer**: Auth Module (BFF Server Actions)
- **Description**: Centered, dark translucent auth cards (`max-w-[440px]`, `bg-[#181816]/90`, `border-[#262624]`) powered by Next.js Server Actions (`signInAction`, `signUpAction`) via React 19 `useActionState`. Features server-side input validation, error banners and inline field error hints in `#ea5c47`, password visibility toggle, pending submission spinners, secure HTTP-only cookie provisioning, and seamless redirect upon authentication.
- **Color Usage**:
  - Primary CTA button: `#124060` with `#164e75` hover and `#f2f2e8` text.
  - Error state / banners: `#ea5c47` background tint (`bg-[#ea5c47]/10`) and border (`border-[#ea5c47]/30`).
  - Card & Canvas: `#181816` surface over `#141412` canvas.

### `DashboardHeader`
- **Path**: `apps/dashboard/src/components/layout/DashboardHeader.tsx`
- **Layer**: Layout Component
- **Description**: Sticky navigation header in clean cream/light mode (`#F3EEE3`). Displays TrueHook logo on the top-left, interactive Application Select pill (`Layers` icon, current active application name, and rotating chevron) with a dropdown popover to instantly switch between active applications, an "Open application panel" link routing to the full management view, and a circular user avatar on the top-right with user profile dropdown.
- **Color Usage**: Background `bg-background/90`, border `border-border`, active application pill `bg-canvas border-border hover:bg-secondary2`, active item indicator `text-primary` (`#D9541E`).

### `ApplicationSelector` & `CreateApplicationModal`
- **Path**: `apps/dashboard/src/modules/applications/components/ApplicationSelector.tsx`, `apps/dashboard/src/modules/applications/components/CreateApplicationModal.tsx`
- **Layer**: Applications Feature Module
- **Description**: Main index application management interface.
  - Matches the design from the mock: centered card with "Select an Application" title, subtitle, and "+ Create Application" button.
  - In-flow dropdown menu: The application list renders directly beneath the select trigger in normal document flow inside the main card, ensuring the outer card naturally wraps the entire list with uniform bottom padding and prevents container cutoffs or overlays.
  - Features custom scrollbar styling (`[scrollbar-width:thin] [scrollbar-color:#dcdcd4_transparent]`), item initial badges, and selection checkmarks.
  - On application select: The dropdown closes and showcases the application's complete details (Name, ID with copy button, Description, Created Date, quick action buttons). Clicking the trigger again re-opens the list directly underneath.
  - If the user has no applications: Shows clean `Select an application...` trigger which prompts "+ Create Application".
  - `CreateApplicationModal`: Modal dialog to register a new application, with validation (name, description >= 10 chars, logo URL) powered by the BFF `createApplicationAction`. Unmounted when closed to ensure state and errors are clean on each open.
- **Color Usage**: White card (`bg-white`, `border-[#e5e5dc]`), dark button (`bg-[#141412] text-white hover:bg-[#262624]`), nautical blue accents (`#124060`), and error hints in `#ea5c47`.

### `DashboardOverview`
- **Path**: `apps/dashboard/src/modules/dashboard/DashboardOverview.tsx`
- **Layer**: Dashboard Module
- **Description**: Authenticated customer workspace overview rendered in white/light mode (matching `apps/web`). Composes `DashboardHeader` with active tenant and active application context, welcome section with application description, metric overview cards (Active Endpoints, Events Streamed, Delivery Success Rate, HMAC Signing), and quick-start actions.
- **Props Interface**:
  - `user: AuthUser | null`
  - `application?: Application | null`
- **Color Usage**:
  - Major scheme: `#ffffff` white canvas, `#ffffff` card surface, `#e5e5dc` light borders, `#141412` primary typography, `#70706a` muted labels.
  - Accents: Nautical blue (`#124060`) for primary action buttons, warm brass (`#c39f59`) for status indicators, coral red (`#ea5c47`) for sign-out button hover state.

### `ApplicationSelector`
- **Path**: `apps/dashboard/src/modules/applications/components/ApplicationSelector.tsx`
- **Layer**: Applications Module
- **Description**: Centered application selection card where customers choose their active tenant application or create a new one. Features in-flow dropdown list, comprehensive application metadata view (ID, description, creation date), and an "Enter <Application>" action button.
- **Key Behaviors**:
  - Clicking "Enter <AppName>" saves the selected application to `localStorage` (localhost) and cookies (via Server Action `selectApplicationAction`), then forwards the user to `/dashboard`.
  - Automatically restores selected application from `localStorage` on mount.
- **Props Interface**:
  - `initialApplications: Application[]`



### `QueryProvider`
- **Path**: `apps/dashboard/src/components/providers/QueryProvider.tsx`
- **Layer**: Global Application Provider
- **Description**: TanStack React Query client provider wrapping the root dashboard layout. Configured with a 60-second default `staleTime`, window focus revalidation disabled, and automatic single retry policy. Isolates query client instances across Next.js App Router client boundaries.

### `EventTypesManager`
- **Path**: `apps/dashboard/src/modules/event-types/components/EventTypesManager.tsx`
- **Layer**: Event Types Feature Module (TanStack Query)
- **Description**: Full management interface for defining, searching, editing, and deleting event types within the active application context.
  - **TanStack Query Integration**: Integrated with `useEventTypesQuery` for automatic caching, background revalidation, and immediate cache synchronization across mutations (`useCreateEventTypeMutation`, `useUpdateEventTypeMutation`, `useDeleteEventTypeMutation`). Includes a manual refetch trigger.
  - **Header & Metric**: Displays active application badge, total event count, and "+ Create Event Type" CTA button.
  - **Search & Filter**: Real-time filtering across event identifiers and descriptions with instant clear action.
  - **Table & Actions**: Monospace event identifier pill with one-click copy button, description text, formatted creation date, edit action (`Pencil`), and delete action (`Trash2`).
  - **Empty States**: Distinct empty states for no configured event types and zero search matches.
- **Color Usage**: White surface (`bg-white`, `border-[#e5e5dc]`), deep nautical blue (`#124060`) for primary buttons and identifier tags, coral red (`#ea5c47`) for destructive delete actions.
- **Props Interface**:
  - `application: Application | null`
  - `initialEventTypes: EventType[]`

### `CreateEventTypeModal` & `EditEventTypeModal`
- **Path**: `apps/dashboard/src/modules/event-types/components/CreateEventTypeModal.tsx`, `apps/dashboard/src/modules/event-types/components/EditEventTypeModal.tsx`
- **Layer**: Event Types Feature Module
- **Description**: Accessible modal dialogs for creating and editing event types. Powered by React 19 `useActionState` and Server Actions (`createEventTypeAction`, `updateEventTypeAction`). Includes validation for event identifier (1-255 characters) and description (minimum 10 characters), error banners, inline field errors in `#ea5c47`, and loading spinners during submission.
- **Color Usage**: White dialog card (`bg-white`), `#124060` nautical blue primary buttons, `#ea5c47` validation hints.

### `DeleteEventTypeDialog`
- **Path**: `apps/dashboard/src/modules/event-types/components/DeleteEventTypeDialog.tsx`
- **Layer**: Event Types Feature Module
- **Description**: Confirmation dialog for deleting an event type. Shows warning about potential impact on active webhooks listening exclusively to the deleted identifier.
- **Color Usage**: Coral red `#ea5c47` warning icon and delete button.

### `EndpointsManager`
- **Path**: `apps/dashboard/src/modules/endpoints/components/EndpointsManager.tsx`
- **Layer**: Webhook Endpoints Feature Module (TanStack Query)
- **Description**: Full management interface for registering, inspecting, editing, and deleting webhook endpoints within the active application context.
  - **TanStack Query Integration**: Integrated with `useEndpointsQuery` for automatic caching, background revalidation, and immediate cache synchronization across mutations (`useCreateEndpointMutation`, `useUpdateEndpointMutation`, `useDeleteEndpointMutation`). Includes a manual refetch trigger.
  - **Header & Metrics**: Displays active application badge, total endpoint count, active count, disabled count, and "+ Register Endpoint" CTA button.
  - **Search & Filter**: Real-time filtering across endpoint destination URLs with clear filter action.
  - **Table & Actions**:
    - Destination URL with HTTP/HTTPS protocol tags and one-click copy button.
    - Subscribed event types rendered as pill tags with an interactive on-hover `HoverCard` modal on the `+<count>` indicator displaying all remaining event types.
    - Active vs. Disabled status pills with pulsing indicator.
    - Webhook Signing Secret with toggle mask/reveal (`Eye` / `EyeOff`) and copy button.
    - Formatted creation timestamp.
    - Edit action (`Pencil`) and delete confirmation action (`Trash2`).
  - **Empty States**: Distinct empty states for no configured endpoints and zero search matches.
- **Color Usage**: Semantic custom tokens from `globals.css` `:root` (`bg-canvas`, `bg-background`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary`, `text-destructive`).
- **Props Interface**:
  - `application: Application | null`
  - `initialEndpoints: Endpoint[]`

### `CreateEndpointModal` & `EditEndpointModal`
- **Path**: `apps/dashboard/src/modules/endpoints/components/CreateEndpointModal.tsx`, `apps/dashboard/src/modules/endpoints/components/EditEndpointModal.tsx`
- **Layer**: Webhook Endpoints Feature Module
- **Description**: Accessible modal dialogs for registering and editing webhook endpoints. Powered by TanStack Query mutations and BFF Server Actions (`createEndpointAction`, `updateEndpointAction`). Includes URL validation (must be valid HTTP/HTTPS), optional custom signing secret input (with auto-generation fallback), enabled delivery toggle, `EventTypeMultiSelect` for selecting specific event types as tags with close buttons, error banners, inline field errors in `text-destructive`, and loading spinners during submission.
- **Color Usage**: Semantic tokens (`bg-canvas`, `border-border`, `bg-primary`, `text-primary-foreground`, `text-destructive`).

### `EventTypeMultiSelect`
- **Path**: `apps/dashboard/src/modules/endpoints/components/EventTypeMultiSelect.tsx`
- **Layer**: Webhook Endpoints Feature Module
- **Description**: Interactive multi-select combobox component for choosing subscribed event types. Renders selected event types as tags/boxes inside the select trigger container, each equipped with an individual close button (`X`) for rapid removal. Features a dropdown popover with real-time search filtering, checkmark selection indicators, "Select all" and "Clear" quick action triggers, an inline "Create new event type" form with instant optimistic selection, outside click dismissal, and keyboard accessibility. Leaving the selection empty ensures no events are dispatched to the endpoint.
- **Color Usage**: Semantic tokens (`bg-canvas`, `border-input`, `border-primary`, `bg-secondary2`, `text-foreground`, `bg-popover`, `text-muted-foreground`).
- **Props Interface**:
  - `applicationId?: string`
  - `eventTypes: EventType[]`
  - `selectedIds: string[]`
  - `onChange: (ids: string[]) => void`
  - `disabled?: boolean`

### `DeleteEndpointDialog`
- **Path**: `apps/dashboard/src/modules/endpoints/components/DeleteEndpointDialog.tsx`
- **Layer**: Webhook Endpoints Feature Module
- **Description**: Confirmation dialog for deleting a webhook endpoint. Highlights the endpoint URL and warns about permanently dropping webhook deliveries to the destination.
- **Color Usage**: Semantic destructive tokens (`bg-destructive/10`, `text-destructive`, `bg-destructive`).

### `DeleteApplicationDialog`
- **Path**: `apps/dashboard/src/modules/applications/components/DeleteApplicationDialog.tsx`
- **Layer**: Applications Feature Module
- **Description**: Confirmation dialog for permanently deleting an application. Warns the user of cascading deletion of all associated endpoints, events, and deliveries. Triggers the BFF `deleteApplicationAction` and clears local and cookie session caches upon completion.
- **Color Usage**: Semantic destructive tokens (`bg-destructive/10`, `text-destructive`, `bg-destructive`).

### `Sidebar`
- **Path**: `apps/dashboard/src/components/layout/Sidebar.tsx`
- **Layer**: Shared Structural Layout Component
- **Description**: Collapsible and responsive navigation sidebar styled with the sleek obsidian theme (`dark bg-[#111111]`, `text-[#F3EEE3]`, `border-[#F3EEE3]/15`).
  - **Desktop Collapse**: Toggles between expanded (`w-60`) and compact collapsed mode (`md:w-16`). When collapsed, navigation titles hide and icons center (`h-10 w-10`), with an expand button in the sidebar header.
  - **Mobile Drawer**: Off-screen on mobile (`-translate-x-full`) with smooth slide-in transition (`translate-x-0`). Includes close (`X`) button and closes automatically when clicking links or backdrop.
  - **Navigation & Active Highlighting**: Highlights active route with terracotta accent (`bg-primary text-primary-foreground font-semibold shadow-xs`) and right-aligned `ChevronRight` indicator. Inactive items use `text-muted-foreground hover:bg-[#F3EEE3]/10 hover:text-foreground`.
  - **Footer**: Subtle copyright stamp automatically hidden when collapsed on desktop.
- **Color Usage**: Strict 3-color dark palette: `bg-[#111111]`, border `border-[#F3EEE3]/15`, active indicator `bg-primary` (`#D9541E`), text `text-muted-foreground` (`#F3EEE3a6`) / `hover:text-foreground` (`#F3EEE3`).

### `ProtectedLayoutShell`
- **Path**: `apps/dashboard/src/components/layout/ProtectedLayoutShell.tsx`
- **Layer**: Layout Wrapper Component
- **Description**: Client-side layout shell that orchestrates the collapsible sidebar, mobile overlay backdrop, sticky `DashboardHeader`, and main content viewport for authenticated user routes.
- **Props Interface**:
  - `user: AuthUser | null`
  - `application: Application | null`
  - `children: React.ReactNode`

### `NotFound`
- **Path**:
  - Implementation: `packages/ui/src/components/ui/not-found.tsx`, `packages/ui/src/components/not-found.tsx`
  - Adapters: `apps/web/src/components/ui/not-found.tsx`, `apps/dashboard/src/components/ui/not-found.tsx`, `apps/admin/src/components/ui/not-found.tsx`
  - Routes: `apps/web/src/app/not-found.tsx`, `apps/dashboard/src/app/not-found.tsx`, `apps/admin/src/app/not-found.tsx`
- **Layer**: Atomic UI Primitive (`ui`) / Global 404 Route Shell
- **Description**: High-craft, utilitarian 404 error display configured in light theme by default (with dark mode support). Features a large decorative 404 numeral watermark, compass brand mark, animated pulsing status pill, clear typography, optional monospace HTTP diagnostics block, and primary/secondary action buttons with browser history back fallback.
- **Color Usage**:
  - Light theme (default): Clean `#fafaf7` / `#ffffff` background with subtle `#141412`/10 border, deep obsidian `#141412` typography, and `#575752` body copy.
  - Accent Coral: `#ea5c47` for status badge pill and HTTP 404 indicator.
  - Accent Nautical Blue: `#124060` for primary CTA button and icon accent.
  - Accent Brass: Warm muted brass accent.
- **Props Interface**:
  - `theme?: "light" | "dark"` (Default: `"light"`)
  - `badge?: string` (Default: `"404 • Resource Not Found"`)
  - `title?: string` (Default: `"Page not found"`)
  - `description?: string` (Default: `"The requested resource could not be found..."`)
  - `statusCode?: string` (Default: `"404"`)
  - `primaryAction?: NotFoundAction` (`{ label, href, onClick, variant, icon }`)
  - `secondaryAction?: NotFoundAction | null`
  - `actions?: React.ReactNode`
  - `details?: string` (Optional technical/diagnostic details displayed in monospace)
  - `showDetails?: boolean`

### `EventsManager`
- **Path**: `apps/dashboard/src/modules/events/components/EventsManager.tsx`
- **Layer**: Feature Domain Module (`modules/events`)
- **Description**: Webhook event publication and telemetry stream workspace adhering strictly to the `mx-auto max-w-7xl` layout pattern. Features a standardized page header with category eyebrow, active application pill, description, quick refresh button, and publish modal trigger. Displays a 4-card overview grid (Total Events, Dispatched Deliveries, Event Types, and Avg Fanout Ratio). Includes a real-time search input, event type filter selector, and high-contrast table displaying monospace event IDs with hover copy feedback, styled event type pills, payload previews in code snippets, fanout delivery counters, relative/absolute timestamps, and one-click inspection triggers.
- **Props Interface**:
  - `application: Application | null`
  - `initialEvents: EventItem[]`
  - `totalEvents: number`
  - `eventTypes: EventType[]`

### `PublishEventModal`
- **Path**: `apps/dashboard/src/modules/events/components/PublishEventModal.tsx`
- **Layer**: Feature Domain Module (`modules/events`)
- **Description**: Modal dialog for emitting webhook events. Contains an empty state guiding users to create event types if none are registered, an event type dropdown selector, an interactive JSON payload editor with "Format JSON" and "Sample Data" utilities, real-time RFC-8259 syntax validation alerts, and submission states with loading spinners.
- **Props Interface**:
  - `isOpen: boolean`
  - `applicationId: string`
  - `eventTypes: EventType[]`
  - `onClose: () => void`
  - `onSuccess?: (event: EventDetail) => void`

### `EventDetailModal`
- **Path**: `apps/dashboard/src/modules/events/components/EventDetailModal.tsx`
- **Layer**: Feature Domain Module (`modules/events`)
- **Description**: Comprehensive inspection dialog displaying the full event payload with one-click JSON copy, copyable event ID, formatted timestamp, and a detailed fanout deliveries target list with destination URLs, status badges (`success`, `failed`, `pending`), attempt counts, and direct links to the deliveries telemetry view.
- **Props Interface**:
  - `isOpen: boolean`
  - `applicationId: string`
  - `event: EventItem | null`
  - `onClose: () => void`

### `DeliveriesManager`
- **Path**: `apps/dashboard/src/modules/deliveries/components/DeliveriesManager.tsx`
- **Layer**: Feature Domain Module (`modules/deliveries`)
- **Description**: HTTP delivery attempt monitoring dashboard enclosed in the standardized `mx-auto max-w-7xl` container. Features a page header with telemetry eyebrow, active application pill, description, and refresh button. Displays a 4-metric pipeline summary grid (Total Deliveries, Delivery Success Rate percentage, Failed Deliveries, and In-Flight/Retrying). Provides a segmented status control with live count badges (`All`, `Success`, `Failed`, `Pending`), destination URL/event type search, and a structured table rendering status icons, POST method tags, copyable destination URLs, attempt counts, timestamps, and row action buttons for inspecting and replaying deliveries.
- **Props Interface**:
  - `application: Application | null`
  - `initialDeliveries: DeliveryItem[]`
  - `totalDeliveries: number`

### `DeliveryDetailModal`
- **Path**: `apps/dashboard/src/modules/deliveries/components/DeliveryDetailModal.tsx`
- **Layer**: Feature Domain Module (`modules/deliveries`)
- **Description**: Telemetry modal for inspecting delivery attempts. Displays the destination endpoint URL with copy action, delivery ID, scheduled next attempt notice, original event payload code block, and an accordion-style attempt history list. Each attempt displays its attempt number, HTTP status code badge (with 2xx success and error tints), duration in milliseconds, error diagnostic callouts, formatted outgoing request headers, and formatted HTTP response body. Also provides an instant delivery replay trigger with loading state.
- **Props Interface**:
  - `isOpen: boolean`
  - `applicationId: string`
  - `delivery: DeliveryItem | null`
  - `onClose: () => void`

### `ApplicationsManager`
- **Path**: `apps/dashboard/src/modules/applications/components/ApplicationsManager.tsx`
- **Layer**: Feature Domain Module (`modules/applications`)
- **Description**: Comprehensive application workspace manager. Displays metric overview cards (Total Applications, Active Workspace, Security Standard), real-time name and description filtering, application cards with copyable IDs, relative creation dates, active workspace badges, and action triggers for instant workspace switching via `selectApplicationAction`, application creation (`CreateApplicationModal`), and deletion (`DeleteApplicationDialog`).
- **Props Interface**:
  - `initialApplications: Application[]`
  - `activeApplication: Application | null`

### `MyAccountManager`
- **Path**: `apps/dashboard/src/modules/account/components/MyAccountManager.tsx`
- **Layer**: Feature Domain Module (`modules/account`)
- **Description**: User profile, security, and account management interface. Features a verified member header with avatar/initial fallback, member since date, copyable account UUID, a personal details form (name, email, logo/avatar URL) powered by BFF action `updateUserAction` with live feedback and session cookie updates, and password update utilities.
- **Props Interface**:
  - `user: AuthUser | null`

### `SettingsManager`
- **Path**: `apps/dashboard/src/modules/settings/components/SettingsManager.tsx`
- **Layer**: Feature Domain Module (`modules/settings`)
- **Description**: Platform and delivery configuration interface. Manages active application defaults, configurable outgoing HTTP connection timeout (3s–60s), maximum retry attempts (1–10) with jitter backoff, HMAC-SHA256 signature details, SSRF mitigation guardrails, email failure alert preferences, and danger zone safeguards.
- **Props Interface**:
  - `application: Application | null`
  - `user: AuthUser | null`

### `HelpSupportManager`
- **Path**: `apps/dashboard/src/modules/help/components/HelpSupportManager.tsx`
- **Layer**: Feature Domain Module (`modules/help`)
- **Description**: Developer documentation and support interface. Features an operational system status indicator with pulsing beacon, quickstart and signature verification resource cards, an interactive FAQ accordion covering at-least-once delivery, retry backoff, and SSRF protections, and a direct support ticket submission form with reference ID generation.
- **Props Interface**:
  - None (Self-contained presentation and ticket submission state)

---

## 4. Documentation Protocol

Whenever a component is added or modified:
1. Update this catalog (`docs/frontend/components.md`) with its props and purpose.
2. Ensure it satisfies the 5-color palette and minimalist constraints.
3. Validate with Biome (`pnpm --filter @truehook/web format && pnpm --filter @truehook/web lint`).
