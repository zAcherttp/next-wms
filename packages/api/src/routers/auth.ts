import { db } from "@next-wms/db";
import { member, organization, user } from "@next-wms/db/schema/auth";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../index";

export const authRouter = router({
  verifyEmailStatus: publicProcedure
    .input(
      z.object({
        email: z.email("Invalid email address"),
      }),
    )
    .query(async ({ input }) => {
      try {
        // Check if user exists with this email
        const [userRecord] = await db
          .select({
            email: user.email,
            emailVerified: user.emailVerified,
          })
          .from(user)
          .where(eq(user.email, input.email))
          .limit(1);

        if (!userRecord) {
          return {
            valid: false,
            verified: false,
            message: "Email not found",
          };
        }

        return {
          valid: true,
          verified: userRecord.emailVerified,
          message: userRecord.emailVerified
            ? "Email already verified"
            : "Email is valid and not verified",
        };
      } catch (error) {
        console.error("Error checking email status:", error);
        throw new Error("Failed to check email status");
      }
    }),

  // Validate workspace access for middleware
  validateWorkspaceAccess: protectedProcedure
    .input(
      z.object({
        workspaceSlug: z.string().min(1),
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      // Get organization by slug
      const [org] = await db
        .select()
        .from(organization)
        .where(eq(organization.slug, input.workspaceSlug))
        .limit(1);

      if (!org) {
        return {
          valid: false,
          organization: null,
          error: "Organization not found",
        };
      }

      // Check if user is a member
      const [membership] = await db
        .select()
        .from(member)
        .where(
          and(eq(member.userId, userId), eq(member.organizationId, org.id)),
        )
        .limit(1);

      if (!membership) {
        return {
          valid: false,
          organization: null,
          error: "You don't have access to this organization",
        };
      }

      return {
        valid: true,
        organization: org,
        error: null,
      };
    }),

  // Get organization by slug
  getOrganizationBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const [org] = await db
        .select()
        .from(organization)
        .where(eq(organization.slug, input.slug))
        .limit(1);

      return org || null;
    }),
});
