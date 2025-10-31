import { db } from "@next-wms/db";
import * as schema from "@next-wms/db/schema/auth";
// import { sendEmailConfirmationCode } from "@next-wms/email";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins/organization";
import { passkey } from "better-auth/plugins/passkey";

export const auth = betterAuth<BetterAuthOptions>({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 300, // 5 minutes
    sendResetPassword: async ({ user, url, token }) => {
      //TODO: Implement actual email sending using @next-wms/email
      console.log(
        `Reset password link for ${user.email}: ${url} (token: ${token})`,
      );
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      //TODO: Implement actual email sending using @next-wms/email
      console.log(
        `Verification link for ${user.email}: ${url} (token: ${token})`,
      );
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 300, // 5 minutes
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
  plugins: [nextCookies(), passkey(), organization()],
});
