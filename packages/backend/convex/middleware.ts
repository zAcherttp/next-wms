import { httpAction } from "./_generated/server";
import { createAuth } from "./auth";
import { components } from "./_generated/api";

/**
 * HTTP action to verify session and organization membership for Next.js middleware.
 * Called from the Next.js middleware (proxy.ts) to validate access to workspace routes.
 */
export const verifyAccess = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const workspaceSlug = url.searchParams.get("workspace");

    if (!workspaceSlug) {
      return new Response(
        JSON.stringify({ valid: false, error: "Missing workspace parameter" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Get session from Better Auth using cookies from the request
    const auth = createAuth(ctx);
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: "Not authenticated",
          redirect: "/auth/sign-in",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    const userId = session.user.id;

    // Find organization by slug
    const org = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "organization",
      where: [{ field: "slug", value: workspaceSlug }],
    });

    if (!org) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: "Organization not found",
          redirect: "/join",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    // Check if user is a member of this organization
    const membership = await ctx.runQuery(
      components.betterAuth.adapter.findOne,
      {
        model: "member",
        where: [
          { field: "userId", value: userId },
          { field: "organizationId", value: org._id },
        ],
      },
    );

    if (!membership) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: "You don't have access to this organization",
          redirect: "/join",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }

    // User has access
    return new Response(
      JSON.stringify({
        valid: true,
        userId,
        orgId: org._id,
        orgName: org.name,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Middleware verification error:", error);
    return new Response(
      JSON.stringify({
        valid: false,
        error: "Internal server error",
        redirect: "/join",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
