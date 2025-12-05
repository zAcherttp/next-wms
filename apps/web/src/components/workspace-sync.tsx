"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useOptimisticOrganization } from "@/hooks/use-optimistic-organization";
import { useOrganizations } from "@/lib/auth-queries";

/**
 * Syncs the active organization based on the current workspace URL.
 * Handles all navigation scenarios: team switcher, join, create org, direct URL, browser controls.
 *
 * Uses optimistic updates for instant UI feedback when switching workspaces.
 */
export function WorkspaceSync() {
  const params = useParams();
  const workspace = params.workspace as string;

  // Use React Query hooks instead of Zustand store
  const { data: organizations, isPending: orgsLoading } = useOrganizations();
  const tenants = organizations ?? [];

  const {
    organization: activeOrganization,
    switchOrganization,
    isSwitching,
  } = useOptimisticOrganization();

  const lastWorkspace = useRef<string | null>(null);

  useEffect(() => {
    // Wait for organizations to load
    if (orgsLoading || tenants.length === 0 || !workspace) return;

    // Don't sync while a switch is in progress
    if (isSwitching) return;

    const org = tenants.find((t) => t.slug === workspace);

    // If workspace org doesn't exist, do nothing (proxy should handle this)
    if (!org) return;

    // Check if we need to sync
    const needsSync = !activeOrganization || activeOrganization.id !== org.id;
    const workspaceChanged = lastWorkspace.current !== workspace;

    // Only sync if needed
    if (needsSync && workspaceChanged) {
      lastWorkspace.current = workspace;

      // Use optimistic switch - provides instant UI feedback
      // Convert Tenant to the expected Organization format
      switchOrganization({
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo: org.logo ?? null,
        createdAt: new Date(), // Placeholder - not used for switching
        metadata: null,
      });
    }
  }, [
    workspace,
    tenants,
    activeOrganization,
    orgsLoading,
    isSwitching,
    switchOrganization,
  ]);

  return null;
}
