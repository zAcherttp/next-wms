# Implementation Plan: Global State Synchronization

**Branch**: `convex-migration` | **Date**: 2025-11-30 | **Spec**: [spec.md](./spec.md)

## Summary

Centralize Better Auth data fetching to GlobalStateProvider, sync to Zustand store with O(1) permission lookups, use TanStack Query + Convex adapter for all Convex data, and implement server-side permission middleware for Convex mutations.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18/19  
**Primary Dependencies**: TanStack Query v5, @convex-dev/react-query, Zustand, Better Auth, Next.js 16  
**Storage**: Convex (real-time), Zustand (client state)  
**Testing**: Manual validation  
**Target Platform**: Next.js 16 App Router  
**Project Type**: Monorepo (apps/web, packages/backend)  
**Performance Goals**: O(1) permission checks, zero duplicate auth API calls

## Project Structure

### New Files

```text
apps/web/src/
├── providers/
│   ├── query-provider.tsx           # TanStack Query + Convex adapter
│   └── global-state-provider.tsx    # Single Better Auth fetch point
└── stores/
    └── index.ts                     # Barrel export for stores

packages/backend/convex/
└── lib/
    └── withPermission.ts            # Server-side permission middleware
```

### Modified Files

```text
apps/web/src/
├── providers/
│   └── providers.tsx                # Add QueryProvider, GlobalStateProvider
├── hooks/
│   ├── use-has-permission.ts        # Use Zustand O(1) lookup
│   └── use-permissions.ts           # Already exists, needs wiring
├── components/
│   ├── nav-user.tsx                 # Remove useSession, use store
│   ├── nav-workspace.tsx            # Remove Better Auth hooks
│   ├── workspace-sync.tsx           # Use store
│   ├── settings-sidebar.tsx         # O(1) permission filtering
│   └── settings/
│       ├── profile-form.tsx
│       ├── members-table.tsx
│       └── workspace-membership.tsx
└── app/page.tsx                     # Migrate to TanStack convexQuery
```

## Key Design Decisions

### 1. TanStack Query + Convex Adapter

Use `@convex-dev/react-query` for unified query management:

```typescript
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";

// Instead of: useQuery(api.healthCheck.get) from convex/react
// Use:
const { data } = useQuery(convexQuery(api.healthCheck.get, {}));
```

Benefits:

- Unified query/mutation patterns
- Stale-while-revalidate
- Devtools integration
- Same cache for auth + domain data

### 2. GlobalStateProvider as Single Fetch Point

```typescript
// GlobalStateProvider.tsx
export function GlobalStateProvider({ children }) {
  // ONLY place Better Auth hooks are called
  const { data: session } = useSession();
  const { data: orgs } = useListOrganizations();
  const { data: activeOrg } = useActiveOrganization();
  const { data: memberRole } = useActiveMemberRole();
  
  const initialize = useGlobalStore(s => s.initialize);
  
  useEffect(() => {
    if (session && orgs && memberRole) {
      initialize({
        user: mapSession(session),
        tenants: mapOrgs(orgs),
        currentTenantId: activeOrg?.id,
        membership: mapMemberRole(memberRole),
      });
    }
  }, [session, orgs, activeOrg, memberRole]);
  
  return children;
}
```

### 3. O(1) Permission Lookup (No API Calls)

```typescript
// use-has-permission.ts (UPDATED)
export function useHasPermission(permissions: Permissions) {
  const hasPermission = useGlobalStore(selectHasPermission);
  const status = useGlobalStore(selectStatus);
  
  // O(1) lookup, no network call
  const allowed = useMemo(() => {
    for (const [resource, actions] of Object.entries(permissions)) {
      for (const action of actions) {
        if (!hasPermission(resource, action)) return false;
      }
    }
    return true;
  }, [permissions, hasPermission]);
  
  return {
    hasPermission: allowed,
    isLoading: status === "loading" || status === "idle",
    error: null,
  };
}
```

### 4. Convex Server-Side Permission Middleware

```typescript
// packages/backend/convex/lib/withPermission.ts
export function withPermission<Args, Output>(
  resource: string,
  action: string,
  handler: MutationHandler<Args, Output>
): MutationHandler<Args, Output> {
  return async (ctx, args) => {
    const auth = createAuth(ctx);
    const session = await auth.api.getSession({ headers: ctx.headers });
    
    if (!session) {
      throw new Error("Unauthorized");
    }
    
    const hasPermission = await checkPermission(ctx, session.user.id, resource, action);
    if (!hasPermission) {
      throw new Error(`Permission denied: ${resource}:${action}`);
    }
    
    return handler(ctx, args);
  };
}

// Usage:
export const createInventoryItem = mutation(
  withPermission("inventory", "create", async (ctx, args) => {
    // Only runs if user has inventory:create permission
  })
);
```

## Migration Strategy

### Phase 1: Infrastructure (Non-Breaking)

1. Install packages
2. Create providers
3. Keep existing code working

### Phase 2: Store Initialization

1. Wire GlobalStateProvider to call store.initialize()
2. Verify store populates correctly
3. Add devtools verification

### Phase 3: Permission Hook Migration

1. Update useHasPermission to use O(1) lookup
2. Components automatically get faster checks
3. Remove organization.hasPermission() calls

### Phase 4: Component Migration

1. Remove Better Auth imports from components
2. Add useGlobalStore selectors
3. Update loading states

### Phase 5: Convex Query Migration

1. Migrate convex/react useQuery to TanStack
2. Update page.tsx, email-otp.tsx
3. Add new domain queries as needed

### Phase 6: Server Middleware

1. Create withPermission wrapper
2. Apply to existing mutations
3. Document pattern for new mutations

## Integration with Existing Store

The existing Zustand store already has everything needed:

```typescript
// Already in global-store.ts
interface GlobalState {
  user: User | null;
  tenants: Tenant[];
  currentTenantId: string | null;
  membership: Membership | null;
  permissionSet: Set<string>;  // ◄── O(1) lookup ready
  status: StoreStatus;
}

interface GlobalActions {
  initialize: (data: InitializeData) => void;  // ◄── Just needs to be called
  hasPermission: (resource, action) => boolean; // ◄── Already O(1)
}
```

We just need to:

1. Call `initialize()` from GlobalStateProvider
2. Update `useHasPermission` to use `hasPermission()` from store
3. Remove direct Better Auth hook usage from components

## Success Criteria

1. ✅ Better Auth hooks only in GlobalStateProvider
2. ✅ Components use useGlobalStore, not Better Auth directly
3. ✅ Permission checks are O(1) (no network calls)
4. ✅ All Convex queries via TanStack Query
5. ✅ Sensitive mutations have server-side permission check
6. ✅ Loading states consistent across app
