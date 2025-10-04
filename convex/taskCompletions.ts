import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

/**
 * Get recent completions for a household
 */
export const getRecentCompletions = query({
  args: {
    householdId: v.id("households"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user belongs to household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!membership) {
      throw new Error("User is not a member of this household");
    }

    const limit = args.limit ?? 10;

    // Get recent completions
    const completions = await ctx.db
      .query("taskCompletions")
      .withIndex("by_household_date", (q) =>
        q.eq("householdId", args.householdId)
      )
      .order("desc")
      .take(limit);

    // Enrich with task and member details
    const enrichedCompletions = await Promise.all(
      completions.map(async (completion) => {
        const task = await ctx.db.get(completion.taskId);
        const member = await ctx.db.get(completion.completedBy);

        return {
          _id: completion._id,
          completedAt: completion.completedAt,
          duration: completion.duration,
          notes: completion.notes,
          task: task
            ? {
                _id: task._id,
                title: task.title,
                type: task.type,
              }
            : null,
          member: member
            ? {
                _id: member._id,
                firstName: member.firstName,
              }
            : null,
        };
      })
    );

    return enrichedCompletions;
  },
});

/**
 * Get detailed information about a specific task completion
 */
export const getTaskCompletionDetails = query({
  args: {
    completionId: v.id("taskCompletions"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the completion
    const completion = await ctx.db.get(args.completionId);
    if (!completion) {
      throw new Error("Task completion not found");
    }

    // Verify user belongs to the household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", completion.householdId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!membership) {
      throw new Error("User is not a member of this household");
    }

    // Get task and member details
    const task = await ctx.db.get(completion.taskId);
    const member = await ctx.db.get(completion.completedBy);

    return {
      _id: completion._id,
      completedAt: completion.completedAt,
      duration: completion.duration,
      notes: completion.notes,
      completedBy: completion.completedBy,
      task: task
        ? {
            _id: task._id,
            title: task.title,
            description: task.description,
            type: task.type,
          }
        : null,
      member: member
        ? {
            _id: member._id,
            firstName: member.firstName,
          }
        : null,
    };
  },
});

/**
 * Update an existing task completion
 */
export const updateTaskCompletion = mutation({
  args: {
    completionId: v.id("taskCompletions"),
    duration: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the completion
    const completion = await ctx.db.get(args.completionId);
    if (!completion) {
      throw new Error("Task completion not found");
    }

    // Get the member who completed the task
    const completedByMember = await ctx.db.get(completion.completedBy);
    if (!completedByMember) {
      throw new Error("Member not found");
    }

    // Verify the current user is the one who completed the task
    if (completedByMember.userId !== userId) {
      throw new Error("You can only edit your own task completions");
    }

    // Update the completion
    await ctx.db.patch(args.completionId, {
      duration: args.duration,
      notes: args.notes,
    });

    return { success: true };
  },
});

/**
 * Get statistics for a specific member over a time period
 */
export const getMemberStats = query({
  args: {
    memberId: v.id("householdMembers"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get the member to verify access
    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw new Error("Member not found");
    }

    // Verify user belongs to same household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", member.householdId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!membership) {
      throw new Error("User is not a member of this household");
    }

    // Get completions in the time range
    const completions = await ctx.db
      .query("taskCompletions")
      .withIndex("by_member", (q) => q.eq("completedBy", args.memberId))
      .filter((q) =>
        q.and(
          q.gte(q.field("completedAt"), args.startDate),
          q.lte(q.field("completedAt"), args.endDate)
        )
      )
      .collect();

    // Calculate stats
    const totalTasks = completions.length;
    const totalDuration = completions.reduce(
      (sum, c) => sum + (c.duration ?? 0),
      0
    );

    // Group by task type
    const tasksByType = new Map<string, number>();
    const taskIds = new Set<string>();

    for (const completion of completions) {
      taskIds.add(completion.taskId);
      const task = await ctx.db.get(completion.taskId);
      if (task) {
        const count = tasksByType.get(task.type) ?? 0;
        tasksByType.set(task.type, count + 1);
      }
    }

    // Hours distribution (0-23)
    const hourDistribution = new Array(24).fill(0);
    for (const completion of completions) {
      const hour = new Date(completion.completedAt).getHours();
      hourDistribution[hour]++;
    }

    // Find most active hours (top 3)
    const mostActiveHours = hourDistribution
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .filter((h) => h.count > 0);

    return {
      totalTasks,
      totalDuration,
      averageDuration: totalTasks > 0 ? totalDuration / totalTasks : 0,
      uniqueTasksCompleted: taskIds.size,
      tasksByType: Object.fromEntries(tasksByType),
      mostActiveHours,
      completionsOverTime: completions.map((c) => ({
        date: c.completedAt,
        duration: c.duration,
      })),
    };
  },
});

/**
 * Get daily activity stats for all members in a household (last 7 days)
 */
export const getMembersDailyActivity = query({
  args: {
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user belongs to household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!membership) {
      throw new Error("User is not a member of this household");
    }

    // Get all members
    const members = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .collect();

    // Get completions from the last 7 days
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const completions = await ctx.db
      .query("taskCompletions")
      .withIndex("by_household_date", (q) =>
        q.eq("householdId", args.householdId).gte("completedAt", sevenDaysAgo)
      )
      .collect();

    // Create maps for member -> daily stats (minutes and task count)
    const memberDailyMinutes = new Map<string, Map<string, number>>();
    const memberDailyTaskCount = new Map<string, Map<string, number>>();

    // Initialize all members with empty daily stats
    for (const member of members) {
      memberDailyMinutes.set(member._id, new Map());
      memberDailyTaskCount.set(member._id, new Map());
    }

    // Aggregate completions by member and day
    for (const completion of completions) {
      const memberId = completion.completedBy;
      const date = new Date(completion.completedAt);
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      const minutesMap = memberDailyMinutes.get(memberId);
      const taskCountMap = memberDailyTaskCount.get(memberId);

      if (minutesMap && taskCountMap) {
        const currentMinutes = minutesMap.get(dayKey) ?? 0;
        minutesMap.set(dayKey, currentMinutes + (completion.duration ?? 0));

        const currentTaskCount = taskCountMap.get(dayKey) ?? 0;
        taskCountMap.set(dayKey, currentTaskCount + 1);
      }
    }

    // Build result array with 7 days of data for each member
    const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    const result = members.map((member) => {
      const dailyStats: Array<{ day: string; date: number; minutes: number; taskCount: number }> = [];

      // Generate last 7 days (J-6 to J)
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const dayName = dayNames[date.getDay()];

        const minutesMap = memberDailyMinutes.get(member._id);
        const taskCountMap = memberDailyTaskCount.get(member._id);
        const minutes = minutesMap?.get(dayKey) ?? 0;
        const taskCount = taskCountMap?.get(dayKey) ?? 0;

        dailyStats.push({
          day: dayName,
          date: date.getTime(),
          minutes,
          taskCount,
        });
      }

      return {
        memberId: member._id,
        firstName: member.firstName ?? "Membre",
        color: member.color,
        dailyStats,
      };
    });

    return result;
  },
});

/**
 * Get weekly report for a household
 */
export const getHouseholdWeeklyReport = query({
  args: {
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify user belongs to household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!membership) {
      throw new Error("User is not a member of this household");
    }

    // Get completions from the last 7 days
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const weeklyCompletions = await ctx.db
      .query("taskCompletions")
      .withIndex("by_household_date", (q) =>
        q.eq("householdId", args.householdId).gte("completedAt", weekAgo)
      )
      .collect();

    // Group by member
    const tasksByMember = new Map<string, number>();
    const durationByMember = new Map<string, number>();

    for (const completion of weeklyCompletions) {
      const taskCount = tasksByMember.get(completion.completedBy) ?? 0;
      tasksByMember.set(completion.completedBy, taskCount + 1);

      const duration = durationByMember.get(completion.completedBy) ?? 0;
      durationByMember.set(
        completion.completedBy,
        duration + (completion.duration ?? 0)
      );
    }

    // Enrich with member details
    const memberStats = await Promise.all(
      Array.from(tasksByMember.entries()).map(async ([memberId, count]) => {
        const member = await ctx.db.get(memberId as any);
        return {
          member,
          tasksCompleted: count,
          totalDuration: durationByMember.get(memberId) ?? 0,
        };
      })
    );

    // Sort by task count
    memberStats.sort((a, b) => b.tasksCompleted - a.tasksCompleted);

    // Get task frequency stats
    const taskFrequency = new Map<string, number>();

    for (const completion of weeklyCompletions) {
      const count = taskFrequency.get(completion.taskId) ?? 0;
      taskFrequency.set(completion.taskId, count + 1);
    }

    // Get most and least completed tasks
    const sortedTasks = Array.from(taskFrequency.entries()).sort(
      (a, b) => b[1] - a[1]
    );

    const mostCompletedTasks = await Promise.all(
      sortedTasks.slice(0, 5).map(async ([taskId, count]) => {
        const task = await ctx.db.get(taskId as any);
        return { task, completionCount: count };
      })
    );

    const leastCompletedTasks = await Promise.all(
      sortedTasks.slice(-5).reverse().map(async ([taskId, count]) => {
        const task = await ctx.db.get(taskId as any);
        return { task, completionCount: count };
      })
    );

    return {
      totalCompletions: weeklyCompletions.length,
      memberStats,
      mostCompletedTasks,
      leastCompletedTasks,
      dailyAverage: Math.round(weeklyCompletions.length / 7),
    };
  },
});
