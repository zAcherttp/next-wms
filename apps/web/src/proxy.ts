import { api } from "@wms/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { getToken, preloadAuthQuery } from "@/lib/auth/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run middleware for workspace routes (e.g., /acme-corp/dashboard)
  // Match pattern: /[workspace-slug]/...
  const workspaceMatch = pathname.match(/^\/([^/]+)\//);

  if (!workspaceMatch) {
    return NextResponse.next();
  }

  // Skip middleware for special routes
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/join") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  const workspaceSlug = workspaceMatch[1];

  try {
    // 1. Get auth user from Convex via Better Auth component
    const user = await preloadAuthQuery(api.auth.getCurrentUser);

    console.log("Middleware - Authenticated user:", user);

    if (!user) {
      const url = new URL("/auth/sign-in", request.url);
      url.searchParams.set("error", "Not authenticated");
      return NextResponse.redirect(url);
    }

    // // 2. Fetch user's organizations using Better Auth API
    // const listOrgResponse = await authComponent.api.listOrganizations({
    //   headers: await headers(),
    // });

    // if (!listOrgResponse) {
    //   const url = new URL("/join", request.url);
    //   url.searchParams.set("error", "Failed to fetch organizations");
    //   return NextResponse.redirect(url);
    // }

    // // 3. Check if user has access to the requested workspace
    // const org = Array.isArray(listOrgResponse)
    //   ? listOrgResponse.find((o: { slug: string }) => o.slug === workspaceSlug)
    //   : null;

    // if (!org) {
    //   const url = new URL("/join", request.url);
    //   url.searchParams.set(
    //     "error",
    //     "You don't have access to this organization",
    //   );
    //   return NextResponse.redirect(url);
    // }

    // 4. Sync active organization with workspace URL
    //
    // This step ensures the session's activeOrganizationId matches the
    // workspace slug in the URL. This provides server-side workspace sync,
    // eliminating the need for client-side WorkspaceSync component.
    //
    // Benefits:
    // - Server-rendered content always has correct org context
    // - No hydration mismatches or race conditions
    // - URL is the single source of truth for active workspace
    // - Eliminates client-side sync delays and flashing
    //
    // The setActive call is fire-and-forget for performance:
    // - We already verified user has access to this org
    // - Subsequent requests will see the updated activeOrganizationId
    // - Reduces middleware latency (don't wait for DB write)
    // const session = await authComponent.api.getSession({
    //   headers: await headers(),
    // });

    // if (session?.session?.activeOrganizationId !== org.id) {
    //   try {
    //     await authComponent.api.setActiveOrganization({
    //       body: {
    //         organizationId: org.id,
    //       },
    //       headers: await headers(),
    //     });
    //   } catch (error) {
    //     console.error("Failed to set active organization:", error);
    //   }
    // }

    // User has access - allow request to continue
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);

    // On error, redirect to join page
    const url = new URL("/join", request.url);
    url.searchParams.set("error", "An error occurred while validating access");
    return NextResponse.redirect(url);
  }
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth routes
     * - api routes
     * - join route
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|auth|api|join).*)",
  ],
};
