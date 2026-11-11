# TrueHook Admin Console (`apps/admin`)

The internal administration console exclusively for TrueHook company operators. It is not customer-facing.

---

## 1. Applicable Skills

- **`frontend-components`** (`.agents/skills/frontend-components/SKILL.md`): Component composition, strictly-typed props, keeping route shells thin, updating component catalogs.
- **`frontend-design`** (`.agents/skills/frontend-design/SKILL.md`): 5-color palette, high contrast, clean typography, operator-centric minimalist layout.
- **`security-review`** (`.agents/skills/security-review/SKILL.md`): Strict operator authorization, audit logging, preventing accidental exposure of tenant data or signing secrets.
- **`testing`** (`.agents/skills/testing/SKILL.md`): Admin authentication flows, operator permission boundaries, UI error states.

---

## 2. Scope & Responsibilities

- **System Health & Observability**: Real-time worker queues, NATS JetStream stream consumers, delivery lag metrics, and system throughput.
- **Cross-Tenant Management**: Tenant search, organization status, plan quotas, endpoint suspension, and incident remediation.
- **Configuration & Operational Controls**: Global retry backoff ceilings, rate limits, IP blocklists, and platform feature toggles.
- **Access Guardrails**: Accessible strictly by authenticated internal operators with multi-factor authentication (MFA).

---

## 3. Directory Layout & Active Components

```
apps/admin/src/
├── app/                      # Next.js App Router (thin route shells)
│   ├── layout.tsx            # Global admin layout & theme
│   ├── page.tsx              # Root admin page
│   ├── login/page.tsx        # Operator login shell
│   └── not-found.tsx         # Custom 404 page shell
│
├── components/               # Active local component adapters
│   ├── background/
│   │   └── BackgroundSVG.tsx # Subtle dark wave backdrop for auth
│   └── ui/                   # Used UI adapters re-exported from @truehook/ui
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── not-found.tsx
│       └── separator.tsx
│
└── modules/                  # Admin feature domains
    └── auth/                 # Operator authentication module
        ├── AdminLoginForm.tsx
        ├── SocialButtons.tsx
        └── TrueHookLogo.tsx
```

> **Important**: Do not add unused component wrappers to `src/components/ui/`. Only add adapters from `@truehook/ui` when they are actively imported and used by an admin module or page.

---

## 4. Design & Aesthetic Rules

- **Strict 5-Color Palette**: `#141412` (dominant dark background), `#f2f2e8` (cream text and borders), `#124060` (nautical blue accents/primary actions), `#ea5c47` (coral red destructive/error actions), `#c39f59` (brass warnings/status indicators).
- **Dense, Utilitarian Aesthetic**: High information density, clear tabular views for tenant monitoring, unambiguous status indicators.
- **Documentation**: Document any new admin page in `docs/frontend/pages.md` and components in `docs/frontend/components.md`.
