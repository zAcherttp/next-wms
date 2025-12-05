import { type NextRequest, NextResponse } from "next/server";
import {
  createCacheCookieHeader,
  createClearCacheCookieHeader,
  getCachedVerification,
} from "@/lib/middleware-cache";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "";

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
    // Cache hit - skip API calls
    return NextResponse.next();
  }

  const cookie = request.headers.get("cookie") || "";

  try {
    // 1. Check session with Better Auth
    const sessionResponse = await fetch(`${APP_URL}/api/auth/get-session`, {
      headers: { cookie },
      cache: "no-store",
    });

    if (!sessionResponse.ok) {
      const url = new URL("/auth/sign-in", request.url);
      url.searchParams.set("error", "Not authenticated");
      const redirectResponse = NextResponse.redirect(url);
      redirectResponse.headers.set(
        "Set-Cookie",
        createClearCacheCookieHeader(workspaceSlug),
      );
      return redirectResponse;
    }

    const session = await sessionResponse.json();

    if (!session || !session.user) {
      const url = new URL("/auth/sign-in", request.url);
      const redirectResponse = NextResponse.redirect(url);
      redirectResponse.headers.set(
        "Set-Cookie",
        createClearCacheCookieHeader(workspaceSlug),
      );
      return redirectResponse;
    }

    const userId = session.user.id;

    // 2. Fetch user's organizations
    const orgsResponse = await fetch(`${APP_URL}/api/auth/organization/list`, {
      headers: { cookie },
      cache: "no-store",
    });

    if (!orgsResponse.ok) {
      const url = new URL("/join", request.url);
      url.searchParams.set("error", "Failed to fetch organizations");
      const redirectResponse = NextResponse.redirect(url);
      redirectResponse.headers.set(
        "Set-Cookie",
        createClearCacheCookieHeader(workspaceSlug),
      );
      return redirectResponse;
    }

    const organizations = await orgsResponse.json();

    // 3. Check if user has access to the requested workspace
    const org = Array.isArray(organizations)
      ? organizations.find((o: { slug?: string }) => o.slug === workspaceSlug)
      : null;

    if (!org) {
      const url = new URL("/join", request.url);
      url.searchParams.set(
        "error",
        "You don't have access to this organization",
      );
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
    nextResponse.headers.set(
      "Set-Cookie",
      createCacheCookieHeader(workspaceSlug, userId, org.id, org.name),
    );

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
