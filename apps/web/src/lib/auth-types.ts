import type { auth } from "@next-wms/auth";
import type { authClient } from "./auth-client";

export type Session = typeof auth.$Infer.Session;
export type ActiveOrganization = typeof authClient.$Infer.ActiveOrganization;
export type Invitation = typeof authClient.$Infer.Invitation;
export type Organization = typeof authClient.$Infer.Organization;
