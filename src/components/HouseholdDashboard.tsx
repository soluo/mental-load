import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { formatCompletionDate } from "@/lib/utils";

interface Member {
  id: Id<"householdMembers">;
  userId?: Id<"users">;
  firstName: string;
  role: "adult" | "child";
  email?: string;
  joinedAt: number;
}

interface Household {
  id: Id<"households">;
  name: string;
  members: Member[];
}

interface HouseholdDashboardProps {
  household: Household;
}

export function HouseholdDashboard({ household }: HouseholdDashboardProps) {
  const recentCompletions = useQuery(api.taskCompletions.getRecentCompletions, {
    householdId: household.id,
  });

  if (recentCompletions === undefined) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          Dernières tâches réalisées
        </h2>

        {recentCompletions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">
              Il ne s'est encore rien passé
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentCompletions.map((completion) => (
              <div
                key={completion._id}
                className="flex items-start justify-between py-3 border-b border-slate-100 last:border-b-0"
              >
                <div className="flex-1">
                  <div className="flex items-baseline gap-3">
                    <span className="font-medium text-slate-900">
                      {completion.task?.title || "Tâche supprimée"}
                    </span>
                    <span className="text-sm text-slate-500">
                      {formatCompletionDate(completion.completedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                    <span>
                      par : {completion.member?.firstName || "Membre inconnu"}
                    </span>
                    {completion.duration && (
                      <span>durée : {completion.duration} minutes</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
