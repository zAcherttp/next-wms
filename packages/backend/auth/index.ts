import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, organization } from "better-auth/plugins";
import { ac, admin, member, owner } from "../lib/permissions";
import { db } from "./db";
import {
  sendOrganizationInvitationDirect,
  sendOTPVerificationDirect,
} from "./email/resend";
import * as schema from "./schema";

// Get site URL from environment
const siteUrl = process.env.SITE_URL || "";

/**
 * Better Auth instance configured with:
 * - Drizzle adapter for Neon PostgreSQL
 * - Organization plugin for multi-tenancy
 * - Email OTP for verification
 * - Dynamic access control
 */
export const auth = betterAuth({
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
});

// Export auth type for client inference
export type Auth = typeof auth;
