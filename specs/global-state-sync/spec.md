# Feature Specification: Global State Synchronization

**Date**: 2025-11-30  
**Branch**: `convex-migration`  
**Status**: Draft

## Summary

Centralize all Better Auth data fetching to a single provider at app load, sync to Zustand global store, use TanStack Query with Convex adapter for all Convex queries, and implement server-side permission middleware in Convex for sensitive actions.

## Problem Statement

### Current State Analysis

**Zustand Global Store**: EXISTS but NEVER USED

- `global-store.ts` has full implementation with O(1) permission lookups
- `use-permissions.ts` hooks exist but are never imported
- No code calls `store.initialize()` - store remains in `"idle"` state forever

**Better Auth Hooks**: DUPLICATED across components

| Hook | Components Using It |
|------|---------------------|
| `useSession` | nav-user, sign-in, profile-form, members-table |
| `useListOrganizations` | workspace-sync, nav-workspace |
| `useActiveOrganization` | nav-workspace, use-optimistic-organization, workspace-membership |
| `useActiveMemberRole` | settings-sidebar, workspace-membership |

**Permission Checking**: INEFFICIENT

- `useHasPermission` makes async API call (`organization.hasPermission()`) per check
- `settings-sidebar.tsx` makes N API calls for N nav items
- Zustand O(1) permission lookup is never used

**Convex Queries**: Using `convex/react` directly (no TanStack integration)

### Issues

1. **Zustand store never initialized** - Global state infrastructure unused
2. **Redundant API calls** - Same hooks called independently in 10+ components
3. **N+1 permission checks** - Each permission check is an async API call
4. **No server-side permission validation** - Convex mutations don't verify permissions
5. **Inconsistent loading states** - Components show skeletons at different times

## Requirements

### Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-1 | Better Auth hooks called ONLY in GlobalStateProvider |
| FR-2 | Components consume from Zustand store, never Better Auth directly |
| FR-3 | Permission checks use Zustand O(1) lookup (no API calls) |
| FR-4 | TanStack Query + Convex adapter for all Convex data |
| FR-5 | Convex middleware validates permissions server-side before mutations |
| FR-6 | Single fetch on app load, refetch on org switch |
| FR-7 | Global loading/error state available |

### Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | Zero duplicate API calls for auth data |
| NFR-2 | O(1) permission checks (no network) |
| NFR-3 | Server-side permission validation for all sensitive mutations |
| NFR-4 | <100ms from store read to component render |

## Proposed Architecture

### Data Flow

```text
┌─────────────────────────────────────────────────────────────────┐
│                         App Load                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   GlobalStateProvider                           │
│  (ONLY place Better Auth hooks are called)                      │
│                                                                 │
│  useSession() ─────────────────────────────────┐                │
│  useListOrganizations() ───────────────────────┤                │
│  useActiveOrganization() ──────────────────────┼──► Sync ──►    │
│  useActiveMemberRole() ────────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Zustand Global Store                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ user, tenants, currentTenantId, membership              │    │
│  │ permissionSet: Set<"resource:action"> ◄── O(1) lookup   │    │
│  │ status: "idle"|"loading"|"ready"|"error"                │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
    ┌──────────┐        ┌──────────┐        ┌──────────┐
    │Component │        │Component │        │Component │
    │    A     │        │    B     │        │    C     │
    └──────────┘        └──────────┘        └──────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                    useGlobalStore()
                    usePermissions() ◄── O(1), no API call
```

### Convex Query Flow (TanStack + Convex Adapter)

```text
┌─────────────────────────────────────────────────────────────────┐
│                    TanStack Query Provider                      │
│                   + @convex-dev/react-query                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  useQuery(convexQuery(api.inventory.list, { warehouseId }))     │
│  useSuspenseQuery(convexQuery(api.orders.get, { id }))          │
│  useMutation(useConvexMutation(api.inventory.create))           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Convex Backend                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  withPermission("inventory", "create", mutation(...))   │    │
│  │  ◄── Server-side permission check before execution      │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Permission Check Comparison

**Before (Current)**:

```typescript
// settings-sidebar.tsx - N API calls for N items
for (const item of group.items) {
  const result = await organization.hasPermission({ permissions: item.permissions });
  // Network call per item!
}
```

**After (Proposed)**:

```typescript
// settings-sidebar.tsx - O(1) store lookup
const { hasPermission } = usePermissions();
const filtered = items.filter(item => 
  hasPermission(item.permissions) // Instant, no network
);
```

## Implementation Approach

### Phase 1: TanStack + Convex Setup

1. Install `@tanstack/react-query` and `@convex-dev/react-query`
2. Create TanStack Query provider with Convex client
3. Migrate existing `convex/react` useQuery calls

### Phase 2: GlobalStateProvider

1. Create provider that calls Better Auth hooks ONCE
2. Sync to Zustand store via `store.initialize()`
3. Handle loading/error states

### Phase 3: Permission Migration

1. Update `useHasPermission` to use Zustand O(1) lookup
2. Remove `organization.hasPermission()` API calls
3. Update all components to use new permission hooks

### Phase 4: Component Migration

1. Remove direct Better Auth hook imports from components
2. Use `useGlobalStore` selectors instead
3. Update loading/skeleton logic

### Phase 5: Convex Permission Middleware

1. Create `withPermission` wrapper for mutations
2. Implement server-side permission check
3. Apply to all sensitive mutations

## Files Affected

### New Files

| File | Purpose |
|------|---------|
| `providers/query-provider.tsx` | TanStack Query + Convex adapter |
| `providers/global-state-provider.tsx` | Single Better Auth fetch point |
| `packages/backend/convex/lib/withPermission.ts` | Server-side permission middleware |

### Modified Files

| File | Changes |
|------|---------|
| `providers/providers.tsx` | Add QueryProvider, GlobalStateProvider |
| `hooks/use-has-permission.ts` | Use Zustand instead of API calls |
| `components/settings-sidebar.tsx` | Remove Better Auth hooks |
| `components/nav-user.tsx` | Use useGlobalStore |
| `components/nav-workspace.tsx` | Use useGlobalStore |
| All settings components | Remove direct hook usage |

### Deleted/Deprecated

| File | Reason |
|------|--------|
| Direct Better Auth hook calls in components | Moved to GlobalStateProvider |
| `organization.hasPermission()` calls | Replaced with O(1) store lookup |

## Success Metrics

| Metric | Before | After |
|--------|--------|-------|
| Better Auth API calls on page load | 10+ (duplicated) | 4 (single set) |
| Permission check latency | ~100ms (network) | <1ms (O(1) lookup) |
| Settings sidebar permission checks | N API calls | 0 API calls |
| Convex mutations with server permission check | 0 | All sensitive |

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking permission checks | Keep old hook working during migration |
| Stale permissions | Refetch on org switch |
| Server-side bypass | Middleware mandatory for all mutations |
| SSR compatibility | Provider handles client-only rendering |

## Out of Scope

- Offline support
- RSC data fetching
- Real-time permission updates (push-based)
