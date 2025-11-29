import { type NextRequest, NextResponse } from "next/server";

const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL || "";

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
    // Call Convex HTTP action to verify access
    const verifyUrl = new URL("/api/middleware/verify", CONVEX_SITE_URL);
    verifyUrl.searchParams.set("workspace", workspaceSlug);

    const response = await fetch(verifyUrl.toString(), {
      method: "GET",
      headers: {
        // Forward cookies for session validation
        cookie: request.headers.get("cookie") || "",
      },
    });

    const result = (await response.json()) as {
      valid: boolean;
      error?: string;
      redirect?: string;
      userId?: string;
      orgId?: string;
      orgName?: string;
    };

    if (!result.valid) {
      const redirectPath = result.redirect || "/auth/sign-in";
      const url = new URL(redirectPath, request.url);
      if (result.error) {
        url.searchParams.set("error", result.error);
      }
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
