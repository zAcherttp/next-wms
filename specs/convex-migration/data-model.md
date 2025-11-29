# Data Model: Convex API Call Optimization

**Date**: 2025-11-30  
**Feature**: Convex API Call Optimization  
**Status**: Draft

## Overview

This optimization feature does not introduce new data models or schema changes. It focuses on optimizing how existing data is fetched, cached, and shared across the application.

## Existing Data Models (Reference)

### Better Auth Models (via @convex-dev/better-auth)

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `user` | User accounts | `id`, `email`, `name`, `emailVerified`, `image` |
| `session` | Active sessions | `id`, `userId`, `token`, `expiresAt` |
| `organization` | Workspaces | `id`, `name`, `slug`, `logo`, `createdAt` |
| `member` | Org membership | `id`, `userId`, `organizationId`, `role` |

### Application Models

Currently empty schema (`defineSchema({})`). No custom models defined.

## Client-Side State Structure

### Current State Shape

```typescript
// Session (Better Auth)
interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
    emailVerified: boolean;
  };
  session: {
    id: string;
    token: string;
    expiresAt: Date;
  };
}

// Organization (Better Auth)
interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  createdAt: Date;
}

// Active Organization (Better Auth)
interface ActiveOrganization extends Organization {
  members: Member[];
}

// Member (Better Auth)
interface Member {
  id: string;
  userId: string;
  role: string;
  organizationId: string;
}
```

### Proposed Cache State

```typescript
// Middleware Cache (Cookie-based)
interface MiddlewareCache {
  userId: string;
  workspaceSlug: string;
  orgId: string;
  validUntil: number; // Unix timestamp
}

// Optimistic State (Client Memory)
interface OptimisticOrgState {
  pendingSwitch: Organization | null;
  previousOrg: Organization | null;
  isOptimistic: boolean;
}
```

## Data Flow Optimization

### Before (Current Flow)

```
Component A                Component B                Component C
     |                          |                          |
     v                          v                          v
useSession() ------>    useSession() ------>     useSession()
     |                          |                          |
     v                          v                          v
Better Auth API         Better Auth API          Better Auth API
```

### After (Optimized Flow)

```
                    ConvexBetterAuthProvider
                             |
                    [Shared Query Client]
                             |
         +-------------------+-------------------+
         |                   |                   |
Component A            Component B         Component C
     |                      |                    |
     v                      v                    v
useSession()          useSession()        useSession()
     |                      |                    |
     +----------------------+--------------------+
                            |
                    [Single Cache Hit]
```

## Cache Invalidation Rules

| Event | Invalidation Action |
|-------|---------------------|
| User login | Clear all auth caches |
| User logout | Clear all auth caches |
| Organization switch | Invalidate active org cache |
| Organization create | Invalidate org list cache |
| Organization update | Invalidate specific org + list cache |
| Middleware cache expiry | Re-fetch on next request |

## Middleware Cache Strategy

### Cache Key Format

```
wms_mw_cache_{workspaceSlug}
```

### Cache Value (Base64 JSON)

```json
{
  "uid": "user_abc123",
  "oid": "org_xyz789",
  "exp": 1701388800
}
```

### Cache Duration

- **Default TTL**: 60 seconds
- **On Error**: No cache (immediate re-verification)
- **On Logout**: Clear all middleware caches

## State Relationships

```
┌─────────────────────────────────────────────────────┐
│                  Application State                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐     ┌──────────────────────┐      │
│  │   Session   │────>│  Active Organization │      │
│  │   (User)    │     │                      │      │
│  └─────────────┘     └──────────────────────┘      │
│        │                      │                    │
│        │                      │                    │
│        v                      v                    │
│  ┌─────────────┐     ┌──────────────────────┐      │
│  │Organizations│────>│      Members         │      │
│  │   (List)    │     │    (Per Org)         │      │
│  └─────────────┘     └──────────────────────┘      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## No Schema Migrations Required

This optimization does not require any database schema changes. All optimizations are at the client-side caching and data-fetching layer.
