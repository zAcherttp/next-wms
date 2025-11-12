import { protectedProcedure, publicProcedure, router } from "../index";
import { authRouter } from "./auth";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      session: ctx.session,
    };
  }),
  auth: authRouter,
});
export type AppRouter = typeof appRouter;
