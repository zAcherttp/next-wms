import type { Doc } from "@wms/backend/convex/_generated/dataModel";
import type { authClient } from "./client";

export type Session = typeof authClient.$Infer.Session;
export type ActiveOrganization = typeof authClient.$Infer.ActiveOrganization;
export type Invitation = typeof authClient.$Infer.Invitation;
export type Organization = typeof authClient.$Infer.Organization;

export type NotificationItem = Doc<"notifications"> & {
  category: Doc<"system_lookups"> | null;
  priority: Doc<"system_lookups"> | null;
};
