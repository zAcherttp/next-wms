# Research: Convex API Call Optimization

**Date**: 2025-11-30  
**Feature**: Convex API Call Optimization  
**Status**: Complete

## Research Topics

### 1. Convex Query Deduplication & Caching Behavior

**Question**: How does Convex handle duplicate queries across components?

**Finding**:

- Convex React client automatically deduplicates identical queries with the same arguments
- Multiple `useQuery(api.fn, args)` calls with identical `fn` and `args` share a single subscription
- However, Better Auth hooks (`useSession`, `useListOrganizations`) wrap underlying fetch calls, not Convex queries
- Better Auth client-side hooks use `@tanstack/react-query` internally for caching

**Decision**: Leverage existing Convex deduplication for Convex queries, but need explicit caching strategy for Better Auth hooks

**Rationale**: Better Auth hooks already have built-in caching via React Query, but components must share the same query client instance

**Alternatives Considered**:

- Custom caching layer → Rejected: Would duplicate React Query functionality
- Redux/Zustand state → Rejected: Over-engineering for this use case

---

### 2. React Context vs Prop Drilling for Auth State

**Question**: Best pattern for sharing session/org state across component tree?

**Finding**:

- Better Auth's `ConvexBetterAuthProvider` already provides auth context
- Hooks like `useSession()` are designed to be called anywhere in the tree
- React Query's `QueryClient` ensures cache sharing when using same provider
- Issue may be that some components aren't properly within the provider tree

**Decision**: Verify provider placement and ensure all auth hook consumers are within `ConvexBetterAuthProvider`. No additional context needed.

**Rationale**: The existing architecture is correct; optimization comes from proper usage, not new abstractions

**Alternatives Considered**:

- Additional SessionContext → Rejected: Duplicates Better Auth functionality
- Global state store → Rejected: Conflicts with reactive query pattern

---

### 3. Middleware Verification Optimization

**Question**: Can we reduce HTTP action calls in `proxy.ts`?

**Finding**:

- Current flow: Next.js middleware → HTTP fetch → Convex HTTP action → DB queries
- Each protected route navigation triggers this flow
- Session cookies are already being forwarded
- Convex doesn't support Edge Runtime, limiting middleware options

**Decision**: Implement session caching using response headers + short-lived cookie cache

**Rationale**: Workspace membership rarely changes; can cache for 60s without security impact

**Alternatives Considered**:

- Move verification to client-side → Rejected: Security concern (middleware is for protection)
- JWT tokens with org claims → Rejected: Requires auth flow changes (out of scope)
- Edge KV store → Rejected: Adds infrastructure complexity

---

### 4. Convex Preloading for SSR

**Question**: Can we use `preloadQuery` for faster initial page loads?

**Finding**:

- `preloadQuery` allows fetching data on server and passing to client
- Works with Next.js App Router via `convex/nextjs`
- Better Auth session is HTTP-only cookie based, available in server components
- However, Better Auth hooks are client-side only

**Decision**: Implement selective preloading for non-auth Convex queries only

**Rationale**: Auth data must be client-side due to Better Auth architecture; other data can be preloaded

**Alternatives Considered**:

- Full SSR auth → Rejected: Would require major Better Auth architecture change
- RSC for all data → Rejected: Better Auth compatibility issues

---

### 5. Optimistic Updates Pattern

**Question**: How to implement optimistic updates for org switching?

**Finding**:

- Current `WorkspaceSync` component waits for API response before showing success
- Better Auth's `organization.setActive()` returns after server confirmation
- React Query supports optimistic updates via `mutate()` options

**Decision**: Implement optimistic organization switching with rollback on error

**Rationale**: Organization context (name, logo, slug) is already known; can optimistically update UI

**Implementation Approach**:

```typescript
// Optimistic pattern
const switchOrganization = async (org) => {
  // Immediately update local state
  setOptimisticOrg(org);
  
  try {
    await organization.setActive({ organizationId: org.id });
  } catch (error) {
    // Rollback on error
    setOptimisticOrg(previousOrg);
    toast.error('Failed to switch workspace');
  }
};
```

---

### 6. Query Coalescing Strategy

**Question**: Can we batch multiple queries into fewer network calls?

**Finding**:

- Convex doesn't support GraphQL-style query batching
- Each `useQuery` is an independent WebSocket subscription
- However, Convex subscriptions are efficient (incremental updates)
- Multiple queries to same function with different args = multiple subscriptions

**Decision**: Restructure queries to fetch related data in single calls where possible

**Rationale**: Fewer subscriptions = less memory, simpler debugging

**Example**:

```typescript
// Instead of:
useQuery(api.auth.getUser, { id: userId });
useQuery(api.auth.getUserOrgs, { userId });

// Combine into:
useQuery(api.auth.getUserWithOrgs, { userId });
```

---

## Summary of Decisions

| Area | Decision | Impact |
|------|----------|--------|
| Auth State Sharing | Use existing Better Auth provider properly | Low effort, correctness fix |
| Middleware Caching | Add 60s response cache header | Medium effort, reduces HTTP calls |
| SSR Preloading | Selective preloading for non-auth queries | Medium effort, faster initial loads |
| Optimistic Updates | Implement for org switching | Medium effort, better perceived perf |
| Query Coalescing | Combine related Convex queries | Low effort, fewer subscriptions |

## Unresolved Questions

None - all clarifications resolved.

## References

- [Convex Query Subscriptions](https://docs.convex.dev/using/react)
- [Better Auth React Integration](https://www.better-auth.com/docs/integrations/react)
- [React Query Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Next.js Middleware Caching](https://nextjs.org/docs/app/building-your-application/routing/middleware)
