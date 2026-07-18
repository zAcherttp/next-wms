import { type Auth as BetterAuthInstance, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { emailOTP, openAPI, organization } from "better-auth/plugins";
import { ConvexHttpClient } from "convex/browser";
import { eq } from "drizzle-orm";
import { api } from "../convex/_generated/api";
import { ac, admin, member, owner } from "../lib/permissions";
import { db } from "./db";
import {
  sendOrganizationInvitationDirect,
  sendOTPVerificationDirect,
} from "./email/resend";
import * as schema from "./schema";

// Initialize Convex client for syncing auth data
const convexUrl = process.env.CONVEX_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  console.warn("[Auth] CONVEX_URL not set - auth data will not sync to Convex");
}
const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null;

type DBHookUser = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined;
};

type DBHookSession = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  activeOrganizationId?: string | null;
};

// Get site URL from environment
const siteUrl = process.env.SITE_URL || "";

const READ_ONLY_ORGANIZATION_PATHS = new Set([
  "/organization/check-slug",
  "/organization/get-active-member",
  "/organization/get-active-member-role",
  "/organization/get-full-organization",
  "/organization/get-invitation",
  "/organization/get-role",
  "/organization/has-permission",
  "/organization/list",
  "/organization/list-members",
  "/organization/list-roles",
  "/organization/list-user-invitations",
  "/organization/set-active",
]);

const IMMUTABLE_ACCOUNT_PATH_PREFIXES = [
  "/change-email",
  "/change-password",
  "/delete-user",
  "/email-otp",
  "/link-social",
  "/request-password-reset",
  "/reset-password",
  "/send-verification-email",
  "/set-password",
  "/sign-up",
  "/unlink-account",
  "/update-user",
  "/verify-email",
];

const demoAuthReadOnlyGuard = createAuthMiddleware(async (ctx) => {
  const isBlockedOrganizationMutation =
    ctx.path.startsWith("/organization/") &&
    !READ_ONLY_ORGANIZATION_PATHS.has(ctx.path);
  const isBlockedAccountMutation = IMMUTABLE_ACCOUNT_PATH_PREFIXES.some(
    (path) => ctx.path.startsWith(path),
  );

  if (isBlockedOrganizationMutation || isBlockedAccountMutation) {
    throw new APIError("FORBIDDEN", {
      message: "Demo identities and access roles are read-only.",
    });
  }
});

const authConfig = {
  baseURL: siteUrl,
  trustedOrigins: [siteUrl],

  // Use Drizzle adapter with Neon PostgreSQL
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),

  // Email + Password authentication
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: true,
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  // Plugins
  plugins: [
    openAPI(),
    // Organization/multi-tenancy support
    organization({
      ac,
      allowUserToCreateOrganization: false,
      roles: {
        owner,
        admin,
        member,
      },
      dynamicAccessControl: {
        enabled: true,
      },
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // Cache duration in seconds
      },
      async sendInvitationEmail(data) {
        // Build the invitation acceptance URL
        const invitationUrl = `${siteUrl}/auth/accept-invitation/${data.invitation.id}`;

        // Send invitation email directly via Resend
        await sendOrganizationInvitationDirect({
          to: data.email,
          url: invitationUrl,
          organizationName: data.organization.name,
          inviterName: data.inviter.user?.name ?? undefined,
          role: data.role,
        });
      },
      organizationHooks: {
        afterCreateOrganization: async ({ organization, member, user }) => {
          // Sync organization to Convex
          // console.log(
          //   "[Convex Sync] Syncing new organization to Convex:",
          //   organization,
          // );
          if (convex) {
            try {
              await convex.mutation(api.authSync.syncOrganization, {
                authId: organization.id,
                name: organization.name,
                slug: organization.slug,
                logo: organization.logo || undefined,
                metadata: organization.metadata || undefined,
                createdAt: new Date(organization.createdAt).getTime(),
              });
              // console.log(
              //   `[Convex Sync] Organization created: ${organization.id}`,
              // );

              // Create member for the organization creator
              // This handles the case where member sync was attempted before org sync
              if (member && user) {
                await convex.mutation(api.authSync.createMemberIfNeeded, {
                  userAuthId: user.id,
                  organizationAuthId: organization.id,
                });
                // console.log(
                //   `[Convex Sync] Creator member synced for org: ${organization.id}`,
                // );
              }
            } catch (error) {
              console.error(
                "[Convex Sync] Failed to sync organization creation:",
                error,
              );
            }
          }
        },
        afterUpdateOrganization: async ({ organization }) => {
          // Sync organization update to Convex
          if (convex) {
            try {
              if (organization) {
                await convex.mutation(api.authSync.syncOrganization, {
                  authId: organization.id,
                  name: organization.name,
                  slug: organization.slug,
                  logo: organization.logo || undefined,
                  metadata: organization.metadata || undefined,
                  createdAt: new Date(organization.createdAt).getTime(),
                });
                // console.log(
                //   `[Convex Sync] Organization updated: ${organization.id}`,
                // );
              }
            } catch (error) {
              console.error(
                "[Convex Sync] Failed to sync organization update:",
                error,
              );
            }
          }
        },
        afterDeleteOrganization: async ({ organization }) => {
          if (convex) {
            try {
              // Delete all members of the organization
              await convex.mutation(
                api.authSync.deleteAllMembersOfOrganization,
                {
                  organizationAuthId: organization.id,
                },
              );
              // console.log(
              //   `[Convex Sync] Deleted ${memberCleanup.deletedCount} members from organization ${organization.id}`,
              // );

              // Soft delete the organization
              await convex.mutation(api.authSync.deleteOrganization, {
                authId: organization.id,
              });
              // console.log(
              //   `[Convex Sync] Organization deleted: ${organization.id}`,
              // );
            } catch (error) {
              console.error(
                "[Convex Sync] Failed to sync organization deletion:",
                error,
              );
            }
          }
        },
        // After a member is added
        afterAddMember: async ({ user, organization }) => {
          if (convex) {
            try {
              // console.log(
              //   `[Convex Sync] Syncing member addition: User ${user.id} to Organization ${organization.id}`,
              // );
              await convex.mutation(api.authSync.syncMember, {
                userAuthId: user.id,
                organizationAuthId: organization.id,
              });
              // console.log(
              //   `[Convex Sync] User ${user.id} added to organization ${organization.id}`,
              // );
            } catch (error) {
              console.error(
                "[Convex Sync] Failed to sync member addition:",
                error,
              );
            }
          }
        },
        // After a member is removed
        afterRemoveMember: async ({ user, organization }) => {
          if (convex) {
            try {
              await convex.mutation(api.authSync.deleteMember, {
                userAuthId: user.id,
                organizationAuthId: organization.id,
              });
              // console.log(
              //   `[Convex Sync] User ${user.id} removed from organization ${organization.id}`,
              // );
            } catch (error) {
              console.error(
                "[Convex Sync] Failed to sync member removal:",
                error,
              );
            }
          }
        },
      },
    }),

    // Email OTP verification
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        await sendOTPVerificationDirect({
          to: email,
          code: otp,
        });
      },
    }),
  ],

  // Hooks to sync data to Convex
  hooks: {
    before: demoAuthReadOnlyGuard,
  },

  databaseHooks: {
    session: {
      create: {
        before: async (session: DBHookSession) => {
          const [membership] = await db
            .select({ organizationId: schema.member.organizationId })
            .from(schema.member)
            .where(eq(schema.member.userId, session.userId))
            .limit(1);

          return {
            data: {
              ...session,
              activeOrganizationId: membership?.organizationId,
            },
          };
        },
      },
    },
    user: {
      create: {
        after: async (user: DBHookUser) => {
          // Sync new user to Convex
          if (convex) {
            try {
              await convex.mutation(api.authSync.syncUser, {
                authId: user.id,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified,
                image: user.image || undefined,
                createdAt: new Date(user.createdAt).getTime(),
                updatedAt: new Date(user.updatedAt).getTime(),
              });
              // console.log(`[Convex Sync] User created: ${user.id}`);
            } catch (error) {
              console.error(
                "[Convex Sync] Failed to sync user creation:",
                error,
              );
            }
          }
        },
      },
      update: {
        after: async (user: DBHookUser) => {
          // Sync user update to Convex
          if (convex) {
            try {
              await convex.mutation(api.authSync.syncUser, {
                authId: user.id,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified,
                image: user.image || undefined,
                createdAt: new Date(user.createdAt).getTime(),
                updatedAt: new Date(user.updatedAt).getTime(),
              });
              // console.log(`[Convex Sync] User updated: ${user.id}`);
            } catch (error) {
              console.error("[Convex Sync] Failed to sync user update:", error);
            }
          }
        },
      },
    },
  },
};

export const auth: BetterAuthInstance<typeof authConfig> =
  betterAuth(authConfig);

// Export auth type for client inference
export type Auth = typeof auth;
