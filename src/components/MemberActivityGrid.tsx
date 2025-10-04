import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { MemberActivityCard } from "@/components/MemberActivityCard";

interface MemberActivityGridProps {
  householdId: Id<"households">;
}

export function MemberActivityGrid({ householdId }: MemberActivityGridProps) {
  const membersActivity = useQuery(api.taskCompletions.getMembersDailyActivity, {
    householdId,
  });

  if (membersActivity === undefined) {
    return (
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-32 rounded-lg border border-foreground/10 bg-transparent animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (membersActivity.length === 0) {
    return null;
  }

  // Calculate global max minutes across all members and days
  const maxMinutes = Math.max(
    ...membersActivity.flatMap((member) =>
      member.dailyStats.map((stat) => stat.minutes)
    ),
    1 // Ensure at least 1 to avoid division by zero
  );

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {membersActivity.map((member) => (
        <MemberActivityCard
          key={member.memberId}
          firstName={member.firstName}
          color={member.color}
          dailyStats={member.dailyStats}
          maxMinutes={maxMinutes}
        />
      ))}
    </div>
  );
}
