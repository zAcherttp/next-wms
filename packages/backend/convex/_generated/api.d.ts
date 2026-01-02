/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as brands from "../brands.js";
import type * as cycleCount from "../cycleCount.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as lib_withPermission from "../lib/withPermission.js";
import type * as members from "../members.js";
import type * as middleware from "../middleware.js";
import type * as privateData from "../privateData.js";
import type * as returnRequest from "../returnRequest.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  brands: typeof brands;
  cycleCount: typeof cycleCount;
  healthCheck: typeof healthCheck;
  http: typeof http;
  "lib/withPermission": typeof lib_withPermission;
  members: typeof members;
  middleware: typeof middleware;
  privateData: typeof privateData;
  returnRequest: typeof returnRequest;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
