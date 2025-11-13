"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import {
  organization,
  useActiveOrganization,
  useListOrganizations,
} from "@/lib/auth-client";

/**
 * Client component that syncs the active organization based on the current workspace slug
 */
export function WorkspaceSync() {
  const params = useParams();
  const workspace = params.workspace as string;
  const { data: organizations } = useListOrganizations();
  const { data: activeOrganization } = useActiveOrganization();

  useEffect(() => {
    if (!organizations || !workspace) return;

    const org = organizations.find((o) => o.slug === workspace);

    // If workspace org is different from active org, set it as active
    if (org && activeOrganization?.id !== org.id) {
      organization.setActive({ organizationId: org.id });
    }
  }, [workspace, organizations, activeOrganization]);

  return null;
}
