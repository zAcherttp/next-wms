# Northstar WMS

Full warehouse operations demo revived from an SE100 course project. The public `/demo` route is read-only, uses live Convex data, and needs no account. Authenticated routes retain the complete operator workspace.

## Product surface

- Live operations dashboard and reports
- Product, SKU, category, brand, and supplier master data
- Purchase, receiving, outbound, picking, return, transfer, and adjustment flows
- Cycle counting, traceability, audit logs, notifications, and role permissions
- Interactive 3D warehouse layout editor
- Public evaluator demo backed by Convex
- Deterministic demo reset at 00:00, 06:00, 12:00, and 18:00 UTC

## Stack

- Next.js 16 and React 19
- Convex for operational data, realtime queries, functions, and cron jobs
- Better Auth with Neon for authenticated operator accounts
- Tailwind CSS 4, Radix UI, TanStack Query/Table, Motion, and React Three Fiber
- Turborepo and pnpm workspaces

## Local setup

Requirements: Node.js 20+ and pnpm 10.28+.

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm --dir packages/backend db:app:setup
pnpm seed:demo
pnpm --dir packages/backend db:auth:push
pnpm seed:auth
pnpm dev
```

Open `http://localhost:3000`. Root redirects to `/demo`. Full operator login lives at `/auth/sign-in`.

The auth initializer is idempotent and binds Neon identities to Convex's seeded
users:

| Login | Better Auth role | WMS role |
| --- | --- | --- |
| `admin@testwarehouse.com` | owner | Administrator |
| `manager@testwarehouse.com` | admin | Warehouse Manager |
| `testuser@testwarehouse.com` | member | Viewer |

All use `DEMO_ACCOUNT_PASSWORD` from `apps/web/.env.local` (or the shell).
Account, organization, membership, and role
mutations are blocked at runtime. Better Auth may only write session lifecycle
records so users can sign in, sign out, and select the fixed organization.

## Quality gates

```bash
pnpm check-types
pnpm build:web
```

`pnpm check` writes Biome fixes. Review its diff before committing.

## Vercel + Convex

Set these Vercel variables before deploying:

| Variable | Scope | Purpose |
| --- | --- | --- |
| `CONVEX_DEPLOY_KEY` | Production / Preview | Deploy matching Convex backend |
| `AUTH_DATABASE_URL` | Production / Preview | Neon pooled PostgreSQL URL |
| `BETTER_AUTH_SECRET` | Production / Preview | 32+ character auth secret |
| `SITE_URL` | Production / Preview | Exact Vercel origin |
| `RESEND_API_KEY` | Production / Preview | Auth email delivery |
| `RESEND_EMAIL_FROM` | Production / Preview | Verified sender |

`NEXT_PUBLIC_CONVEX_URL` is injected into the Next build by `convex deploy`.
`DEMO_ACCOUNT_PASSWORD` is only needed while running `pnpm seed:auth`; it is not
needed by the deployed runtime.

1. Create a production deployment in Convex.
2. Generate production and preview deploy keys.
3. Import this repository into Vercel with repository root as project root.
4. Add `CONVEX_DEPLOY_KEY` to Production and Preview using their matching keys.
5. Add authenticated-app variables from `apps/web/.env.example` if operator login is required.
6. Deploy. `vercel.json` runs Convex deployment before the Next.js build.
7. Seed production once:

```bash
pnpm --dir packages/backend exec convex run seedMockData:seedAllTestData --prod
pnpm --dir packages/backend db:auth:push
pnpm seed:auth
```

Preview Convex deployments seed automatically through `--preview-run`.

Detailed assessment and production checklist: [`docs/REVIVAL.md`](docs/REVIVAL.md).
