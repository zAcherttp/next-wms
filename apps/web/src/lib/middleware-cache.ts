/**
 * Middleware Cache Utilities
 *
 * Provides cookie-based caching for middleware verification to reduce
 * redundant HTTP calls to Convex for workspace access validation.
 *
 * Cache Strategy:
 * - 60 second TTL (short enough to be secure, long enough to optimize)
 * - Per-workspace cache keys: wms_mw_cache_{workspaceSlug}
 * - Base64-encoded JSON payload with userId, orgId, expiry
 * - HttpOnly cookies for security
 */

import type { NextRequest } from "next/server";

/** Cache TTL in seconds */
export const CACHE_TTL_SECONDS = 60;

/** Cache key prefix */
export const CACHE_KEY_PREFIX = "wms_mw_cache_";

/**
 * Cached verification result stored in cookie
 */
export interface CachePayload {
  /** User ID from session */
  uid: string;
  /** Organization ID */
  oid: string;
  /** Organization name */
  onm: string;
  /** Expiry timestamp (Unix seconds) */
  exp: number;
}

/**
 * Verification result returned by cache check
 */
export interface CachedVerificationResult {
  valid: true;
  userId: string;
  orgId: string;
  orgName: string;
  cached: true;
}

/**
 * Generates the cache key for a given workspace slug
 */
export function getCacheKey(workspaceSlug: string): string {
  return `${CACHE_KEY_PREFIX}${workspaceSlug}`;
}

/**
 * Encodes a cache payload to base64 string
 */
export function encodePayload(payload: CachePayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/**
 * Decodes a base64 string to cache payload
 * Returns null if decoding fails
 */
export function decodePayload(encoded: string): CachePayload | null {
  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    return JSON.parse(decoded) as CachePayload;
  } catch {
    return null;
  }
}

/**
 * Checks if a cache payload is still valid (not expired)
 */
export function isCacheValid(payload: CachePayload): boolean {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.exp > nowSeconds;
}

/**
 * Creates a new cache payload with current timestamp + TTL
 */
export function createCachePayload(
  userId: string,
  orgId: string,
  orgName: string,
): CachePayload {
  return {
    uid: userId,
    oid: orgId,
    onm: orgName,
    exp: Math.floor(Date.now() / 1000) + CACHE_TTL_SECONDS,
  };
}

/**
 * Attempts to get a valid cached verification result from request cookies
 * Returns null if no valid cache exists
 */
export function getCachedVerification(
  request: NextRequest,
  workspaceSlug: string,
): CachedVerificationResult | null {
  const cacheKey = getCacheKey(workspaceSlug);
  const cookieValue = request.cookies.get(cacheKey)?.value;

  if (!cookieValue) {
    return null;
  }

  const payload = decodePayload(cookieValue);

  if (!payload) {
    return null;
  }

  if (!isCacheValid(payload)) {
    return null;
  }

  return {
    valid: true,
    userId: payload.uid,
    orgId: payload.oid,
    orgName: payload.onm,
    cached: true,
  };
}

/**
 * Creates Set-Cookie header value for caching verification result
 */
export function createCacheCookieHeader(
  workspaceSlug: string,
  userId: string,
  orgId: string,
  orgName: string,
): string {
  const cacheKey = getCacheKey(workspaceSlug);
  const payload = createCachePayload(userId, orgId, orgName);
  const encoded = encodePayload(payload);

  return `${cacheKey}=${encoded}; Path=/; Max-Age=${CACHE_TTL_SECONDS}; HttpOnly; SameSite=Lax`;
}

/**
 * Creates Set-Cookie header to clear a cache cookie
 */
export function createClearCacheCookieHeader(workspaceSlug: string): string {
  const cacheKey = getCacheKey(workspaceSlug);
  return `${cacheKey}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}
