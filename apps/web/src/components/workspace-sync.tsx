"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useOptimisticOrganization } from "@/hooks/use-optimistic-organization";
import { useListOrganizations } from "@/lib/auth-client";

/**
 * Syncs the active organization based on the current workspace URL.
 * Handles all navigation scenarios: team switcher, join, create org, direct URL, browser controls.
 *
 * Uses optimistic updates for instant UI feedback when switching workspaces.
 */
export function WorkspaceSync() {
  const params = useParams();
  const workspace = params.workspace as string;
  const { data: organizations, isPending: orgsLoading } =
    useListOrganizations();
  const {
    organization: activeOrganization,
    switchOrganization,
    isSwitching,
  } = useOptimisticOrganization();

  const lastWorkspace = useRef<string | null>(null);

  useEffect(() => {
    // Wait for organizations to load
    if (orgsLoading || !organizations || !workspace) return;

    // Don't sync while a switch is in progress
    if (isSwitching) return;

    const org = organizations.find(
      (o: { slug: string }) => o.slug === workspace,
    );

    // If workspace org doesn't exist, do nothing (proxy should handle this)
    if (!org) return;

    // Check if we need to sync
    const needsSync = !activeOrganization || activeOrganization.id !== org.id;
    const workspaceChanged = lastWorkspace.current !== workspace;

    // Only sync if needed
    if (needsSync && workspaceChanged) {
      lastWorkspace.current = workspace;

      // Use optimistic switch - provides instant UI feedback
      switchOrganization(org);
    }
  }, [
    workspace,
    organizations,
    activeOrganization,
    orgsLoading,
    isSwitching,
    switchOrganization,
  ]);

  return null;
}
