/**
 * Custom hook to get the current user's Convex data
 *
 * This hook bridges the gap between Better Auth session (which has authId)
 * and Convex user data (which has the Convex document ID and organizationId)
 */

import { convexQuery } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "@wms/backend/convex/_generated/api";
import { useSession } from "@/lib/auth/client";

export function useCurrentUser() {
  const { data: session, isPending: isSessionPending } = useSession();
  const authId = session?.user?.id;

  // Query Convex for the user document using authId
  const {
    data: convexUser,
    isPending: isUserPending,
    error,
  } = useQuery({
    ...convexQuery(api.authSync.getUserByAuthId, {
      authId: authId ?? "",
    }),
    enabled: !!authId,
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
  });

  return {
    // Session data (from Better Auth)
    session,
    authId,

    // Convex user data
    user: convexUser,
    userId: convexUser?._id,
    organizationId: convexUser?.organizationId,

    // Loading states
    isPending: isSessionPending || isUserPending,
    isSessionPending,
    isUserPending,

    // Error state
    error,

    // Convenience flags
    isAuthenticated: !!session?.user,
    hasOrganization: !!convexUser?.organizationId,
  };
}
