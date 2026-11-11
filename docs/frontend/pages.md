# Frontend Pages & Routes Catalog

This document tracks all Next.js App Router route shells across TrueHook frontend applications.

---

## 1. Public Marketing & Auth (`apps/web`)

| Route Path | File Path | Audience | Modules & Primitives Composed |
| :--- | :--- | :--- | :--- |
| `/` | `apps/web/src/app/page.tsx` | Public | Marketing landing page |
| `/login` | `apps/web/src/app/login/page.tsx` | Public / Users | `LoginForm`, `BackgroundSVG` |
| `/register` | `apps/web/src/app/register/page.tsx` | Public / Users | `RegisterForm`, `BackgroundSVG` |
| `[404]` | `apps/web/src/app/not-found.tsx` | Any unmatched route | `NotFound` (from `@/components/ui/not-found`, light theme) |

---

## 2. Customer Dashboard (`apps/dashboard`)

| Route Path | File Path | Audience | Modules & Primitives Composed |
| :--- | :--- | :--- | :--- |
| `/` | `apps/dashboard/src/app/page.tsx` | Authenticated Customers | `DashboardHeader` (logo on left, active app badge, user avatar with dropdown menu), `ApplicationSelector` (showcase applications, interactive select, detailed application data showcase, empty state, and `CreateApplicationModal`). Once an application is selected, saved to `localStorage` (localhost) and cookies, and subsequent visits to `/` redirect directly to `/dashboard` (unless switching with `?switch=true`). Session guard redirects to `/login` if unauthenticated. |
| `/(protected-route)` | `apps/dashboard/src/app/(protected-route)/layout.tsx` | Authenticated Customers with Active Application | Protected layout Server Component ensuring authentication token, valid user profile, and active application selection. Composes `ProtectedLayoutShell` providing responsive collapsible sidebar navigation (`Sidebar`), mobile drawer overlay, and sticky `DashboardHeader`. Redirects to `/login` if unauthenticated and to `/` if no application is selected. |
| `/dashboard` | `apps/dashboard/src/app/(protected-route)/dashboard/page.tsx` | Authenticated Customers with Active Application | `DashboardOverview` displaying active application context, delivery pipeline metrics (Active Endpoints, Events Streamed, Delivery Success, HMAC Signing), and quick actions. |
| `/event-type` | `apps/dashboard/src/app/(protected-route)/event-type/page.tsx` | Authenticated Customers with Active Application | Event Types management workspace composing `EventTypesManager`. Server component fetches initial event types via BFF `getEventTypesAction` for the active application context. Provides real-time search, one-click identifier copying, and interactive modals for creating (`CreateEventTypeModal`), editing (`EditEventTypeModal`), and deleting (`DeleteEventTypeDialog`) event types. |
| `/endpoints` | `apps/dashboard/src/app/(protected-route)/endpoints/page.tsx` | Authenticated Customers with Active Application | Webhook endpoints registration and destination URL management workspace composing `EndpointsManager`. Server Component fetches initial endpoints via BFF `getEndpointsAction` for the active application context. Powered by TanStack Query for automatic background revalidation and cache updates. Provides URL search, HTTPS/HTTP protocol badges, secret mask/reveal with copy, active/disabled status pills, and interactive modals for registering (`CreateEndpointModal`), editing (`EditEndpointModal`), and deleting (`DeleteEndpointDialog`) endpoints. |
| `/events` | `apps/dashboard/src/app/(protected-route)/events/page.tsx` | Authenticated Customers with Active Application | Event stream inspection and payload monitoring shell. |
| `/deliveries` | `apps/dashboard/src/app/(protected-route)/deliveries/page.tsx` | Authenticated Customers with Active Application | Delivery attempts log, response payload inspection, and manual replay shell. |
| `/login` | `apps/dashboard/src/app/login/page.tsx` | Customers | `LoginForm` (powered by BFF `loginAction`, redirects to `/dashboard` if authenticated with application, or `/`), `BackgroundSVG` |
| `/register` | `apps/dashboard/src/app/register/page.tsx` | Customers | `RegisterForm` (powered by BFF `registerAction`, redirects to `/dashboard` if authenticated with application, or `/`), `BackgroundSVG` |
| `[404]` | `apps/dashboard/src/app/not-found.tsx` | Any unmatched route | `NotFound` (from `@/components/ui/not-found`, light theme) |

---

## 3. Operator Administration Console (`apps/admin`)

| Route Path | File Path | Audience | Modules & Primitives Composed |
| :--- | :--- | :--- | :--- |
| `/` | `apps/admin/src/app/page.tsx` | Internal Operators | Redirect to `/login` |
| `/login` | `apps/admin/src/app/login/page.tsx` | Internal Operators | `AdminLoginForm`, `BackgroundSVG` |
| `[404]` | `apps/admin/src/app/not-found.tsx` | Any unmatched route | `NotFound` (from `@/components/ui/not-found`, light theme) |
