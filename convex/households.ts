import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createHousehold = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const householdId = await ctx.db.insert("households", {
      name: args.name,
      createdBy: userId,
    });

    await ctx.db.insert("householdMembers", {
      householdId,
      userId,
      joinedAt: Date.now(),
    });

    return householdId;
  },
});

export const joinHousehold = mutation({
  args: {
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("householdMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      throw new Error("Already member of a household");
    }

    await ctx.db.insert("householdMembers", {
      householdId: args.householdId,
      userId,
      joinedAt: Date.now(),
    });

    return args.householdId;
  },
});

export const getCurrentHousehold = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!membership) {
      return null;
    }

    const household = await ctx.db.get(membership.householdId);
    if (!household) {
      return null;
    }

    const members = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", household._id))
      .collect();

    const memberDetails = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          id: member.userId,
          email: user?.email,
          name: user?.name,
          joinedAt: member.joinedAt,
        };
      })
    );

    return {
      id: household._id,
      name: household.name,
      members: memberDetails,
    };
  },
});

export const leaveHousehold = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!membership) {
      throw new Error("Not a member of any household");
    }

    await ctx.db.delete(membership._id);
    return null;
  },
});
