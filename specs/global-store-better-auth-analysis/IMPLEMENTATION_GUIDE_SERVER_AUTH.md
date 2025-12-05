# Implementation Guide: Server-Side Auth State Fetching

This guide complements `ANALYSIS_GLOBAL_STORE_FETCHING.md` with concrete, step-by-step implementation instructions.

---

## Phase 1: Foundation - Create Server Auth Fetch Function

### Step 1.1: Create `lib/auth-server.ts`

```typescript
// apps/web/src/lib/auth-server.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Server-side function to fetch complete auth state
 * Should be called from layout or server component
 * 
 * Fetches:
 * - Current user session
 * - User's organizations
 * - Active organization
 * - Current member role and permissions
 */
export async function fetchAuthState() {
  try {
    const headersList = await headers();
    
    // Fetch session from Better Auth
    const session = await auth.api.getSession({
      headers: headersList
    });
    
    // If not authenticated, return null
    if (!session) {
      return null;
    }
    
    // TODO: Fetch from Convex when queries are ready
    // For now, return session structure
    // const organizations = await convex.query(api.organizations.list, {});
    // const activeOrg = await convex.query(api.organizations.getActive, {});
    // const memberRole = await convex.query(api.members.getRole, { userId: session.user.id });
    
    return {
      authenticated: true,
      session,
      organizations: [], // TODO: Populate from Convex
      activeOrg: null,   // TODO: Populate from Convex
      memberRole: null   // TODO: Populate from Convex
    };
  } catch (error) {
    console.error("[Auth] Failed to fetch auth state:", error);
    return null;
  }
}

/**
 * Variant: Fetch auth state as server action (for refetches)
 * Usage: Can be called from client components via server action
 */
export async function refreshAuthState() {
  "use server";
  return fetchAuthState();
}
```

### Step 1.2: Update Root Layout

```typescript
// apps/web/src/app/layout.tsx
import { fetchAuthState } from "@/lib/auth-server";
import Providers from "@/components/providers/providers";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch auth state on the server before rendering
  const initialAuthState = await fetchAuthState();

  return (
    <html lang="en">
      <body>
        <Providers initialAuthState={initialAuthState}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Step 1.3: Update Providers Component

```typescript
// apps/web/src/components/providers/providers.tsx
"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ConvexClientProvider } from "@/components/providers/convex-client-providers";
import { GlobalStateProvider } from "@/components/providers/global-state-provider";
import { Toaster } from "../ui/sonner";
import { ThemeProvider } from "./theme-provider";

interface ProvidersProps {
  children: React.ReactNode;
  initialAuthState?: any; // TODO: Type this properly
}

export default function Providers({ 
  children,
  initialAuthState 
}: ProvidersProps) {
  return (
    <ConvexClientProvider>
      <GlobalStateProvider initialAuthState={initialAuthState}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <NuqsAdapter>{children}</NuqsAdapter>
          <Toaster richColors />
        </ThemeProvider>
      </GlobalStateProvider>
    </ConvexClientProvider>
  );
}
```

---

## Phase 2: Provider Refactor - Remove Hooks

### Step 2.1: Refactor GlobalStateProvider

```typescript
// apps/web/src/components/providers/global-state-provider.tsx
"use client";

import { useEffect } from "react";
import { useGlobalStore } from "@/stores/global-store";
import type { GlobalStore } from "@/stores/global-store";

interface GlobalStateProviderProps {
  children: React.ReactNode;
  initialAuthState?: {
    authenticated: boolean;
    session: any;
    organizations: any[];
    activeOrg: any;
    memberRole: any;
  };
}

/**
 * GlobalStateProvider - Simplified with server-side initialization
 * 
 * Before: Used 4 client-side hooks to fetch data
 * After: Receives pre-fetched data from server
 * 
 * Responsibilities:
 * 1. Initialize store with server-fetched data
 * 2. Set up real-time subscriptions (Phase 3)
 * 3. Handle auth state changes
 */
export function GlobalStateProvider({
  children,
  initialAuthState,
}: GlobalStateProviderProps) {
  const initialize = useGlobalStore((state) => state.initialize);
  const reset = useGlobalStore((state) => state.reset);

  // Single effect: Initialize store with pre-fetched auth state
  useEffect(() => {
    if (!initialAuthState || !initialAuthState.authenticated) {
      reset();
      return;
    }

    const { session, organizations, activeOrg, memberRole } = initialAuthState;

    // Convert Better Auth session to store format
    initialize({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
        emailVerified: session.user.emailVerified,
      },
      tenants: organizations.map((org: any) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo: org.logo ?? null,
        warehouses: [], // TODO: Fetch from Convex
      })),
      currentTenantId: activeOrg?.id ?? null,
      membership: memberRole
        ? {
            memberId: session.user.id,
            role: {
              id: memberRole.id,
              role: memberRole.role,
              permissions: memberRole.permissions ?? {},
            },
            joinedAt: new Date(),
          }
        : undefined,
    });
  }, [initialAuthState, initialize, reset]);

  return <>{children}</>;
}

/**
 * Optional: Loading guard component
 */
export function GlobalStateLoadingGuard({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  // Since data is pre-fetched, this component is now less necessary
  // But can still be useful for real-time subscription initialization
  return <>{children}</>;
}
```

### Step 2.2: Update Exports in `auth-client.ts`

```typescript
// apps/web/src/lib/auth-client.ts
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { emailOTPClient, organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";

export const authClient = createAuthClient({
  plugins: [
    convexClient(),
    organizationClient({
      dynamicAccessControl: {
        enabled: true,
      },
    }),
    emailOTPClient(),
  ],
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.error("Too many requests. Please try again later.");
      }
    },
  },
});

// ✅ Keep these for client-side UI updates (e.g., real-time user profile updates)
export const {
  signUp,
  signIn,
  signOut,
  useSession,        // Still available if needed
  organization,
  useListOrganizations,    // Still available if needed
  useActiveOrganization,   // Still available if needed
  useActiveMember,
  useActiveMemberRole,
} = authClient;

// ✅ Also export for one-time client-side fetches
export const {
  getSession,        // NEW: Client-side getSession promise
  // ... other one-time fetch methods
} = authClient;
```

---

## Phase 3: Real-Time Updates - Convex Subscriptions

### Step 3.1: Create Subscription Hook

```typescript
// apps/web/src/hooks/useAuthSubscriptions.ts
"use client";

import { useEffect } from "react";
import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { useGlobalStore } from "@/stores/global-store";
import { api } from "@/convex/_generated/api";

/**
 * Hook to set up real-time subscriptions for auth-related data
 * 
 * Should be called from a client component somewhere in the component tree
 * (e.g., after initial layout/provider chain)
 * 
 * Ensures that when data changes in Convex backend, the store is updated
 */
export function useAuthSubscriptions() {
  const setTenants = useGlobalStore((state) => state.setTenants);
  const setMembership = useGlobalStore((state) => state.setMembership);
  const user = useGlobalStore((state) => state.user);

  // Subscribe to user's organizations (real-time)
  const { data: organizations } = useQuery(
    convexQuery(api.organizations.list, {})
  );

  // Subscribe to active membership (real-time)
  const { data: activeMembership } = useQuery(
    convexQuery(api.members.getActive, {})
  );

  // Update store when organizations change
  useEffect(() => {
    if (organizations) {
      const tenants = organizations.map((org: any) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo: org.logo ?? null,
        warehouses: org.warehouses ?? [],
      }));
      setTenants(tenants);
    }
  }, [organizations, setTenants]);

  // Update store when membership changes
  useEffect(() => {
    if (activeMembership) {
      setMembership({
        memberId: user?.id ?? "",
        role: {
          id: activeMembership.roleId,
          role: activeMembership.role,
          permissions: activeMembership.permissions ?? {},
        },
        joinedAt: new Date(activeMembership.joinedAt),
      });
    }
  }, [activeMembership, setMembership, user?.id]);
}
```

### Step 3.2: Use Subscription Hook in Components

```typescript
// apps/web/src/app/(protected)/layout.tsx
"use client";

import { useAuthSubscriptions } from "@/hooks/useAuthSubscriptions";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize real-time subscriptions
  useAuthSubscriptions();

  return <>{children}</>;
}
```

---

## Phase 4: Refetch Strategy

### Step 4.1: Add Refetch Action

```typescript
// apps/web/src/lib/auth-server.ts (append)

/**
 * Server action to refresh auth state
 * Can be called from client components when needed
 */
export async function refreshAuthState() {
  "use server";
  
  const state = await fetchAuthState();
  
  if (!state) {
    return { success: false, error: "Not authenticated" };
  }
  
  return { success: true, state };
}
```

### Step 4.2: Create Refresh Hook

```typescript
// apps/web/src/hooks/useAuthRefresh.ts
"use client";

import { useCallback, useTransition } from "react";
import { refreshAuthState } from "@/lib/auth-server";
import { useGlobalStore } from "@/stores/global-store";

/**
 * Hook to refresh auth state from server
 * Useful after mutations that affect user data
 */
export function useAuthRefresh() {
  const [isPending, startTransition] = useTransition();
  const initialize = useGlobalStore((state) => state.initialize);

  const refresh = useCallback(() => {
    startTransition(async () => {
      const result = await refreshAuthState();
      if (result.success && result.state) {
        // Reinitialize store with fresh data
        initialize(result.state);
      }
    });
  }, [initialize]);

  return { refresh, isPending };
}
```

### Step 4.3: Usage Example

```typescript
// In a component after profile update
"use client";

import { useAuthRefresh } from "@/hooks/useAuthRefresh";

export function ProfileForm() {
  const { refresh, isPending } = useAuthRefresh();

  const handleSubmit = async (data: any) => {
    // Submit profile update
    await updateProfile(data);
    
    // Refresh auth state to reflect changes
    refresh();
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={isPending}>
        {isPending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

---

## Phase 5: Testing Checklist

### Unit Tests

- [ ] `fetchAuthState()` returns null when not authenticated
- [ ] `fetchAuthState()` returns correct session structure
- [ ] `fetchAuthState()` handles errors gracefully
- [ ] `refreshAuthState()` can be called as server action

### Integration Tests

- [ ] GlobalStateProvider initializes with `initialAuthState`
- [ ] Store is populated correctly from server data
- [ ] Real-time subscriptions update store on data change
- [ ] No re-render loops during initialization
- [ ] No race conditions with concurrent updates

### E2E Tests

- [ ] User can sign in → store populated → UI reflects data
- [ ] User can switch org → store updates → permissions applied
- [ ] Real-time org updates reflected in store → UI
- [ ] Refetch after mutation works correctly

### Performance Tests

- [ ] Initial page load time improved (before: ~3s, after: ~1.5s)
- [ ] Network requests reduced (before: 4 hooks, after: 1 layout fetch)
- [ ] Memory usage stable (no infinite subscriptions)

---

## Common Issues & Fixes

### Issue: TypeScript Errors on `initialAuthState`

**Solution:** Add proper types:

```typescript
interface InitialAuthState {
  authenticated: boolean;
  session: Session;
  organizations: Organization[];
  activeOrg: Organization | null;
  memberRole: MemberRole | null;
}

interface ProvidersProps {
  children: React.ReactNode;
  initialAuthState?: InitialAuthState;
}
```

### Issue: "Hydration Mismatch" Warning

**Solution:** Ensure server and client render the same thing:

```typescript
// ✅ Correct: Server data flows directly to client
export default async function RootLayout() {
  const authState = await fetchAuthState();
  return <Providers initialAuthState={authState}>{children}</Providers>;
}
```

### Issue: Store Not Updating on Real-Time Changes

**Solution:** Make sure subscription hook is called:

```typescript
// ✅ Must be in a client component, after provider
export default function ProtectedLayout({ children }) {
  useAuthSubscriptions(); // Call this!
  return <>{children}</>;
}
```

---

## Migration Verification Checklist

- [ ] Phase 1: `fetchAuthState()` created and working
- [ ] Phase 1: Root layout calling `fetchAuthState()`
- [ ] Phase 1: `initialAuthState` flowing to providers
- [ ] Phase 2: GlobalStateProvider removed all hooks
- [ ] Phase 2: Store initializing correctly from props
- [ ] Phase 3: Real-time subscription hook created
- [ ] Phase 3: Subscription hook updating store correctly
- [ ] Phase 4: Refresh action working
- [ ] Phase 4: Refresh hook available to components
- [ ] Phase 5: All tests passing
- [ ] Performance metrics improved

---

## Rollback Plan

If issues arise during implementation:

1. **Keep old `GlobalStateProvider` backed up** → Easy to switch back
2. **Feature flag the new code** → Can toggle between old/new
3. **Monitor error logs** → Catch issues early

```typescript
// Feature flag example
const USE_NEW_AUTH_STATE = process.env.NEXT_PUBLIC_NEW_AUTH_STATE === "true";

export function GlobalStateProvider(props) {
  if (USE_NEW_AUTH_STATE) {
    return <NewGlobalStateProvider {...props} />;
  }
  return <OldGlobalStateProvider {...props} />;
}
```

---

## References

- Better Auth Docs: <https://better-auth.com>
- Next.js Server Components: <https://nextjs.org/docs/getting-started/react-essentials#server-components>
- Convex Real-time: <https://docs.convex.dev/client/react/queries>
- TanStack Query: <https://tanstack.com/query/latest>

---

**Last Updated:** December 5, 2025  
**Status:** Ready for Implementation
