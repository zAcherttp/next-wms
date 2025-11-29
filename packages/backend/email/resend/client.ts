import { Resend } from "@convex-dev/resend";
import { render } from "@react-email/render";
import { components } from "../../convex/_generated/api";
import type { ActionCtx } from "../../convex/_generated/server";
import VerifyEmail from "../templates/verify-email";
import VerifyOTP from "../templates/verify-otp";

export const email_from = process.env.EMAIL_FROM || "wms@zachrttp.id.vn";

export const resend: Resend = new Resend(components.resend, {
  testMode: false,
});

export const sendEmailVerification = async (
  ctx: ActionCtx,
  {
    to,
    url,
  }: {
    to: string;
    url: string;
  },
) => {
  const html = await render(VerifyEmail({ url }));

  await resend.sendEmail(ctx, {
    from: email_from,
    to,
    subject: "Verify your email address",
    html: html,
  });
};

export const sendOTPVerification = async (
  ctx: ActionCtx,
  {
    to,
    code,
  }: {
    to: string;
    code: string;
  },
) => {
  const html = await render(VerifyOTP({ code }));

  await resend.sendEmail(ctx, {
    from: email_from,
    to,
    subject: "Verify your email address",
    html: html,
  });
};
