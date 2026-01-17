/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as audit from "../audit.js";
import type * as authSync from "../authSync.js";
import type * as branches from "../branches.js";
import type * as brands from "../brands.js";
import type * as categories from "../categories.js";
import type * as crons from "../crons.js";
import type * as cycleCount from "../cycleCount.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as inventory from "../inventory.js";
import type * as notifications from "../notifications.js";
import type * as outboundOrders from "../outboundOrders.js";
import type * as pickingSessions from "../pickingSessions.js";
import type * as privateData from "../privateData.js";
import type * as products from "../products.js";
import type * as purchaseOrders from "../purchaseOrders.js";
import type * as receiveSessions from "../receiveSessions.js";
import type * as returnRequest from "../returnRequest.js";
import type * as seedMockData from "../seedMockData.js";
import type * as storageZones from "../storageZones.js";
import type * as suppliers from "../suppliers.js";
import type * as systemLookup from "../systemLookup.js";
import type * as systemLookups from "../systemLookups.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  audit: typeof audit;
  authSync: typeof authSync;
  branches: typeof branches;
  brands: typeof brands;
  categories: typeof categories;
  crons: typeof crons;
  cycleCount: typeof cycleCount;
  healthCheck: typeof healthCheck;
  http: typeof http;
  inventory: typeof inventory;
  notifications: typeof notifications;
  outboundOrders: typeof outboundOrders;
  pickingSessions: typeof pickingSessions;
  privateData: typeof privateData;
  products: typeof products;
  purchaseOrders: typeof purchaseOrders;
  receiveSessions: typeof receiveSessions;
  returnRequest: typeof returnRequest;
  seedMockData: typeof seedMockData;
  storageZones: typeof storageZones;
  suppliers: typeof suppliers;
  systemLookup: typeof systemLookup;
  systemLookups: typeof systemLookups;
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
