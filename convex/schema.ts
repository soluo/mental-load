import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  households: defineTable({
    name: v.string(),
    createdBy: v.id("users"),
  }),
  householdMembers: defineTable({
    householdId: v.id("households"),
    userId: v.optional(v.id("users")),
    firstName: v.optional(v.string()),
    role: v.optional(v.union(v.literal("adult"), v.literal("child"))),
    email: v.optional(v.string()),
    joinedAt: v.number(),
  })
    .index("by_household", ["householdId"])
    .index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
