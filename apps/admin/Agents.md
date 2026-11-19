# TrueHook Admin Console (`apps/admin`)

The internal administration console exclusively for TrueHook company operators. It is not customer-facing.

---

## 1. Applicable Skills

- **`frontend-components`** (`.agents/skills/frontend-components/SKILL.md`): Component composition, strictly-typed props, keeping route shells thin, updating component catalogs.
- **`frontend-design`** (`.agents/skills/frontend-design/SKILL.md`): Clean high contrast, operator-centric minimalist layout using `#111111` obsidian canvas, `#F3EEE3` cream typography/borders, and `#D9541E` terracotta accent.
- **`security-review`** (`.agents/skills/security-review/SKILL.md`): Strict operator authorization via HTTP-only JWT cookies, constant-time bcrypt password comparison, zero credential leakage.
- **`testing`** (`.agents/skills/testing/SKILL.md`): Admin authentication flows, operator permission boundaries, UI error states.

---

## 2. Scope & Responsibilities

- **System Health & Observability**: Real-time Go API latency, PostgreSQL database connection pool status, and infrastructure metrics.
- **Cross-Tenant Management**: Tenant search, customer identity inspection, account UUID copying, and registration timestamp audits.
- **Authentication & Authorization**: Protected operator console with BFF Server Actions (`signInAction`, `signOutAction`), HTTP-only session cookies (`truehook_admin_token`, `truehook_admin_user`), and route protection middleware.
- **Access Guardrails**: Accessible strictly by authenticated internal operators with cryptographic token verification.

---

## 3. Directory Layout & Active Components

```
apps/admin/src/
├── actions/                  # BFF Server Actions
│   ├── auth.ts               # signInAction, signOutAction, getAdminSessionAction
│   └── users.ts              # getAdminUsersAction, getAdminUserDetailAction, getSystemHealthAction
│
├── app/                      # Next.js App Router (thin route shells)
│   ├── layout.tsx            # Global admin layout & operator console metadata
│   ├── page.tsx              # Session-guarded root redirect (/overview vs /signin)
│   ├── signin/page.tsx       # Operator signin shell
│   ├── overview/page.tsx     # Operator fleet overview & cross-tenant shell
│   └── not-found.tsx         # Custom 404 page shell
│
├── components/               # Active local component adapters & layout
│   ├── background/
│   │   └── BackgroundSVG.tsx # Subtle dark wave backdrop for auth
│   ├── layout/
│   │   └── AdminHeader.tsx   # Operator navbar, badge, and signout action
│   └── ui/                   # Used UI adapters re-exported from @truehook/ui
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── not-found.tsx
│       ├── separator.tsx
│       ├── sound.tsx
│       ├── table.tsx
│       └── toast.tsx
│
├── lib/                      # Session and domain types
│   ├── session.ts            # Cookie session getters/setters (truehook_admin_token)
│   └── types.ts              # AdminUser, BackendAuthData, TenantUser, SystemHealthStatus
│
├── middleware.ts             # Route guard for /overview, /signin, and /
│
└── modules/                  # Admin feature domains
    ├── auth/                 # Operator authentication module
    │   ├── AdminSignInForm.tsx
    │   ├── SocialButtons.tsx
    │   └── TrueHookLogo.tsx
    └── overview/             # Operator fleet & tenant inspection module
        └── OverviewManager.tsx
```

> **Important**: Do not add unused component wrappers to `src/components/ui/`. Only add adapters from `@truehook/ui` when they are actively imported and used by an admin module or page.

---

## 4. Design & Aesthetic Rules

- **Strict Color Scheme**: `#111111` obsidian background, `#F3EEE3` cream text and borders, `#D9541E` terracotta primary accent.
- **Dense, Utilitarian Aesthetic**: High information density, clear tabular views for tenant monitoring, unambiguous status indicators.
- **Documentation**: Document any new admin page in `docs/frontend/pages.md` and components in `docs/frontend/components.md`.
