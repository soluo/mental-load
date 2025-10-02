import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

/**
 * List all household members (for debugging/setup)
 */
export const listHouseholdMembers = query({
  handler: async (ctx) => {
    const households = await ctx.db.query("households").collect();

    const result = [];
    for (const household of households) {
      const members = await ctx.db
        .query("householdMembers")
        .withIndex("by_household", (q) => q.eq("householdId", household._id))
        .collect();

      result.push({
        household: {
          _id: household._id,
          name: household.name,
        },
        members: members.map(m => ({
          _id: m._id,
          firstName: m.firstName,
          email: m.email,
          role: m.role,
        })),
      });
    }

    return result;
  },
});

/**
 * Seed tasks for testing
 * Creates sample flexible and one-time tasks with some completion history
 */
export const seedTasks = mutation({
  args: {
    memberId: v.id("householdMembers"),
  },
  handler: async (ctx, args) => {
    // Get the specified member
    const membership = await ctx.db.get(args.memberId);

    if (!membership) {
      throw new Error("Member not found");
    }

    const householdId = membership.householdId;

    // Get all household members for assigning completions
    const members = await ctx.db
      .query("householdMembers")
      .withIndex("by_household", (q) => q.eq("householdId", householdId))
      .collect();

    if (members.length === 0) {
      throw new Error("No members found in household");
    }

    // Define flexible tasks
    const flexibleTasks = [
      {
        title: "Vider le lave-vaisselle",
        description: "Ranger la vaisselle propre dans les placards",
      },
      {
        title: "Passer l'aspirateur",
        description: "Aspirer le salon et les chambres",
      },
      {
        title: "Sortir les poubelles",
        description: "Vider toutes les poubelles et sortir les sacs",
      },
      {
        title: "Nettoyer la salle de bain",
        description: "Nettoyer lavabo, douche et toilettes",
      },
      {
        title: "Faire les courses",
        description: "Acheter les produits de la liste de courses",
      },
      {
        title: "Laver les vitres",
        description: "Nettoyer les vitres du salon",
      },
      {
        title: "Arroser les plantes",
        description: "Arroser toutes les plantes d'intérieur",
      },
      {
        title: "Ranger le salon",
        description: "Remettre de l'ordre dans le salon",
      },
      {
        title: "Nettoyer la cuisine",
        description: "Nettoyer les surfaces et le plan de travail",
      },
      {
        title: "Faire la lessive",
        description: "Lancer une machine de linge",
      },
      {
        title: "Étendre le linge",
        description: "Étendre le linge propre",
      },
      {
        title: "Repasser",
        description: "Repasser les vêtements",
      },
      {
        title: "Changer les draps",
        description: "Mettre des draps propres dans les lits",
      },
      {
        title: "Nettoyer les toilettes",
        description: "Nettoyer et désinfecter les toilettes",
      },
      {
        title: "Passer la serpillière",
        description: "Laver le sol de la cuisine et de la salle de bain",
      },
    ];

    // Create flexible tasks
    const createdFlexibleTasks = [];
    for (const task of flexibleTasks) {
      const taskId = await ctx.db.insert("tasks", {
        householdId,
        title: task.title,
        description: task.description,
        type: "flexible",
        isActive: true,
        isCompleted: false,
        createdAt: Date.now(),
        createdBy: membership._id,
      });
      createdFlexibleTasks.push(taskId);
    }

    // Define one-time tasks
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const oneTimeTasks = [
      {
        title: "Acheter cadeau anniversaire Marie",
        description: "Trouver un cadeau pour l'anniversaire de Marie",
        dueDate: now + 5 * oneDay,
        showBeforeDays: 7,
      },
      {
        title: "Prendre RDV dentiste",
        description: "Appeler pour prendre rendez-vous chez le dentiste",
        dueDate: now + 10 * oneDay,
        showBeforeDays: 7,
      },
      {
        title: "Renouveler assurance habitation",
        description: "Contacter l'assurance pour le renouvellement",
        dueDate: now + 30 * oneDay,
        showBeforeDays: 14,
      },
    ];

    // Create one-time tasks
    for (const task of oneTimeTasks) {
      await ctx.db.insert("tasks", {
        householdId,
        title: task.title,
        description: task.description,
        type: "one-time",
        scheduling: {
          dueDate: task.dueDate,
          showBeforeDays: task.showBeforeDays,
        },
        isActive: true,
        isCompleted: false,
        createdAt: Date.now(),
        createdBy: membership._id,
      });
    }

    // Create some completion history for the past 7 days
    const completionsToCreate = [];

    // Randomly complete some tasks over the past week
    for (let daysAgo = 7; daysAgo >= 0; daysAgo--) {
      const date = now - daysAgo * oneDay;
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      // Pick 3-6 random tasks to complete each day
      const numCompletions = Math.floor(Math.random() * 4) + 3;

      for (let i = 0; i < numCompletions; i++) {
        const randomTaskId =
          createdFlexibleTasks[
            Math.floor(Math.random() * createdFlexibleTasks.length)
          ];
        const randomMember = members[Math.floor(Math.random() * members.length)];

        // Random time during the day (8am to 10pm)
        const randomHour = Math.floor(Math.random() * 14) + 8;
        const randomMinute = Math.floor(Math.random() * 60);
        const completedAt = new Date(startOfDay);
        completedAt.setHours(randomHour, randomMinute, 0, 0);

        completionsToCreate.push({
          taskId: randomTaskId,
          householdId,
          completedBy: randomMember._id,
          completedAt: completedAt.getTime(),
          forDate: startOfDay.getTime(),
          duration: Math.floor(Math.random() * 45) + 5, // 5-50 minutes
          wasLate: false,
        });
      }
    }

    // Insert all completions
    for (const completion of completionsToCreate) {
      await ctx.db.insert("taskCompletions", completion);
    }

    return {
      flexibleTasksCreated: createdFlexibleTasks.length,
      oneTimeTasksCreated: oneTimeTasks.length,
      completionsCreated: completionsToCreate.length,
    };
  },
});
