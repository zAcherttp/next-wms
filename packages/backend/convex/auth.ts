import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { requireActionCtx } from "@convex-dev/better-auth/utils";
import { Resend } from "@convex-dev/resend";
import { type BetterAuthOptions, betterAuth } from "better-auth/minimal";
import { emailOTP, organization } from "better-auth/plugins";
import { ac, admin, member, owner } from "../lib/permissions";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";
import authSchema from "./betterAuth/schema";

const siteUrl = process.env.SITE_URL || "";

export const resend = new Resend(components.resend);
const EMAIL_FROM = "wms@zachrttp.id.vn";

export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  return {
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      requireEmailVerification: false,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
    },
    rateLimit: {
      window: 10, // time window in seconds
      max: 100, // max requests in the window
    },
    plugins: [
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

          await resend.sendEmail(requireActionCtx(ctx), {
            from: "wms@zachrttp.id.vn",
            to: data.invitation.email,
            subject: `You've been invited to join ${data.organization.name}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>You're invited!</h1>
          <p>You have been invited you to join <strong>${data.organization.name}</strong> as a <strong>${data.invitation.role}</strong>.</p>
          <p>Click the button below to accept the invitation:</p>
          <a href="${invitationUrl}" style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Accept Invitation
          </a>
          <p style="color: #666; font-size: 14px;">If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      `,
          });
        },
      }),

      emailOTP({
        async sendVerificationOTP({ email, otp }) {
          await resend.sendEmail(requireActionCtx(ctx), {
            from: EMAIL_FROM,
            to: email,
            subject: "Your verification code",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Verification Code</h1>
          <p>Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 16px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otp}</span>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
          });
        },
      }),
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true,
      }),
    ],
  } satisfies BetterAuthOptions;
};

export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: {
      schema: authSchema,
    },
  },
);

function createAuth(ctx: GenericCtx<DataModel>) {
  return betterAuth(createAuthOptions(ctx));
}

export { createAuth };

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.safeGetAuthUser(ctx);
  },
});
