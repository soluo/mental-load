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
  tasks: defineTable({
    householdId: v.id("households"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("flexible"), v.literal("one-time")),
    scheduling: v.optional(
      v.object({
        dueDate: v.optional(v.number()),
        showBeforeDays: v.optional(v.number()),
      })
    ),
    isActive: v.boolean(),
    isCompleted: v.boolean(),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    createdBy: v.id("householdMembers"),
    assignedTo: v.optional(v.id("householdMembers")),
  })
    .index("by_household", ["householdId"])
    .index("by_household_active", ["householdId", "isActive"])
    .index("by_household_type", ["householdId", "type"])
    .index("by_household_assigned", ["householdId", "assignedTo"]),
  taskCompletions: defineTable({
    taskId: v.id("tasks"),
    householdId: v.id("households"),
    completedBy: v.id("householdMembers"),
    completedAt: v.number(),
    forDate: v.number(),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
    wasLate: v.boolean(),
    daysLate: v.optional(v.number()),
  })
    .index("by_task", ["taskId"])
    .index("by_household", ["householdId"])
    .index("by_household_date", ["householdId", "completedAt"])
    .index("by_member", ["completedBy"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
