/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as households from "../households.js";
import type * as http from "../http.js";
import type * as lib_taskHelpers from "../lib/taskHelpers.js";
import type * as members from "../members.js";
import type * as migrations_migrateMembersSchema from "../migrations/migrateMembersSchema.js";
import type * as router from "../router.js";
import type * as runMigration from "../runMigration.js";
import type * as seed from "../seed.js";
import type * as taskCompletions from "../taskCompletions.js";
import type * as tasks from "../tasks.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  households: typeof households;
  http: typeof http;
  "lib/taskHelpers": typeof lib_taskHelpers;
  members: typeof members;
  "migrations/migrateMembersSchema": typeof migrations_migrateMembersSchema;
  router: typeof router;
  runMigration: typeof runMigration;
  seed: typeof seed;
  taskCompletions: typeof taskCompletions;
  tasks: typeof tasks;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
