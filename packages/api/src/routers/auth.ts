import { db } from "@next-wms/db";
import { user } from "@next-wms/db/schema/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, router } from "../index";

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
});
