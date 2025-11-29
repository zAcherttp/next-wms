# Implementation Plan: Convex API Call Optimization

**Branch**: `convex-migration` | **Date**: 2025-11-30 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/convex-migration/spec.md`

## Summary

Optimize Convex API integration to reduce redundant API calls, improve data fetching patterns, and enhance application performance. Key optimizations include middleware caching for session verification, optimistic UI updates for organization switching, and proper utilization of existing Better Auth caching mechanisms.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18/19, Next.js 15  
**Primary Dependencies**: Convex, Better Auth, @convex-dev/better-auth, @tanstack/react-form  
**Storage**: Convex (serverless database with real-time subscriptions)  
**Testing**: Vitest (recommended), React Testing Library  
**Target Platform**: Web (Next.js App Router, SSR/CSR hybrid)  
**Project Type**: Monorepo (web app + backend packages)  
**Performance Goals**: 40% reduction in API calls, <100ms perceived response for org switching  
**Constraints**: No breaking changes, <10KB bundle impact, maintain Better Auth compatibility  
**Scale/Scope**: Multi-tenant SaaS, organization-based workspaces

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Pre-Phase 0 Check**: ✅ PASS

- No constitution-specific gates defined (template placeholder)
- Feature is optimization-only, no new core functionality
- No schema changes required
- Backwards compatible implementation

**Post-Phase 1 Check**: ✅ PASS

- Design follows existing patterns
- No new abstractions introduced (uses existing Better Auth provider)
- Cache strategy is simple and auditable
- Rollback path is clear

## Project Structure

### Documentation (this feature)

```text
specs/convex-migration/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research findings
├── data-model.md        # Data model documentation
├── quickstart.md        # Implementation quickstart
├── contracts/           # API contracts
│   └── api-contracts.md
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/web/
├── src/
│   ├── hooks/
│   │   └── use-optimistic-organization.ts  # NEW: Optimistic org switching
│   ├── lib/
│   │   └── middleware-cache.ts             # NEW: Cache utilities
│   ├── proxy.ts                            # MODIFIED: Add caching
│   └── components/
│       ├── workspace-sync.tsx              # MODIFIED: Use optimistic hook
│       └── nav-workspace.tsx               # MODIFIED: Add prefetching
packages/backend/
└── convex/
    └── middleware.ts                       # MODIFIED: Cache headers
```

**Structure Decision**: Monorepo web application structure. Changes are minimal and localized to existing files with two new utility files for hooks and cache logic.

## Implementation Phases

### Phase 1: Middleware Caching (High Impact, Low Risk)

- Add cookie-based cache for middleware verification
- Reduce HTTP action calls by ~80% for repeat page views
- Files: `proxy.ts`, `middleware.ts`, `middleware-cache.ts`

### Phase 2: Optimistic Organization Switching (Medium Impact, Medium Risk)

- Create `useOptimisticOrganization` hook
- Update `WorkspaceSync` to use optimistic updates
- Improve perceived performance for workspace switching

### Phase 3: Prefetching Strategy (Low Impact, Low Risk)

- Add hover-based prefetching for workspace switcher
- Optional enhancement based on Phase 1-2 results

### Phase 4: Query Consolidation (Optional, Future)

- Combine related Convex queries if needed
- Depends on application growth patterns

## Complexity Tracking

No complexity violations. Implementation follows existing patterns and adds minimal new code.

## Dependencies & Risks

| Dependency | Risk | Mitigation |
|------------|------|------------|
| Better Auth cache behavior | Low | Research confirmed React Query handles caching |
| Cookie-based cache security | Low | Short TTL (60s), HttpOnly, no sensitive data |
| Optimistic state rollback | Medium | Proper error handling, toast notifications |

## Success Criteria

1. ✅ API calls reduced by 40%+ (measured via Network tab)
2. ✅ No breaking changes to existing functionality
3. ✅ Optimistic org switching feels instant
4. ✅ Bundle size increase <10KB
