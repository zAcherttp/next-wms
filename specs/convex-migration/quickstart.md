# Quickstart: Convex API Call Optimization

**Date**: 2025-11-30  
**Feature**: Convex API Call Optimization  
**Status**: ✅ IMPLEMENTED

## Overview

This guide provides a quick reference for the implemented Convex API call optimizations in the next-wms application.

## Implementation Summary

### Files Created

| File | Purpose |
|------|---------|
| `apps/web/src/lib/middleware-cache.ts` | Cookie-based caching for middleware verification |
| `apps/web/src/hooks/use-optimistic-organization.ts` | Optimistic UI updates for organization switching |
| `apps/web/src/lib/prefetch.ts` | Debounced prefetching for workspace data |

### Files Modified

| File | Changes |
|------|---------|
| `apps/web/src/proxy.ts` | Added cache check/set integration with middleware-cache |
| `packages/backend/convex/middleware.ts` | Added cache headers and error codes |
| `apps/web/src/components/workspace-sync.tsx` | Uses optimistic organization hook |
| `apps/web/src/components/nav-workspace.tsx` | Added prefetch on hover for workspace items |

## Prerequisites

- Node.js 18+
- pnpm installed
- Convex CLI configured
- Development environment running

## Implemented Features

### 1. Middleware Caching (apps/web/src/lib/middleware-cache.ts)

```typescript
// Key exports:
export function getCachedVerification(request: NextRequest, workspaceSlug: string): CachePayload | null
export function createCachePayload(userId: string, workspaceSlug: string): CachePayload
export function createCacheCookieHeader(payload: CachePayload): string
export function createClearCacheCookieHeader(workspaceSlug: string): string

// Configuration:
const CACHE_TTL_SECONDS = 60; // 1 minute cache validity
const COOKIE_PREFIX = "wms_mw_cache_";
```

### 2. Optimistic Organization Hook (apps/web/src/hooks/use-optimistic-organization.ts)

```typescript
// Usage:
import { useOptimisticOrganization } from "@/hooks/use-optimistic-organization";

function Component() {
  const { organization, isOptimistic, isSwitching, switchOrganization, rollback } = 
    useOptimisticOrganization();
  
  // organization - Current org (optimistic or real)
  // isOptimistic - true if showing optimistic state
  // isSwitching - true during API call
  // switchOrganization(slug) - Switch with optimistic update
  // rollback() - Revert to real state
}
```

### 3. Prefetching (apps/web/src/lib/prefetch.ts)

```typescript
// Usage:
import { usePrefetchWorkspace } from "@/lib/prefetch";

function Component() {
  const { prefetch } = usePrefetchWorkspace();
  
  return (
    <div onMouseEnter={() => prefetch(slug)}>
      Hover to prefetch
    </div>
  );
}
```

## File Structure

```text
apps/web/src/
├── hooks/
│   └── use-optimistic-organization.ts  # NEW - Optimistic org switching
├── lib/
│   ├── middleware-cache.ts             # NEW - Cookie-based caching
│   └── prefetch.ts                     # NEW - Debounced prefetching
├── components/
│   ├── workspace-sync.tsx              # MODIFIED - Uses optimistic hook
│   └── nav-workspace.tsx               # MODIFIED - Prefetch on hover
└── proxy.ts                            # MODIFIED - Cache integration

packages/backend/convex/
└── middleware.ts                       # MODIFIED - Cache headers
```

## Testing

```bash
# Run tests
pnpm test

# Manual testing checklist:
# 1. Login and verify single session fetch
# 2. Navigate between workspaces, verify reduced API calls
# 3. Switch organization, verify optimistic UI update
# 4. Refresh page, verify middleware cache hit
# 5. Logout and verify cache is cleared
```

## Verification

Open browser DevTools → Network tab:

- Before: Multiple `/api/auth/*` calls on page load
- After: Single set of calls with cache hits

### Expected Behavior

| Scenario | Before | After |
|----------|--------|-------|
| First page load | 3-5 API calls | 3-5 API calls |
| Repeat navigation (within 60s) | 3-5 API calls | 0-1 API calls (cached) |
| Organization switch | 500-1000ms delay | Instant (optimistic) |
| Workspace hover | No prefetch | Data prefetched |

## Rollback

If issues occur, the changes are backwards compatible:

1. Remove middleware cache logic → Falls back to full verification
2. Remove optimistic hook → Components use standard hooks
3. No database changes to revert

## Configuration

### Cache TTL

Edit `apps/web/src/lib/middleware-cache.ts`:

```typescript
const CACHE_TTL_SECONDS = 60; // Adjust as needed (1-300 seconds recommended)
```

### Prefetch Debounce

Edit `apps/web/src/lib/prefetch.ts`:

```typescript
const PREFETCH_DEBOUNCE_MS = 150; // Adjust hover delay
```

## Next Steps

After implementing these optimizations:

1. Monitor API call reduction in production
2. Add performance metrics tracking
3. Consider additional prefetching for common paths
4. Evaluate WebSocket subscription consolidation
