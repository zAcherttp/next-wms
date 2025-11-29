import { type NextRequest, NextResponse } from "next/server";
import {
  createCacheCookieHeader,
  createClearCacheCookieHeader,
  getCachedVerification,
} from "@/lib/middleware-cache";

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

  // Check for cached verification result first
  const cachedResult = getCachedVerification(request, workspaceSlug);
  if (cachedResult) {
    // Cache hit - skip HTTP call to Convex
    return NextResponse.next();
  }

  try {
    // Cache miss - call Convex HTTP action to verify access
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

      // Clear any stale cache on auth failure
      const redirectResponse = NextResponse.redirect(url);
      redirectResponse.headers.set(
        "Set-Cookie",
        createClearCacheCookieHeader(workspaceSlug),
      );
      return redirectResponse;
    }

    // User has access - cache the result and continue
    const nextResponse = NextResponse.next();

    // Set cache cookie for subsequent requests
    if (result.userId && result.orgId && result.orgName) {
      nextResponse.headers.set(
        "Set-Cookie",
        createCacheCookieHeader(
          workspaceSlug,
          result.userId,
          result.orgId,
          result.orgName,
        ),
      );
    }

    return nextResponse;
  } catch (error) {
    console.error("Middleware error:", error);

    // On error, clear cache and redirect to join page
    const url = new URL("/join", request.url);
    url.searchParams.set("error", "An error occurred while validating access");

    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.headers.set(
      "Set-Cookie",
      createClearCacheCookieHeader(workspaceSlug),
    );
    return redirectResponse;
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
