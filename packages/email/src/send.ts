import { WMSVerifyEmail } from "@next-wms/transactional";
import type { CreateEmailResponse } from "resend";
import { z } from "zod";
import { resend } from "./client";

const EmailConfirmationSchema = z.object({
  to: z.email(),
  verificationCode: z.string().regex(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/),
});

// export async function sendResetPasswordEmail(to: string, resetLink: string) {
//   const { ResetPasswordTemplate } = await import("./templates/reset-password");
//   await resend.emails.send({
//     to,
//     from: "<no-reply@example.com>",
//     subject: "Reset your password",
//     html: ResetPasswordTemplate({ resetLink }),
//   });
// }
export async function sendEmailConfirmationCode(
  params: z.infer<typeof EmailConfirmationSchema>,
): Promise<CreateEmailResponse> {
  const response = await resend.emails.send({
    to: params.to,
    from: "<no-reply@example.com>",
    subject: "Confirm your email address",
    react: WMSVerifyEmail({ verificationCode: params.verificationCode }),
  });
  return response;
}
