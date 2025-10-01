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
    userId: v.id("users"),
    joinedAt: v.number(),
  })
    .index("by_household", ["householdId"])
    .index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
