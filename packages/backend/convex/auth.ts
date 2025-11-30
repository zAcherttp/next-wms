import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { requireActionCtx } from "@convex-dev/better-auth/utils";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { emailOTP, organization } from "better-auth/plugins";
import { v } from "convex/values";
import {
  sendOrganizationInvitation,
  sendOTPVerification,
} from "../email/resend/client";
import { ac, admin, member, owner } from "../lib/permissions";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authSchema from "./betterAuth/schema";

const siteUrl = process.env.SITE_URL ?? "";

type CreateAuthOptions = {
  ctx: GenericCtx<DataModel>;
  optionsOnly?: boolean;
};

function createAuth(
  ctx: GenericCtx<DataModel>,
  { optionsOnly }: { optionsOnly?: boolean } = { optionsOnly: false },
) {
  return betterAuth(getBetterAuthOptions({ ctx, optionsOnly }));
}

export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  {
    local: {
      schema: authSchema,
    },
  },
);

export { createAuth };

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});

export const getUserById = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "id", value: args.userId }],
    });
  },
});

export const getEmailVerificationStatus = query({
  args: {
    email: v.string(),
  },
  returns: v.object({
    verified: v.optional(v.boolean()),
    valid: v.boolean(),
    message: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "email", value: args.email }],
    });

    if (!user) {
      return {
        verified: undefined,
        valid: false,
        message: "User not found",
      };
    }
    return {
      verified: user.emailVerified,
      valid: true,
      message: undefined,
    };
  },
});

function getBetterAuthOptions({
  ctx,
  optionsOnly = false,
}: CreateAuthOptions): BetterAuthOptions {
  return {
    logger: {
      disabled: optionsOnly,
    },
    baseURL: siteUrl,
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      requireEmailVerification: true,
    },
    plugins: [
      convex(),
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
          await sendOrganizationInvitation(requireActionCtx(ctx), {
            to: data.email,
            url: invitationUrl,
            organizationName: data.organization.name,
            inviterName: data.inviter.user?.name ?? undefined,
            role: data.role,
          });
        },
      }),
      emailOTP({
        async sendVerificationOTP({ email, otp }) {
          await sendOTPVerification(requireActionCtx(ctx), {
            to: email,
            code: otp,
          });
        },
      }),
    ],
  };
}
