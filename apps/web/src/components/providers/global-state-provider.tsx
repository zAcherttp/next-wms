"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  useActiveMemberRole,
  useActiveOrganization,
  useListOrganizations,
  useSession,
} from "@/lib/auth-client";
import type {
  ActiveOrganization,
  Organization,
  Session,
} from "@/lib/auth-types";
import {
  selectRefetchCounter,
  selectStatus,
  useGlobalStore,
} from "@/stores/global-store";
import type {
  MemberRole,
  Membership,
  Tenant,
  User,
  Warehouse,
} from "@/stores/types";

// ============================================================================
// DATA MAPPING FUNCTIONS
// ============================================================================

/**
 * Map Better Auth session to store User type
 */
function mapSessionToUser(session: Session): User {
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
    emailVerified: session.user.emailVerified,
  };
}

/**
 * Map Better Auth organizations to store Tenant type
 * Note: Warehouses will be populated separately from Convex if needed
 */
function mapOrganizationsToTenants(organizations: Organization[]): Tenant[] {
  return organizations.map((org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    logo: org.logo ?? null,
    // Initial empty warehouses - will be populated from Convex subscription
    warehouses: [] as Warehouse[],
  }));
}

/**
 * Map Better Auth member role to store MemberRole type
 */
function mapMemberRole(
  role: string,
  permissions: Record<string, string[]> = {},
): MemberRole {
  return {
    id: "", // Role ID not directly available from Better Auth hooks
    role,
    permissions,
  };
}

/**
 * Create Membership from member role data
 */
function createMembership(
  memberId: string,
  memberRole: MemberRole,
  createdAt?: Date,
): Membership {
  return {
    memberId,
    role: memberRole,
    joinedAt: createdAt ?? new Date(),
  };
}

// ============================================================================
// GLOBAL STATE PROVIDER
// ============================================================================

interface GlobalStateProviderProps {
  children: React.ReactNode;
  /** Enable refetch on window focus (default: true in development) */
  refetchOnWindowFocus?: boolean;
}

/**
 * GlobalStateProvider - Single source of truth for Better Auth data
 *
 * This component:
 * 1. Calls all Better Auth hooks ONCE at the top level
 * 2. Maps the data to our store types
 * 3. Syncs to Zustand store via store.initialize()
 * 4. Watches for refetch triggers from store.requestRefetch()
 * 5. Optionally refetches on window focus
 * 6. All child components use the Zustand store instead of hooks
 */
export function GlobalStateProvider({
  children,
  refetchOnWindowFocus = process.env.NODE_ENV === "development",
}: GlobalStateProviderProps) {
  // -------------------------------------------------------------------------
  // BETTER AUTH HOOKS (called ONCE here)
  // -------------------------------------------------------------------------
  const {
    data: session,
    isPending: sessionLoading,
    error: sessionError,
    refetch: refetchSession,
  } = useSession();
  const {
    data: organizations,
    isPending: orgsLoading,
    error: orgsError,
    refetch: refetchOrgs,
  } = useListOrganizations();
  const {
    data: activeOrg,
    isPending: activeOrgLoading,
    error: activeOrgError,
    refetch: refetchActiveOrg,
  } = useActiveOrganization();
  const {
    data: memberRole,
    isPending: memberRoleLoading,
    error: memberRoleError,
    refetch: refetchMemberRole,
  } = useActiveMemberRole();

  // -------------------------------------------------------------------------
  // STORE ACTIONS
  // -------------------------------------------------------------------------
  const initialize = useGlobalStore((state) => state.initialize);
  const reset = useGlobalStore((state) => state.reset);
  const _setStatus = useGlobalStore((state) => state._setStatus);
  const _acknowledgeRefetch = useGlobalStore(
    (state) => state._acknowledgeRefetch,
  );
  const refetchCounter = useGlobalStore(selectRefetchCounter);

  // Track last processed refetch counter
  const lastRefetchCounterRef = useRef(0);

  // -------------------------------------------------------------------------
  // REFETCH FUNCTION
  // -------------------------------------------------------------------------
  const refetchAll = useCallback(async () => {
    _setStatus("loading");
    await Promise.all([
      refetchSession(),
      refetchOrgs(),
      refetchActiveOrg(),
      refetchMemberRole(),
    ]);
    _acknowledgeRefetch();
  }, [
    refetchSession,
    refetchOrgs,
    refetchActiveOrg,
    refetchMemberRole,
    _setStatus,
    _acknowledgeRefetch,
  ]);

  // -------------------------------------------------------------------------
  // COMPUTED STATE
  // -------------------------------------------------------------------------
  const isLoading =
    sessionLoading || orgsLoading || activeOrgLoading || memberRoleLoading;
  const hasError =
    sessionError || orgsError || activeOrgError || memberRoleError;
  const isAuthenticated = !!session?.user;

  // -------------------------------------------------------------------------
  // REFETCH TRIGGER EFFECT - Watch for store.requestRefetch()
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (refetchCounter > lastRefetchCounterRef.current) {
      lastRefetchCounterRef.current = refetchCounter;
      refetchAll();
    }
  }, [refetchCounter, refetchAll]);

  // -------------------------------------------------------------------------
  // WINDOW FOCUS REFETCH EFFECT
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      // Only refetch if authenticated and not already loading
      if (isAuthenticated && !isLoading) {
        refetchAll();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refetchOnWindowFocus, isAuthenticated, isLoading, refetchAll]);

  // -------------------------------------------------------------------------
  // SYNC EFFECT - Initialize store when all data is ready
  // -------------------------------------------------------------------------
  useEffect(() => {
    // Handle errors
    if (hasError) {
      const errorMessage =
        sessionError?.message ||
        orgsError?.message ||
        activeOrgError?.message ||
        memberRoleError?.message ||
        "Failed to load auth state";
      _setStatus("error", errorMessage);
      return;
    }

    // If loading, set status (only if not already loading)
    if (isLoading) {
      return;
    }

    // Not authenticated - reset store
    if (!isAuthenticated) {
      reset();
      return;
    }

    // All data ready - initialize store
    if (session) {
      const user = mapSessionToUser(session);
      const tenants = organizations
        ? mapOrganizationsToTenants(organizations)
        : [];

      // Build membership if we have active org and member role
      let membership: Membership | undefined;
      if (activeOrg && memberRole) {
        // Get permissions and member ID from active org's member data
        // Better Auth stores this on the organization response
        type ActiveOrgWithMember = ActiveOrganization & {
          activeMember?: {
            id?: string;
            permissions?: Record<string, string[]>;
          };
        };

        const activeMember = (activeOrg as ActiveOrgWithMember)?.activeMember;
        const permissions = activeMember?.permissions ?? {};
        const memberId = activeMember?.id ?? session.user.id; // Fallback to user ID

        const role = mapMemberRole(memberRole.role, permissions);
        membership = createMembership(
          memberId,
          role,
          activeOrg.createdAt ? new Date(activeOrg.createdAt) : undefined,
        );
      }

      initialize({
        user,
        tenants,
        currentTenantId: activeOrg?.id,
        membership,
      });
    }
  }, [
    isLoading,
    hasError,
    isAuthenticated,
    session,
    organizations,
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

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  return <>{children}</>;
}

// ============================================================================
// LOADING STATE COMPONENT (optional use)
// ============================================================================

interface GlobalStateLoadingGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Optional guard component to show loading state while store initializes
 */
export function GlobalStateLoadingGuard({
  children,
  fallback,
}: GlobalStateLoadingGuardProps) {
  const status = useGlobalStore(selectStatus);

  if (status === "loading" || status === "idle") {
    return fallback ?? null;
  }

  return <>{children}</>;
}

// ============================================================================
// HOOKS FOR ACCESSING GLOBAL STATE (convenience wrappers)
// ============================================================================

/**
 * Hook to check if the global state is ready
 */
export function useGlobalStateReady(): boolean {
  const status = useGlobalStore(selectStatus);
  return status === "ready";
}

/**
 * Hook to get the current auth error (if any)
 */
export function useGlobalStateError(): string | null {
  return useGlobalStore((state) => state.error);
}
