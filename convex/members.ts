import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const AVAILABLE_COLORS = [
  "orange",
  "blue",
  "pink",
  "green",
  "purple",
  "red",
  "yellow",
  "indigo",
];

export const addMember = mutation({
  args: {
    householdId: v.id("households"),
    firstName: v.string(),
    role: v.union(v.literal("adult"), v.literal("child")),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user is member of this household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!membership || membership.householdId !== args.householdId) {
      throw new Error("Not authorized to add members to this household");
    }

    // Get existing members to find used colors
    const existingMembers = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    const usedColors = existingMembers
      .map((m) => m.color)
      .filter((c): c is string => !!c);

    // Find available colors
    const availableColors = AVAILABLE_COLORS.filter(
      (c) => !usedColors.includes(c)
    );

    // Pick a random color (from available or all if none available)
    const colorsToChooseFrom =
      availableColors.length > 0 ? availableColors : AVAILABLE_COLORS;
    const randomColor =
      colorsToChooseFrom[Math.floor(Math.random() * colorsToChooseFrom.length)];

    // Create the member
    const memberId = await ctx.db.insert("householdMembers", {
      householdId: args.householdId,
      firstName: args.firstName,
      role: args.role,
      email: args.email,
      color: randomColor,
      userId: undefined,
      joinedAt: Date.now(),
    });

    return memberId;
  },
});

export const removeMember = mutation({
  args: {
    memberId: v.id("householdMembers"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw new Error("Member not found");
    }

    // Verify user is member of the same household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!membership || membership.householdId !== member.householdId) {
      throw new Error("Not authorized to remove this member");
    }

    // Don't allow removing the last member
    const memberCount = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", member.householdId))
      .collect();

    if (memberCount.length <= 1) {
      throw new Error("Cannot remove the last member of the household");
    }

    await ctx.db.delete(args.memberId);
    return null;
  },
});

export const updateMember = mutation({
  args: {
    memberId: v.id("householdMembers"),
    firstName: v.optional(v.string()),
    role: v.optional(v.union(v.literal("adult"), v.literal("child"))),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw new Error("Member not found");
    }

    // Verify user is member of the same household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!membership || membership.householdId !== member.householdId) {
      throw new Error("Not authorized to update this member");
    }

    const updates: Partial<typeof member> = {};
    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.role !== undefined) updates.role = args.role;
    if (args.email !== undefined) updates.email = args.email;

    await ctx.db.patch(args.memberId, updates);
    return args.memberId;
  },
});

export const getHouseholdMembers = query({
  args: {
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const members = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    return members.map((member) => ({
      id: member._id,
      firstName: member.firstName,
      role: member.role,
      email: member.email,
      userId: member.userId,
      joinedAt: member.joinedAt,
    }));
  },
});
