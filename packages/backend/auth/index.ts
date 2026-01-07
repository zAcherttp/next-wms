import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, organization } from "better-auth/plugins";
import { ConvexHttpClient } from "convex/browser";
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

// Get site URL from environment
const siteUrl = process.env.SITE_URL || "";

const authConfig = {
  baseURL: siteUrl,
  trustedOrigins: [siteUrl],

  // Use Drizzle adapter with Neon PostgreSQL
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      organization: schema.organization,
      member: schema.member,
      invitation: schema.invitation,
    },
  }),

  // Email + Password authentication
  emailAndPassword: {
    enabled: true,
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
    // Organization/multi-tenancy support
    organization({
      ac,
      roles: {
        owner,
        admin,
        member,
      },
      dynamicAccessControl: {
        enabled: true,
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
              console.log(
                `[Convex Sync] Organization created: ${organization.id}`,
              );
            } catch (error) {
              console.error(
                "[Convex Sync] Failed to sync organization creation:",
                error,
              );
            }
          }
        },
        afterUpdateOrganization: async ({ organization, user, member }) => {
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
                console.log(
                  `[Convex Sync] Organization updated: ${organization.id}`,
                );
              }
            } catch (error) {
              console.error(
                "[Convex Sync] Failed to sync organization update:",
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
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
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
              console.log(`[Convex Sync] User created: ${user.id}`);
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
        after: async (user) => {
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
              console.log(`[Convex Sync] User updated: ${user.id}`);
            } catch (error) {
              console.error("[Convex Sync] Failed to sync user update:", error);
            }
          }
        },
      },
    },
  },
};

export const auth = betterAuth(authConfig);

// Export auth type for client inference
export type Auth = typeof auth;
