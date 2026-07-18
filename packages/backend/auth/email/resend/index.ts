// ============================================================================
// EMAIL SENDING HELPERS (Direct Resend calls, not Convex actions)
// ============================================================================

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Logging prefix for easy filtering
const LOG_PREFIX = "[Resend Email]";

/**
 * Reusable guard and execution wrapper for sending emails.
 * Prevents crashes if API keys are missing and standardizes error responses.
 */
async function safeSendEmail(
  payload: Parameters<InstanceType<typeof Resend>["emails"]["send"]>[0],
) {
  if (!resend) {
    console.warn(LOG_PREFIX, "RESEND_API_KEY is missing. Skipping email send.");
    return {
      data: null,
      error: { message: "Email service is not configured." },
    };
  }

  try {
    return await resend.emails.send(payload);
  } catch (error) {
    console.error(LOG_PREFIX, "Failed to send email:", error);
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while sending email.";
    return {
      data: null,
      error: {
        message,
      },
    };
  }
}

interface OrganizationInviteEmailParams {
  to: string;
  url: string;
  organizationName: string;
  inviterName?: string;
  role: string;
}

export async function sendOrganizationInvitationDirect(
  params: OrganizationInviteEmailParams,
) {
  const { to, url, organizationName, inviterName, role } = params;
  const from = process.env.RESEND_EMAIL_FROM || "";

  return safeSendEmail({
    from,
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

export async function sendOTPVerificationDirect(params: OTPEmailParams) {
  const { to, code } = params;
  const from = process.env.RESEND_EMAIL_FROM || "";

  return safeSendEmail({
    from,
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
