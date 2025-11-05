import { db } from "@next-wms/db";
import * as schema from "@next-wms/db/schema/auth";
import { resend } from "@next-wms/email";
import {
  EmailOtp,
  InviteUserEmail,
  ResetPasswordEmail,
} from "@next-wms/transactional";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins/email-otp";
import { organization } from "better-auth/plugins/organization";
import { passkey } from "better-auth/plugins/passkey";

const from = process.env.BETTER_AUTH_EMAIL || "wms@zachrttp.id.vn";

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
    sendResetPassword: async ({ user, url }) => {
      const response = await resend.emails.send({
        to: user.email,
        from,
        subject: "Reset your password",
        react: ResetPasswordEmail({ username: user.name, resetLink: url }),
      });

      console.log({ response, user });
    },
  },
  account: {
    accountLinking: {
      trustedProviders: ["github"],
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
  plugins: [
    nextCookies(),
    passkey(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        let response = null;
        if (type === "sign-in") {
          response = await resend.emails.send({
            to: email,
            from,
            subject: "Your Sign-In OTP Code",
            react: EmailOtp({ verificationCode: otp }),
          });
        } else if (type === "email-verification") {
          response = await resend.emails.send({
            to: email,
            from,
            subject: "Your Email Verification Code",
            react: EmailOtp({ verificationCode: otp }),
          });
        } else if (type === "forget-password") {
          response = await resend.emails.send({
            to: email,
            from,
            subject: "Your Password Reset Code",
            react: EmailOtp({ verificationCode: otp }),
          });
        }
        console.log(
          `${new Date().toISOString()} - sendVerificationOTP : response=${JSON.stringify(response)} email=${JSON.stringify(email)}`,
        );
      },
    }),
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          const response = await resend.emails.send({
            to: user.email,
            from,
            subject: "Your OTP",
            react: EmailOtp({ verificationCode: otp }),
          });

          console.log(
            `${new Date().toISOString()} - twoFactor : response=${JSON.stringify(response)} user=${JSON.stringify(user)}`,
          );
        },
      },
    }),
    organization({
      async sendInvitationEmail(data) {
        const response = await resend.emails.send({
          from,
          to: data.email,
          subject: "You've been invited to join an organization",
          react: InviteUserEmail({
            username: data.email,
            invitedByUsername: data.inviter.user.name,
            invitedByEmail: data.inviter.user.email,
            teamName: data.organization.name,
            // TODO: replace localhost with actual domain for production
            inviteLink: `http://localhost:3000/accept-invitation/${data.id}`,
          }),
        });

        console.log(
          `${new Date().toISOString()} - sendInvitationEmail : response=${JSON.stringify(response)} data=${JSON.stringify(data)}`,
        );
      },
    }),
  ],
});
