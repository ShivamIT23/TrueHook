# Frontend Pages & Routes Catalog

This document tracks all Next.js App Router route shells across TrueHook frontend applications.

---

## 1. Public Marketing & Auth (`apps/web`)

| Route Path | File Path | Audience | Modules & Primitives Composed |
| :--- | :--- | :--- | :--- |
| `layout` | `apps/web/src/app/layout.tsx` | All Visitors | Global root layout composing dark sticky `Header` (obsidian `#111111` background, cream `#F3EEE3` brand, desktop/mobile navigation, and terracotta `#D9541E` CTAs), toast system, and sound effects |
| `/` | `apps/web/src/app/page.tsx` | Public | Marketing landing page with hero, semantic color tokens, and primary CTA action button |
| `/signin` | `apps/web/src/app/signin/page.tsx` | Public / Users | `SignInForm`, `BackgroundSVG` |
| `/signup` | `apps/web/src/app/signup/page.tsx` | Public / Users | `SignUpForm`, `BackgroundSVG` |
| `[404]` | `apps/web/src/app/not-found.tsx` | Any unmatched route | `NotFound` (from `@/components/ui/not-found`, light theme) |

---

## 2. Customer Dashboard (`apps/dashboard`)

| Route Path | File Path | Audience | Modules & Primitives Composed |
| :--- | :--- | :--- | :--- |
| `/` | `apps/dashboard/src/app/page.tsx` | Authenticated Customers | `DashboardHeader` (logo on left, active app badge, user avatar with dropdown menu), `ApplicationSelector` (showcase applications, interactive select, detailed application data showcase, empty state, and `CreateApplicationModal`). Once an application is selected, saved to `localStorage` (localhost) and cookies, and subsequent visits to `/` redirect directly to `/dashboard` (unless switching with `?switch=true`). Session guard redirects to `/signin` if unauthenticated. |
| `/(protected-route)` | `apps/dashboard/src/app/(protected-route)/layout.tsx` | Authenticated Customers with Active Application | Protected layout Server Component ensuring authentication token, valid user profile, and active application selection. Composes `ProtectedLayoutShell` providing responsive collapsible sidebar navigation (`Sidebar`), mobile drawer overlay, and sticky `DashboardHeader`. Redirects to `/signin` if unauthenticated and to `/` if no application is selected. |
| `/dashboard` | `apps/dashboard/src/app/(protected-route)/dashboard/page.tsx` | Authenticated Customers with Active Application | `DashboardOverview` displaying active application context, delivery pipeline metrics (Active Endpoints, Events Streamed, Delivery Success, HMAC Signing), and quick actions. |
| `/applications` | `apps/dashboard/src/app/(protected-route)/applications/page.tsx` | Authenticated Customers with Active Application | Dedicated applications workspace composing `ApplicationsManager`. Server Component fetches registered applications and active selection. Provides 3-metric overview grid (Total Applications, Active Workspace, Security Standard), real-time search, one-click ID copying, seamless workspace switching via `selectApplicationAction`, creation modal (`CreateApplicationModal`), and deletion dialog (`DeleteApplicationDialog`). Accessible via Sidebar navigation and User Dropdown menu. |
| `/my-account` | `apps/dashboard/src/app/(protected-route)/my-account/page.tsx` | Authenticated Customers | User profile and credentials workspace composing `MyAccountManager`. Fetches authenticated user via `getUserAction` and session. Displays verified profile card with avatar/initial fallback, member since date, copyable account UUID, personal information update form (Name, Email, Avatar URL), and password change utility with real-time feedback and session cookie synchronization. |
| `/settings` | `apps/dashboard/src/app/(protected-route)/settings/page.tsx` | Authenticated Customers with Active Application | System configuration and delivery policy workspace composing `SettingsManager`. Configures active application defaults, HTTP request timeout thresholds (3s–60s), maximum retry attempts (1–10) with jitter backoff, SSRF and network isolation status indicators, email failure notifications, weekly health digests, and danger zone safeguards. |
| `/help` | `apps/dashboard/src/app/(protected-route)/help/page.tsx` | Authenticated Customers | Developer documentation and technical support workspace composing `HelpSupportManager`. Features operational system health pill, resource quick-start cards (Quickstart, Signature Verification with HMAC-SHA256, REST API Documentation), interactive FAQ accordion for delivery mechanics and idempotency, and direct support ticket submission form with reference ID generation. |
| `/event-type` | `apps/dashboard/src/app/(protected-route)/event-type/page.tsx` | Authenticated Customers with Active Application | Event Types management workspace composing `EventTypesManager`. Server component fetches initial event types via BFF `getEventTypesAction` for the active application context. Provides real-time search, one-click identifier copying, and interactive modals for creating (`CreateEventTypeModal`), editing (`EditEventTypeModal`), and deleting (`DeleteEventTypeDialog`) event types. |
| `/endpoints` | `apps/dashboard/src/app/(protected-route)/endpoints/page.tsx` | Authenticated Customers with Active Application | Webhook endpoints registration and destination URL management workspace composing `EndpointsManager`. Server Component fetches initial endpoints via BFF `getEndpointsAction` and available event types via `getEventTypesAction`. Powered by TanStack Query for automatic background revalidation and cache updates. Provides URL search, protocol badges, event type subscription pills, secret mask/reveal with copy, active/disabled status pills, and interactive modals for registering (`CreateEndpointModal`), editing (`EditEndpointModal`), and deleting (`DeleteEndpointDialog`) endpoints with support for granular event type subscriptions (`endpoint_event_types`). |
| `/events` | `apps/dashboard/src/app/(protected-route)/events/page.tsx` | Authenticated Customers with Active Application | Webhook event publishing and monitoring workspace composing `EventsManager`. Server Component fetches initial events via `getEventsAction` and registered event types via `getEventTypesAction`. Standardized in `mx-auto max-w-7xl` with page header, 4-card metric overview grid (Total Events, Dispatched Deliveries, Event Types, Fanout Ratio), real-time search, event type selector, polished stream table with copyable monospace IDs, payload preview code snippets, relative timestamps, inspection modal (`EventDetailModal`), and publish modal (`PublishEventModal`) with format and sample utilities. |
| `/deliveries` | `apps/dashboard/src/app/(protected-route)/deliveries/page.tsx` | Authenticated Customers with Active Application | Delivery inspection, attempt telemetry, and manual replay workspace composing `DeliveriesManager`. Server Component fetches initial deliveries via `getDeliveriesAction`. Standardized in `mx-auto max-w-7xl` with page header, 4-card metric overview grid (Total Deliveries, Success Rate %, Failed, Pending/Retrying), segmented status tabs with counter badges, destination URL search, polished table with status icons, POST badges, one-click URL copy, and comprehensive telemetry inspection modal (`DeliveryDetailModal`) with expandable attempt details, latency in ms, error diagnostics, request headers, response payload, and manual replay triggers. |
| `/signin` | `apps/dashboard/src/app/signin/page.tsx` | Customers | `SignInForm` (powered by BFF `signInAction`, redirects to `/dashboard` if authenticated with application, or `/`), `BackgroundSVG` |
| `/signup` | `apps/dashboard/src/app/signup/page.tsx` | Customers | `SignUpForm` (powered by BFF `signUpAction`, redirects to `/dashboard` if authenticated with application, or `/`), `BackgroundSVG` |
| `[404]` | `apps/dashboard/src/app/not-found.tsx` | Any unmatched route | `NotFound` (from `@/components/ui/not-found`, light theme) |

---

## 3. Operator Administration Console (`apps/admin`)

| Route Path | File Path | Audience | Modules & Primitives Composed |
| :--- | :--- | :--- | :--- |
| `/` | `apps/admin/src/app/page.tsx` | Internal Operators | Redirect to `/signin` |
| `/signin` | `apps/admin/src/app/signin/page.tsx` | Internal Operators | `AdminSignInForm`, `BackgroundSVG` |
| `[404]` | `apps/admin/src/app/not-found.tsx` | Any unmatched route | `NotFound` (from `@/components/ui/not-found`, light theme) |
