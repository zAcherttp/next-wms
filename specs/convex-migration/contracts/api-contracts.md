# API Contracts: Convex API Call Optimization

**Date**: 2025-11-30  
**Feature**: Convex API Call Optimization

## Overview

This document defines the API contracts for optimization-related changes. Since this is an optimization feature, most contracts are internal patterns rather than new API endpoints.

## 1. Middleware Cache Response Headers

### Contract: Cached Verification Response

When middleware verification succeeds, the response includes cache headers:

```http
HTTP/1.1 200 OK
Content-Type: application/json
X-WMS-Cache-Control: max-age=60
X-WMS-Cache-Key: wms_mw_cache_{workspaceSlug}
Set-Cookie: wms_mw_cache_{workspaceSlug}={base64_payload}; Path=/; Max-Age=60; HttpOnly; SameSite=Lax

{
  "valid": true,
  "userId": "string",
  "orgId": "string",
  "orgName": "string",
  "cached": false
}
```

### Contract: Cache Hit Response

```http
HTTP/1.1 200 OK
Content-Type: application/json
X-WMS-Cache-Hit: true

{
  "valid": true,
  "userId": "string",
  "orgId": "string",
  "orgName": "string",
  "cached": true
}
```

## 2. Optimistic State Hook Contract

### Interface: useOptimisticOrganization

```typescript
interface UseOptimisticOrganizationReturn {
  /** Current organization (may be optimistic) */
  organization: Organization | null;
  
  /** Whether current value is optimistic */
  isOptimistic: boolean;
  
  /** Switch organization with optimistic update */
  switchOrganization: (org: Organization) => Promise<void>;
  
  /** Rollback to previous organization */
  rollback: () => void;
}

function useOptimisticOrganization(): UseOptimisticOrganizationReturn;
```

### State Transitions

```
IDLE → SWITCHING → CONFIRMED
         ↓
       ERROR → IDLE (rollback)
```

## 3. Combined Query Contract

### Convex Query: getUserDashboardData

Replace multiple queries with single combined query:

```typescript
// packages/backend/convex/dashboard.ts
export const getUserDashboardData = query({
  args: {},
  returns: v.object({
    user: v.object({
      id: v.string(),
      name: v.string(),
      email: v.string(),
      image: v.optional(v.string()),
    }),
    activeOrganization: v.optional(v.object({
      id: v.string(),
      name: v.string(),
      slug: v.string(),
      logo: v.optional(v.string()),
      role: v.string(),
    })),
    organizations: v.array(v.object({
      id: v.string(),
      name: v.string(),
      slug: v.string(),
      logo: v.optional(v.string()),
    })),
  }),
  handler: async (ctx) => {
    // Implementation combines auth user, active org, and org list
  },
});
```

## 4. Prefetch Contract

### Interface: prefetchWorkspaceData

```typescript
interface PrefetchOptions {
  /** Workspace slug to prefetch */
  workspaceSlug: string;
  
  /** Priority level */
  priority?: 'high' | 'low';
}

function prefetchWorkspaceData(options: PrefetchOptions): void;
```

### Usage Pattern

```typescript
// On hover over workspace in switcher
<WorkspaceItem 
  onMouseEnter={() => prefetchWorkspaceData({ 
    workspaceSlug: org.slug,
    priority: 'low' 
  })}
/>
```

## 5. Cache Invalidation Events

### Event Contract

```typescript
type CacheInvalidationEvent = 
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_LOGIN'; userId: string }
  | { type: 'ORG_SWITCH'; orgId: string }
  | { type: 'ORG_CREATE'; org: Organization }
  | { type: 'ORG_UPDATE'; org: Organization }
  | { type: 'ORG_DELETE'; orgId: string };

function invalidateCache(event: CacheInvalidationEvent): void;
```

## 6. Error Response Contract

### Middleware Verification Errors

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | `MISSING_WORKSPACE` | Workspace parameter not provided |
| 401 | `NOT_AUTHENTICATED` | No valid session |
| 403 | `NO_ACCESS` | User not member of organization |
| 404 | `ORG_NOT_FOUND` | Organization doesn't exist |
| 500 | `INTERNAL_ERROR` | Server error |

### Error Response Format

```typescript
interface MiddlewareErrorResponse {
  valid: false;
  error: string;
  code: string;
  redirect?: string;
}
```

## Backward Compatibility

All new contracts are additive. Existing functionality is preserved:

- Middleware verification falls back to full check if cache miss
- Optimistic hook falls back to standard behavior on error
- Combined queries are optional optimizations, not replacements
