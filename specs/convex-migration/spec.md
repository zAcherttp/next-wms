# Feature Specification: Convex API Call Optimization

**Date**: 2025-11-30  
**Branch**: `convex-migration`  
**Status**: Draft

## Summary

Optimize the current Convex API integration to reduce redundant API calls, improve data fetching patterns, and enhance overall application performance. The application uses Convex as the backend with Better Auth for authentication and organization management.

## Current State Analysis

### API Call Patterns Identified

1. **Better Auth Client Hooks**: Multiple components independently call the same hooks:
   - `useSession()` - Called in: sign-in.tsx, nav-user.tsx, onboarding/page.tsx
   - `useListOrganizations()` - Called in: workspace-sync.tsx, nav-workspace.tsx, onboarding/page.tsx, join/page.tsx
   - `useActiveOrganization()` - Called in: workspace-sync.tsx, nav-workspace.tsx, onboarding/page.tsx

2. **Convex Queries**: Direct Convex query usage:
   - `api.healthCheck.get` - Home page health check
   - `api.auth.getEmailVerificationStatus` - Email OTP verification

3. **Middleware Verification**: HTTP action `verifyAccess` is called on every protected route navigation via Next.js middleware

### Key Issues

1. **Redundant Hook Calls**: Same hooks (`useSession`, `useListOrganizations`, `useActiveOrganization`) are called in multiple components, potentially causing unnecessary re-renders and duplicate network requests

2. **No Query Deduplication Strategy**: While Convex handles some caching, there's no application-level strategy for sharing data between components

3. **Middleware Double-Check**: The middleware verification (`proxy.ts` → `verifyAccess` HTTP action) may duplicate checks already performed by Better Auth session handling

4. **Missing Prefetching**: No prefetching strategy for predictable navigation patterns (e.g., workspace switching)

5. **No Optimistic Updates**: Organization switching shows loading states instead of optimistic UI updates

## Requirements

### Functional Requirements

1. **FR-1**: Reduce duplicate API calls for session and organization data
2. **FR-2**: Implement proper data sharing between components using React context or state management
3. **FR-3**: Add optimistic updates for common operations (org switching, navigation)
4. **FR-4**: Implement query prefetching for predictable navigation paths
5. **FR-5**: Optimize middleware verification to avoid redundant session checks

### Non-Functional Requirements

1. **NFR-1**: Reduce API call count by at least 40% for typical user sessions
2. **NFR-2**: Maintain current functionality without breaking changes
3. **NFR-3**: Improve perceived performance through optimistic UI
4. **NFR-4**: Keep bundle size impact minimal (< 10KB additional)

## Proposed Solutions

### 1. Centralized Auth State Provider

Create a higher-order provider that fetches session, organizations, and active organization once and distributes via context.

```typescript
// Proposed structure
<AuthStateProvider>
  <SessionContext.Provider>
    <OrganizationsContext.Provider>
      {children}
    </OrganizationsContext.Provider>
  </SessionContext.Provider>
</AuthStateProvider>
```

### 2. Convex Query Optimization

- Use Convex's built-in query deduplication
- Implement `useStableQuery` patterns for conditional queries
- Add query coalescing for related data

### 3. Middleware Optimization

- Cache middleware verification results in cookies/headers
- Reduce HTTP action calls by leveraging Convex session state
- Consider edge-side caching for static organization membership checks

### 4. Prefetching Strategy

- Prefetch organization data on hover for workspace switcher
- Implement route prefetching for dashboard navigation
- Use Convex's preloadQuery for SSR/SSG optimization

## Success Metrics

1. API call reduction measured via browser DevTools Network tab
2. Time-to-interactive improvement for protected pages
3. Reduced loading spinner appearances during navigation
4. Lighthouse performance score improvement

## Dependencies

- Convex React client (`convex/react`)
- Better Auth client (`better-auth/react`)
- @convex-dev/better-auth integration
- Next.js 15 App Router

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Breaking existing auth flow | Comprehensive testing, feature flags |
| Race conditions in state sharing | Use proper React 18 patterns, Suspense boundaries |
| Stale data issues | Implement proper invalidation strategy |
| Over-engineering | Start with highest-impact changes first |

## Out of Scope

- Backend Convex function optimization
- Database schema changes
- Authentication flow changes
- Adding new features beyond optimization
