# Global Store Data Fetching Analysis

**Date:** December 5, 2025  
**Status:** Active Investigation  
**Focus:** Why the global store isn't actively fetching data and architectural improvements

---

## Executive Summary

The current `GlobalStateProvider` uses **client-side Better Auth hooks** (`useSession`, `useListOrganizations`, `useActiveOrganization`, `useActiveMemberRole`) to populate the Zustand store. This approach has several architectural and performance issues that prevent consistent data fetching and updates.

**Recommended Solution:** Migrate to **server-side data fetching** using `auth.api.getSession()` and dedicated server functions instead of client-side hooks.

---

## Part 1: Root Cause Analysis

### Current Architecture Issues

#### 1.1 Hook-Based Fetching Problems

**Current Pattern (GlobalStateProvider):**

```typescript
// ❌ PROBLEMATIC: Using hooks in a provider component
const { data: session, isPending: sessionLoading, error: sessionError, refetch: refetchSession } = useSession();
const { data: organizations, isPending: orgsLoading, error: orgsError, refetch: refetchOrgs } = useListOrganizations();
const { data: activeOrg, isPending: activeOrgLoading, error: activeOrgError, refetch: refetchActiveOrg } = useActiveOrganization();
const { data: memberRole, isPending: memberRoleLoading, error: memberRoleError, refetch: refetchMemberRole } = useActiveMemberRole();
```

**Issues:**

1. **Multiple Independent Requests:** Each hook makes a separate API call, not coordinated
2. **Race Conditions:** Data can be misaligned (session loads before orgs, causing state inconsistency)
3. **Refetch Coordination:** Manual `refetch()` calls don't guarantee data consistency across all fields
4. **Re-render Loops:** Each hook update triggers component re-render → effect runs again → potential infinite loops (which we already experienced)
5. **No Batching:** Can't batch multiple organization/membership fetches into a single request
6. **Hook Rules Violation:** Hooks inside conditional logic or complex effect dependencies cause unpredictable behavior

#### 1.2 Store Synchronization Problems

**Current Pattern (GlobalStateProvider):**

```typescript
useEffect(() => {
  // If loading, set status (only if not already loading)
  if (isLoading) {
    return;  // ← Just waits, doesn't actively fetch
  }
  
  // Not authenticated - reset store
  if (!isAuthenticated) {
    reset();
    return;
  }
  
  // All data ready - initialize store
  if (session) {
    initialize({ ... });
  }
}, [isLoading, hasError, isAuthenticated, session, organizations, activeOrg, memberRole, ...]);
```

**Issues:**

1. **Passive Waiting:** Provider waits for hook data instead of requesting it
2. **Dependency Array Hell:** Large dependency array → effect runs on any data change → potential re-runs
3. **State Machine Confusion:** Multiple conditions without clear state flow make debugging hard
4. **No Active Fetching:** Provider doesn't trigger fetches, just responds to hook updates

#### 1.3 Hook Hook Limitations

| Limitation | Impact | Example |
|-----------|--------|---------|
| **No Batching** | 4 separate network requests | Each organization data requires separate API call |
| **Limited Customization** | Can't combine data fetching | Can't fetch user + orgs + roles in one query |
| **React Dependency** | Must call from components | Can't use in server actions or middleware |
| **Timing Issues** | Hooks execute on render | Stale data during initial render |
| **Manual Refetch** | Must explicitly trigger | Can't auto-sync when mutations happen |

---

## Part 2: Server-Side Fetching Investigation

### 2.1 Better Auth Server API

**Key Discovery:** Better Auth provides `auth.api.getSession()` for server-side usage

```typescript
import { auth } from "@/lib/auth"; // Server instance
import { headers } from "next/headers";

// ✅ Server-side session fetching (NO hooks needed)
const session = await auth.api.getSession({
  headers: await headers()
});
```

**Advantages Over Hooks:**

- ✅ Can be called from Server Components, Server Actions, API routes
- ✅ No component re-renders
- ✅ Can be coordinated and batched
- ✅ Works with Next.js middleware
- ✅ Supports custom caching strategies

### 2.2 Server-Side Data Fetching Patterns

#### Pattern A: Server Component with Direct Fetch

```typescript
// ✅ Fetch directly in server component
export async function RootLayout() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  const organizations = session 
    ? await convex.query(api.organizations.list, {})
    : [];
    
  return (
    <Providers initialData={{ session, organizations }}>
      {children}
    </Providers>
  );
}
```

**Benefits:**

- Data fetched before rendering
- No loading state needed in provider
- One consolidated data source

#### Pattern B: Server Action

```typescript
"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function fetchAuthState() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) return null;
  
  // Batch fetch related data
  const [organizations, memberRole] = await Promise.all([
    convex.query(api.organizations.list, {}),
    convex.query(api.members.getRole, { userId: session.user.id })
  ]);
  
  return { session, organizations, memberRole };
}
```

**Benefits:**

- Declarative data requirements
- Batched fetching
- Easy to test and refactor

#### Pattern C: API Route

```typescript
// apps/web/src/app/api/auth/session/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Build enriched auth state
  const organizations = await convex.query(api.organizations.list, {});
  
  return Response.json({
    session,
    organizations,
    authenticated: true
  });
}
```

**Benefits:**

- Centralized auth state endpoint
- Client can fetch on demand
- Works with or without providers

### 2.3 Middleware-Based Pre-Fetching

```typescript
// middleware.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  // Attach to request for use in components
  const requestHeaders = new Headers(request.headers);
  if (session) {
    requestHeaders.set("x-user-id", session.user.id);
  }
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
```

**Benefits:**

- Pre-validates authentication before component load
- Can redirect unauthenticated users
- Centralizes auth logic

---

## Part 3: Why Global Store Isn't Actively Fetching

### 3.1 Root Causes

1. **Hook Dependency Pattern**
   - Provider waits for hooks to fetch, rather than requesting data
   - Hooks run on component mount, but timing is unpredictable
   - If session hook is slow, entire provider initialization is delayed

2. **No Active Request Triggering**
   - Provider only reacts to hook changes
   - If a hook fails silently, provider doesn't know to retry
   - No polling or active refresh mechanism

3. **Refetch Coordination Failure**
   - `refetchCounter` in store increments, but...
   - Calling `refetch()` on 4 different hooks doesn't guarantee they all complete
   - Can leave store in inconsistent state (session fresh, orgs stale)

4. **Effect Dependency Complexity**
   - Original effect had `status` in dependencies (infinite loop)
   - Current effect has 18+ dependencies
   - Any change to any dependency reruns entire effect
   - Makes it hard to identify which data actually triggered update

5. **Race Conditions in Initialization**
   - Hook data arrives at different times
   - Effect tries to combine data that hasn't all arrived
   - Store might initialize with incomplete data

### 3.2 Evidence of the Problem

```typescript
// From global-state-provider.tsx
useEffect(() => {
  // Problem: This waits but doesn't actively fetch
  if (isLoading) {
    return;  // ← Just returns, hoping data arrives
  }
  
  // Problem: If any condition is false, nothing happens
  if (!isAuthenticated && !isLoading) {
    reset();
    return;
  }
  
  // Problem: initialize only if ALL conditions met
  if (session) {
    // ...but what if session exists but orgs hasn't loaded yet?
    initialize({ ... });
  }
}, [
  isLoading,           // ← Many dependencies
  hasError,            // ← Any change reruns effect
  isAuthenticated,
  session,
  organizations,       // ← Stale data issue: hook might not refetch when org updates
  activeOrg,
  memberRole,
  initialize,
  reset,
  _setStatus,
  sessionError,
  orgsError,
  activeOrgError,
  memberRoleError,
]);
```

---

## Part 4: Recommended Solution Architecture

### 4.1 New Architecture Overview

```
┌─────────────────────────────────────────────┐
│         Root Layout (Server Component)      │
├─────────────────────────────────────────────┤
│  1. Fetch session: auth.api.getSession()    │
│  2. Fetch orgs: convex query                │
│  3. Pass initialData to Providers           │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│     Providers (With Initial State)          │
├─────────────────────────────────────────────┤
│  1. ConvexClientProvider                    │
│  2. GlobalStateProvider (initializes store) │
│  3. Others (Theme, etc.)                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│     Zustand Global Store                    │
├─────────────────────────────────────────────┤
│  - Pre-initialized from server              │
│  - No hooks needed                          │
│  - Real-time updates via Convex reactions   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│     Components                              │
├─────────────────────────────────────────────┤
│  - Read from Zustand store only             │
│  - Subscribe to state changes               │
│  - No auth hooks needed                     │
└─────────────────────────────────────────────┘
```

### 4.2 Migration Steps

#### Step 1: Create Server Fetch Function

```typescript
// lib/auth-server.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function fetchAuthState() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session) {
      return null;
    }
    
    // Batch fetch related data
    const [organizations, activeOrg, memberRole] = await Promise.all([
      // convex.query(api.organizations.list, {}),
      // convex.query(api.organizations.getActive, {}),
      // convex.query(api.members.getRole, { userId: session.user.id })
    ]);
    
    return {
      session,
      organizations,
      activeOrg,
      memberRole
    };
  } catch (error) {
    console.error("Failed to fetch auth state:", error);
    return null;
  }
}
```

#### Step 2: Update Root Layout

```typescript
// app/layout.tsx
import { fetchAuthState } from "@/lib/auth-server";

export default async function RootLayout() {
  const authState = await fetchAuthState();
  
  return (
    <html>
      <body>
        <Providers initialAuthState={authState}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

#### Step 3: Update GlobalStateProvider

```typescript
// Remove all hooks!
// No useSession(), useListOrganizations(), etc.

export function GlobalStateProvider({
  children,
  initialAuthState
}: GlobalStateProviderProps) {
  const initialize = useGlobalStore(state => state.initialize);
  
  // Single effect: just initialize with pre-fetched data
  useEffect(() => {
    if (initialAuthState) {
      initialize(initialAuthState);
    }
  }, [initialAuthState, initialize]);
  
  return <>{children}</>;
}
```

### 4.3 Benefits of New Architecture

| Aspect | Before | After |
|--------|--------|-------|
| **Data Fetching** | 4 parallel hooks | 1 coordinated server call |
| **Network Requests** | 4 HTTP requests | 1 HTTP request + parallel queries |
| **State Consistency** | Race conditions | All data fetched together |
| **Provider Complexity** | 18+ effect dependencies | 1 simple effect |
| **Re-render Behavior** | Multiple re-renders | Single initialization |
| **Refetch Logic** | Manual coordination | Can use server actions |
| **Real-time Updates** | Hook-based | Convex reactions |

---

## Part 5: Implementation Roadmap

### Phase 1: Foundation (2-3 hours)

- [ ] Create `lib/auth-server.ts` with `fetchAuthState()`
- [ ] Add initial auth state to root layout
- [ ] Pass as prop to Providers

### Phase 2: Provider Refactor (2-3 hours)

- [ ] Remove all Better Auth hooks from GlobalStateProvider
- [ ] Simplify effect logic to just initialize store
- [ ] Test initialization flow

### Phase 3: Real-time Updates (3-4 hours)

- [ ] Set up Convex subscriptions for user data
- [ ] Set up Convex subscriptions for org data
- [ ] Set up Convex subscriptions for member role data
- [ ] Wire subscriptions to store mutations

### Phase 4: Refetch Strategy (2-3 hours)

- [ ] Implement server action for authenticated refetch
- [ ] Add manual refetch triggers from UI
- [ ] Implement background sync on window focus

### Phase 5: Testing & Cleanup (2-3 hours)

- [ ] Remove unused hooks
- [ ] Update auth client exports
- [ ] Test end-to-end auth flow
- [ ] Performance testing

---

## Part 6: Convex Integration Strategy

### 6.1 Real-Time Data Sync

Instead of polling, use Convex subscriptions:

```typescript
// hooks/useAuthSubscriptions.ts
import { useEffect } from "react";
import { useConvex } from "convex/react";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useGlobalStore } from "@/stores/global-store";
import { api } from "@/convex/_generated/api";

export function useAuthSubscriptions() {
  const convex = useConvex();
  const setTenants = useGlobalStore(state => state.setTenants);
  const setMembership = useGlobalStore(state => state.setMembership);
  
  // Subscribe to user's organizations
  const { data: organizations } = useQuery(
    convexQuery(api.organizations.list, {})
  );
  
  // Subscribe to active membership
  const { data: activeMembership } = useQuery(
    convexQuery(api.members.getActive, {})
  );
  
  // Update store when data changes
  useEffect(() => {
    if (organizations) {
      setTenants(organizations);
    }
  }, [organizations, setTenants]);
  
  useEffect(() => {
    if (activeMembership) {
      setMembership(activeMembership);
    }
  }, [activeMembership, setMembership]);
}
```

### 6.2 Usage in Components

```typescript
// In a client component within the provider tree
"use client";

import { useAuthSubscriptions } from "@/hooks/useAuthSubscriptions";
import { useGlobalStore } from "@/stores/global-store";

export function Dashboard() {
  // Ensures real-time subscriptions are active
  useAuthSubscriptions();
  
  // Read from store
  const user = useGlobalStore(state => state.user);
  const tenants = useGlobalStore(state => state.tenants);
  
  return (
    <div>
      <h1>Welcome {user?.name}</h1>
      <p>Organizations: {tenants.length}</p>
    </div>
  );
}
```

---

## Part 7: Potential Issues & Mitigations

### Issue 1: Authentication Not Ready on Layout Load

**Problem:** `fetchAuthState()` might complete before session cookie is set (e.g., right after sign up)

**Mitigation:**

- Wait for session cookie in middleware before routing
- Or use `expectAuth: true` in Convex client config (already done)

### Issue 2: Data Stale After Mutations

**Problem:** Store initializes once, but org data changes after initialization

**Mitigation:**

- Use Convex subscriptions for real-time updates (solved by Phase 3)
- Or invalidate store queries after mutations via TanStack Query

### Issue 3: Circular Dependencies

**Problem:** GlobalStateProvider needs auth data, but auth data requires Convex client

**Solution:**

- Convex client is in ConvexClientProvider (already higher in tree)
- GlobalStateProvider sits under ConvexClientProvider
- Can safely use Convex queries in GlobalStateProvider hooks

### Issue 4: Loading State During Page Transitions

**Problem:** If user navigates away, data fetch might not complete

**Mitigation:**

- Use React 19+ `useTransition` for navigation
- Or store loading state separately from data

---

## Part 8: Testing Strategy

### Unit Tests

```typescript
// __tests__/auth-server.test.ts
describe("fetchAuthState", () => {
  it("should return null when not authenticated", async () => {
    // Mock headers to return no session
  });
  
  it("should batch fetch related data", async () => {
    // Verify all queries called in parallel
  });
  
  it("should handle fetch errors gracefully", async () => {
    // Verify error handling
  });
});
```

### Integration Tests

```typescript
// __tests__/global-state-provider.integration.test.ts
describe("GlobalStateProvider", () => {
  it("should initialize store with pre-fetched auth state", () => {
    // Verify store has correct initial data
  });
  
  it("should subscribe to real-time org updates", () => {
    // Verify store updates when org data changes
  });
});
```

### E2E Tests

- Sign up → verify org created → verify store updated
- Switch org → verify store updated → verify permissions applied
- Edit profile → verify store updated → verify UI reflects changes

---

## Part 9: Success Metrics

After implementing this solution, we should see:

1. **Performance**
   - ✅ Page load time decreased (fewer hooks, less re-rendering)
   - ✅ TLS/SSL handshake reduced (fewer network requests)
   - ✅ Network waterfall improved (parallel Convex queries)

2. **Stability**
   - ✅ No infinite re-render loops
   - ✅ Consistent store state across components
   - ✅ No race conditions in initialization

3. **Maintainability**
   - ✅ GlobalStateProvider has <50 lines of code
   - ✅ Clear data flow from server → provider → store → components
   - ✅ Easy to add new data fields

4. **User Experience**
   - ✅ Faster initial page load (no hooks on mount)
   - ✅ Real-time org/permission updates (Convex subscriptions)
   - ✅ Smoother navigation (no state re-fetch jank)

---

## Part 10: Quick Reference

### Key API Methods

| Method | Location | Use Case |
|--------|----------|----------|
| `auth.api.getSession()` | Server | Fetch session + headers |
| `authClient.getSession()` | Client | One-time client fetch |
| `useSession()` | Client Component | Real-time session in UI |
| `convex.query()` | Server/Client | Query Convex data |
| `useQuery(convexQuery())` | Client | Subscribe to Convex data |

### File Changes Required

```
apps/web/src/
├── lib/
│   ├── auth-server.ts              [NEW] Server fetch function
│   └── auth-client.ts              [MODIFY] Remove unused exports
├── app/
│   ├── layout.tsx                  [MODIFY] Call fetchAuthState()
│   └── api/
│       └── auth/
│           └── session/route.ts    [OPTIONAL] Central auth endpoint
├── components/
│   └── providers/
│       ├── global-state-provider.tsx [MODIFY] Remove all hooks
│       └── providers.tsx           [NO CHANGE]
└── hooks/
    └── useAuthSubscriptions.ts     [NEW] Real-time sync hook
```

---

## Conclusion

The current global store isn't actively fetching data because it relies on **passive client-side hooks** that don't guarantee coordination or consistency. By migrating to **server-side fetching** with Better Auth's `auth.api.getSession()` and **real-time Convex subscriptions**, we can achieve:

- ✅ **Faster initial load** (pre-fetched data)
- ✅ **Better consistency** (atomic fetching)
- ✅ **Real-time updates** (Convex reactions)
- ✅ **Simpler code** (no hook complexity)
- ✅ **No infinite loops** (clearer effect logic)

This represents a fundamental architectural improvement from a **hook-based polling model** to a **server-first with real-time sync model**.

---

**Next Steps:** Review this analysis with the team and prioritize the implementation roadmap for Phase 1 (Foundation).
