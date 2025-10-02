import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import {
  getStartOfDay,
  isTaskVisibleToday,
  calculateDaysSinceLastCompletion,
  calculateLateness,
} from "./lib/taskHelpers";

/**
 * Get all available tasks for a household
 * Returns flexible tasks not completed today + one-time tasks in their visibility window
 */
export const getAvailableTasks = query({
  args: {
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // 1. Get all active tasks for the household
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_household_active", (q) =>
        q.eq("householdId", args.householdId).eq("isActive", true)
      )
      .collect();

    // 2. Get today's completions
    const startOfDay = getStartOfDay();

    const todayCompletions = await ctx.db
      .query("taskCompletions")
      .withIndex("by_household_date", (q) =>
        q.eq("householdId", args.householdId).gte("completedAt", startOfDay)
      )
      .collect();

    const todayCompletedTaskIds = new Set(
      todayCompletions.map((c) => c.taskId)
    );

    // 3. Filter visible tasks
    const visibleTasks = tasks.filter((task) => {
      const isCompletedToday = todayCompletedTaskIds.has(task._id);
      return isTaskVisibleToday(task, isCompletedToday);
    });

    // 4. Get recent completions for enrichment
    const recentCompletions = await ctx.db
      .query("taskCompletions")
      .withIndex("by_household_date", (q) => q.eq("householdId", args.householdId))
      .order("desc")
      .take(100);

    // 5. Enrich tasks with completion data
    const enrichedTasks = await Promise.all(
      visibleTasks.map(async (task) => {
        const taskCompletions = recentCompletions.filter(
          (c) => c.taskId === task._id
        );
        const lastCompletion = taskCompletions[0];

        let lastCompletedByMember = null;
        if (lastCompletion) {
          lastCompletedByMember = await ctx.db.get(lastCompletion.completedBy);
        }

        return {
          ...task,
          lastCompletedBy: lastCompletedByMember,
          lastCompletedAt: lastCompletion?.completedAt,
          completionCount: taskCompletions.length,
          daysSinceLastCompletion: calculateDaysSinceLastCompletion(
            lastCompletion?.completedAt
          ),
        };
      })
    );

    return enrichedTasks;
  },
});

/**
 * Get completion history for a specific task
 */
export const getTaskHistory = query({
  args: {
    taskId: v.id("tasks"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const limit = args.limit ?? 10;

    const completions = await ctx.db
      .query("taskCompletions")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("desc")
      .take(limit);

    // Enrich with member details
    const enrichedCompletions = await Promise.all(
      completions.map(async (completion) => {
        const member = await ctx.db.get(completion.completedBy);
        return {
          ...completion,
          completedByMember: member,
        };
      })
    );

    return enrichedCompletions;
  },
});

/**
 * Get daily stats for a household
 */
export const getDailyStats = query({
  args: {
    householdId: v.id("households"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const startOfDay = getStartOfDay();

    const todayCompletions = await ctx.db
      .query("taskCompletions")
      .withIndex("by_household_date", (q) =>
        q.eq("householdId", args.householdId).gte("completedAt", startOfDay)
      )
      .collect();

    // Group by member
    const statsByMember = new Map<string, number>();

    for (const completion of todayCompletions) {
      const count = statsByMember.get(completion.completedBy) ?? 0;
      statsByMember.set(completion.completedBy, count + 1);
    }

    // Enrich with member details
    const stats = await Promise.all(
      Array.from(statsByMember.entries()).map(async ([memberId, count]) => {
        const member = await ctx.db.get(memberId as any);
        return {
          member,
          tasksCompleted: count,
        };
      })
    );

    return {
      totalTasksToday: todayCompletions.length,
      statsByMember: stats,
    };
  },
});

/**
 * Create a new task
 */
export const createTask = mutation({
  args: {
    householdId: v.id("households"),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("flexible"), v.literal("one-time")),
    dueDate: v.optional(v.number()),
    showBeforeDays: v.optional(v.number()),
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

    // Build scheduling object if needed
    const scheduling =
      args.type === "one-time" && (args.dueDate || args.showBeforeDays)
        ? {
            dueDate: args.dueDate,
            showBeforeDays: args.showBeforeDays,
          }
        : undefined;

    const taskId = await ctx.db.insert("tasks", {
      householdId: args.householdId,
      title: args.title,
      description: args.description,
      type: args.type,
      scheduling,
      isActive: true,
      isCompleted: false,
      createdAt: Date.now(),
      createdBy: membership._id,
    });

    return await ctx.db.get(taskId);
  },
});

/**
 * Complete a task
 */
export const completeTask = mutation({
  args: {
    taskId: v.id("tasks"),
    completedBy: v.id("householdMembers"),
    notes: v.optional(v.string()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Verify the member belongs to the task's household
    const member = await ctx.db.get(args.completedBy);
    if (!member || member.householdId !== task.householdId) {
      throw new Error("Member does not belong to this household");
    }

    // Verify user has access to this household
    const userMembership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", task.householdId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!userMembership) {
      throw new Error("User is not a member of this household");
    }

    const completedAt = Date.now();
    const forDate = getStartOfDay();

    // Calculate if late (for one-time tasks)
    const { wasLate, daysLate } = calculateLateness(task, completedAt);

    // Create completion record
    await ctx.db.insert("taskCompletions", {
      taskId: args.taskId,
      householdId: task.householdId,
      completedBy: args.completedBy,
      completedAt,
      forDate,
      duration: args.duration,
      notes: args.notes,
      wasLate,
      daysLate,
    });

    // If one-time, mark as completed
    if (task.type === "one-time") {
      await ctx.db.patch(args.taskId, {
        isCompleted: true,
        completedAt,
      });
    }

    // Get completion stats for this week
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyCompletions = await ctx.db
      .query("taskCompletions")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .filter((q) => q.gte(q.field("completedAt"), weekAgo))
      .collect();

    return {
      success: true,
      completionsThisWeek: weeklyCompletions.length,
    };
  },
});

/**
 * Uncomplete a task (remove today's completion)
 */
export const uncompleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Verify user belongs to household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", task.householdId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!membership) {
      throw new Error("User is not a member of this household");
    }

    const startOfDay = getStartOfDay();

    // Find today's completion
    const todayCompletion = await ctx.db
      .query("taskCompletions")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .filter((q) => q.gte(q.field("completedAt"), startOfDay))
      .first();

    if (!todayCompletion) {
      throw new Error("No completion found for today");
    }

    // Delete the completion
    await ctx.db.delete(todayCompletion._id);

    // If one-time, mark as not completed
    if (task.type === "one-time") {
      await ctx.db.patch(args.taskId, {
        isCompleted: false,
        completedAt: undefined,
      });
    }

    return { success: true };
  },
});

/**
 * Update a task
 */
export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    showBeforeDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Verify user belongs to household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", task.householdId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!membership) {
      throw new Error("User is not a member of this household");
    }

    // Build updates
    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;

    // Update scheduling if provided
    if (args.dueDate !== undefined || args.showBeforeDays !== undefined) {
      updates.scheduling = {
        ...task.scheduling,
        dueDate: args.dueDate ?? task.scheduling?.dueDate,
        showBeforeDays: args.showBeforeDays ?? task.scheduling?.showBeforeDays,
      };
    }

    await ctx.db.patch(args.taskId, updates);

    return await ctx.db.get(args.taskId);
  },
});

/**
 * Delete a task (soft delete)
 */
export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Verify user belongs to household
    const membership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", task.householdId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!membership) {
      throw new Error("User is not a member of this household");
    }

    // Soft delete
    await ctx.db.patch(args.taskId, { isActive: false });

    return { success: true };
  },
});

/**
 * Assign a one-time task to a member
 */
export const assignTask = mutation({
  args: {
    taskId: v.id("tasks"),
    assignedTo: v.id("householdMembers"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.type !== "one-time") {
      throw new Error("Only one-time tasks can be assigned");
    }

    // Verify the member belongs to the task's household
    const member = await ctx.db.get(args.assignedTo);
    if (!member || member.householdId !== task.householdId) {
      throw new Error("Member does not belong to this household");
    }

    // Verify user has access to this household
    const userMembership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", task.householdId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!userMembership) {
      throw new Error("User is not a member of this household");
    }

    // Assign task to the specified member
    await ctx.db.patch(args.taskId, { assignedTo: args.assignedTo });

    return await ctx.db.get(args.taskId);
  },
});

/**
 * Get tasks for picker modal
 * Returns three categories: À faire, Vous faites souvent, Vous pourriez faire
 */
export const getTasksForPicker = query({
  args: {
    householdId: v.id("households"),
    memberId: v.id("householdMembers"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Verify the member belongs to the household
    const member = await ctx.db.get(args.memberId);
    if (!member || member.householdId !== args.householdId) {
      throw new Error("Member does not belong to this household");
    }

    // Verify user has access to this household
    const userMembership = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", args.householdId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!userMembership) {
      throw new Error("User is not a member of this household");
    }

    // Get all active tasks
    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_household_active", (q) =>
        q.eq("householdId", args.householdId).eq("isActive", true)
      )
      .collect();

    // Get today's completions for the active member
    const startOfDay = getStartOfDay();
    const todayCompletions = await ctx.db
      .query("taskCompletions")
      .withIndex("by_household_date", (q) =>
        q.eq("householdId", args.householdId).gte("completedAt", startOfDay)
      )
      .collect();

    // Filter today's completions to only those by the active member
    const todayMemberCompletions = todayCompletions.filter(
      (c) => c.completedBy === args.memberId
    );

    const todayCompletedTaskIds = new Set(
      todayMemberCompletions.map((c) => c.taskId)
    );

    // Get all completions for frequency analysis (for the active member)
    const allCompletions = await ctx.db
      .query("taskCompletions")
      .withIndex("by_member", (q) => q.eq("completedBy", args.memberId))
      .collect();

    // Count completions per task by current member
    const completionCountByTask = new Map<string, number>();
    for (const completion of allCompletions) {
      const count = completionCountByTask.get(completion.taskId) || 0;
      completionCountByTask.set(completion.taskId, count + 1);
    }

    // Categorize tasks
    const toDo = [];
    const frequentTasks = [];
    const otherTasks = [];

    for (const task of allTasks) {
      const isCompletedToday = todayCompletedTaskIds.has(task._id);

      if (task.type === "one-time") {
        // For one-time tasks, check visibility
        const isVisible = isTaskVisibleToday(task, isCompletedToday);
        if (!isVisible) continue;

        if (task.scheduling?.dueDate) {
          // À faire: one-time tasks with due date
          toDo.push(task);
        }
      } else if (task.type === "flexible") {
        // For flexible tasks, always show them (even if completed today)
        // Categorize by completion count
        const completionCount = completionCountByTask.get(task._id) || 0;
        if (completionCount > 2) {
          // Vous faites souvent: flexible tasks completed more than 2 times by member
          frequentTasks.push(task);
        } else {
          // Vous pourriez faire: flexible tasks completed 2 times or less
          otherTasks.push(task);
        }
      }
    }

    // Sort toDo by due date
    toDo.sort((a, b) => {
      const dateA = a.scheduling?.dueDate || 0;
      const dateB = b.scheduling?.dueDate || 0;
      return dateA - dateB;
    });

    // Sort frequentTasks by completion count (descending)
    frequentTasks.sort((a, b) => {
      const countA = completionCountByTask.get(a._id) || 0;
      const countB = completionCountByTask.get(b._id) || 0;
      return countB - countA;
    });

    return {
      toDo,
      frequentTasks,
      otherTasks,
      completionCounts: Object.fromEntries(completionCountByTask),
    };
  },
});
