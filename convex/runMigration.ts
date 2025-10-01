import { mutation } from "./_generated/server";

// Temporary migration runner - delete this file after running
export const runMigration = mutation({
  args: {},
  handler: async (ctx) => {
    const members = await ctx.db.query("householdMembers").collect();

    let migratedCount = 0;
    let deletedCount = 0;

    for (const member of members) {
      // If member doesn't have firstName or role, delete it (old data)
      if (!member.firstName || !member.role) {
        console.log(`Deleting old member: ${member._id}`);
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
      message: `Migration complete: ${deletedCount} old members deleted, ${migratedCount} members kept`,
    };
  },
});
