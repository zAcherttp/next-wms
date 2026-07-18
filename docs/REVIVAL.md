# Revival assessment and production directives

## Starting state

The default `master` branch was not the finished course submission. `main-merge` contained 129 additional commits and the actual operational modules. Revival work therefore starts from `origin/main-merge` on `codex/vercel-convex-demo`.

Baseline findings:

- Convex already owned warehouse operational data, but the README still described the removed tRPC/Drizzle architecture.
- Type checking failed across reports, Excel imports, Convex IDs, Recharts, and the 3D layout editor.
- `crons.ts` only checked inventory expiry; no demo reset existed.
- Clear-data mutations omitted `members`, `picking_sessions`, and `picking_session_details`, so repeated seeds accumulated stale records.
- Root route exposed a plain login card, creating a poor evaluator path.
- Next image configuration contained a hard-coded old Convex deployment.
- Vercel/Convex CI configuration and deployment instructions were absent.

## Current demo architecture

`/demo` is a public read-only surface. `myFunctions.getDemoSnapshot` returns a bounded operational aggregate from Convex. No Better Auth or Neon connection is needed for this route.

`myFunctions.resetDemoData` runs as an internal Convex action. It clears application tables, preserves Better Auth data, then loads deterministic warehouse fixtures. `crons.ts` invokes it four times per day at fixed UTC times.

Authenticated operator routes remain available at `/auth/sign-in`. They use Better Auth and Neon for identity while Convex stores warehouse domain data.

Neon is initialized once with three fixed identities mapped to the Convex seed's
Administrator, Warehouse Manager, and Viewer users. Runtime auth guards reject
account, organization, member, and role mutations. Session create/update/delete
remains writable because Better Auth requires session persistence for login.
The Convex cron has no Neon connection and cannot reset or mutate auth records.

## Production checklist

### Convex

- Create production and preview deployments.
- Put production deploy key in Vercel Production; preview deploy key in Vercel Preview.
- Run `seedMockData:seedAllTestData` once against production.
- Confirm cron history shows `reset-public-demo-data` at 00:00, 06:00, 12:00, and 18:00 UTC.
- Confirm reset duration stays below six hours. Convex prevents overlapping runs.
- Restrict or remove public seed/clear mutations after initial launch. Scheduled reset itself is internal.

### Vercel

- Use repository root as Root Directory.
- Keep `vercel.json` build and output settings.
- Set `CONVEX_DEPLOY_KEY`.
- Set `SITE_URL` to the exact production origin. Convex injects `NEXT_PUBLIC_CONVEX_URL` during the build.
- Add `AUTH_DATABASE_URL`, `BETTER_AUTH_SECRET`, and Resend values only when authenticated routes are enabled.
- Set `DEMO_ACCOUNT_PASSWORD`, run the Drizzle schema push/migration, then run `pnpm seed:auth` once.
- Add production URL to Better Auth trusted origins.

### Demo operations

- Smoke-test `/demo` without cookies in a private window.
- Verify inventory and activity update after a manual reset.
- Keep public queries read-only. Never expose reset mutation to browser clients.
- Monitor Convex function failures and Vercel runtime logs.
- Use a separate Convex production deployment for portfolio traffic; never point demo at personal development data.

## Next hardening pass

1. Replace large legacy `seedMockData.ts` with small fixture modules and a shared table-clear owner.
2. Add browser tests for public demo, sign-in, branch selection, inventory, receiving, outbound, and reset recovery.
3. Add error monitoring and uptime checks for Vercel, Convex query health, and cron history.
4. Move Better Auth storage to a Convex-supported adapter if a strictly single-database architecture is required.
5. Remove unused mock files and dead course-era feature branches after production behavior is proven.
