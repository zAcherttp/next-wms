import { components } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { createAuth } from "./auth";

/** Cache TTL in seconds - should match frontend middleware-cache.ts */
const CACHE_TTL_SECONDS = 60;

/**
 * HTTP action to verify session and organization membership for Next.js middleware.
 * Called from the Next.js middleware (proxy.ts) to validate access to workspace routes.
 *
 * Optimization: The frontend caches successful responses for 60 seconds to reduce
 * repeated calls during navigation. This action includes cache-related headers
 * to indicate cacheability.
 */
export const verifyAccess = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const workspaceSlug = url.searchParams.get("workspace");

    if (!workspaceSlug) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: "Missing workspace parameter",
          code: "MISSING_WORKSPACE",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        },
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
          code: "NOT_AUTHENTICATED",
          redirect: "/auth/sign-in",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        },
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
          code: "ORG_NOT_FOUND",
          redirect: "/join",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        },
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
          code: "NO_ACCESS",
          redirect: "/join",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        },
      );
    }

    // User has access - include cache hints in response
    return new Response(
      JSON.stringify({
        valid: true,
        userId,
        orgId: org._id,
        orgName: org.name,
        cached: false,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          // Indicate this response can be cached by the frontend
          "X-WMS-Cache-Control": `max-age=${CACHE_TTL_SECONDS}`,
          "X-WMS-Cache-Key": `wms_mw_cache_${workspaceSlug}`,
        },
      },
    );
  } catch (error) {
    console.error("Middleware verification error:", error);
    return new Response(
      JSON.stringify({
        valid: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
        redirect: "/join",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  }
});
