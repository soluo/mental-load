import { internalMutation } from "../_generated/server";

// Migration script to update existing household members with firstName and role
// Run this manually from the Convex dashboard if you have existing data

export const migrateMembersSchema = internalMutation({
  args: {},
  handler: async (ctx) => {
    const members = await ctx.db.query("householdMembers").collect();

    let migratedCount = 0;
    let deletedCount = 0;

    for (const member of members) {
      // If member doesn't have firstName or role, delete it (old data)
      if (!member.firstName || !member.role) {
        await ctx.db.delete(member._id);
        deletedCount++;
      } else {
        migratedCount++;
      }
    }

    return {
      total: members.length,
      migrated: migratedCount,
      deleted: deletedCount,
    };
  },
});
