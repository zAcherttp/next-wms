import { auth } from "@next-wms/auth";
import { db } from "@next-wms/db";
import { member, organization } from "@next-wms/db/schema/auth";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
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
    // Get session using Better Auth's native server function
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // If no session, redirect to sign-in
    if (!session) {
      const url = new URL("/auth/sign-in", request.url);
      return NextResponse.redirect(url);
    }

    const userId = session.user.id;

    // Check if organization exists and user is a member
    const [org] = await db
      .select({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      })
      .from(organization)
      .where(eq(organization.slug, workspaceSlug))
      .limit(1);

    if (!org) {
      const url = new URL("/join", request.url);
      url.searchParams.set("error", "Organization not found");
      return NextResponse.redirect(url);
    }

    // Check if user is a member of this organization
    const [membership] = await db
      .select()
      .from(member)
      .where(and(eq(member.userId, userId), eq(member.organizationId, org.id)))
      .limit(1);

    if (!membership) {
      const url = new URL("/join", request.url);
      url.searchParams.set(
        "error",
        "You don't have access to this organization",
      );
      return NextResponse.redirect(url);
    }

    // User has access, continue to the route
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
