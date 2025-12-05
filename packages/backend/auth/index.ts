import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, organization } from "better-auth/plugins";
import { ac, admin, member, owner } from "../lib/permissions";
import { db } from "./db";
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

// ============================================================================
// EMAIL SENDING HELPERS (Direct Resend calls, not Convex actions)
// ============================================================================

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrganizationInviteEmailParams {
  to: string;
  url: string;
  organizationName: string;
  inviterName?: string;
  role: string;
}

async function sendOrganizationInvitationDirect(
  params: OrganizationInviteEmailParams,
) {
  const { to, url, organizationName, inviterName, role } = params;

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "noreply@example.com",
    to,
    subject: `You've been invited to join ${organizationName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>You're invited!</h1>
        <p>${inviterName ? `${inviterName} has` : "You have been"} invited you to join <strong>${organizationName}</strong> as a <strong>${role}</strong>.</p>
        <p>Click the button below to accept the invitation:</p>
        <a href="${url}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Accept Invitation
        </a>
        <p style="color: #666; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
      </div>
    `,
  });
}

interface OTPEmailParams {
  to: string;
  code: string;
}

async function sendOTPVerificationDirect(params: OTPEmailParams) {
  const { to, code } = params;

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "noreply@example.com",
    to,
    subject: "Your verification code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Verification Code</h1>
        <p>Your verification code is:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 16px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${code}</span>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
      </div>
    `,
  });
}
