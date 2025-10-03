import {useQuery} from "convex/react";
import {api} from "../../convex/_generated/api";
import {Id} from "../../convex/_generated/dataModel";
import {formatCompletionDate} from "@/lib/utils";
import {CheckIcon} from 'lucide-react';
import {Page} from "@/components/Page.tsx";
import {AuthenticatedHeader} from "@/components/AuthenticatedHeader.tsx";
import {Link} from "react-router-dom";

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

interface TaskCompletionItemProps {
  taskTitle: string;
  completedAt: number;
  memberName: string;
  duration?: number;
}

function TaskCompletionItem({
  taskTitle,
  completedAt,
  memberName,
  duration,
}: TaskCompletionItemProps) {
  return (
    <div className="bg-white/80 flex gap-2 p-1.5 border border-gray-300 rounded-full">
      <div className="shrink-0 flex items-center justify-center size-12 bg-gray-100/10 rounded-full">
        <CheckIcon className="h-5 w-5 text-lime-500"/>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm/6 font-medium text-slate-900 truncate">{taskTitle}</div>
        <div className="flex items-baseline gap-1.5 text-sm text-slate-500">
          <span>{memberName}</span>
          <span>•</span>
          <span className="text-sm text-slate-500">
            {formatCompletionDate(completedAt)}
          </span>
        </div>
      </div>
      <div className="shrink-0 flex items-center justify-center size-12 xbg-gray-300/10 rounded-full">
        {duration && <span className="text-xs text-slate-500">{duration} mn</span>}
      </div>
    </div>
  );
}

function getDynamicTitle(recentCompletions: any[]): string {
  if (recentCompletions.length === 0) {
    return "Il ne s'est encore rien passé";
  }

  const lastCompletion = recentCompletions[0];
  const daysSinceLastCompletion = Math.floor(
    (Date.now() - lastCompletion.completedAt) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastCompletion > 7) {
    return "C'est trop calme ici !";
  } else if (daysSinceLastCompletion > 2) {
    return "Vous n'avez rien oublié ?";
  } else {
    return "Ça bosse dur 👍";
  }
}

export function HouseholdDashboard({household}: HouseholdDashboardProps) {
  const recentCompletions = useQuery(api.taskCompletions.getRecentCompletions, {
    householdId: household.id,
  });

  if (recentCompletions === undefined) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto"></div>
        </div>
      </div>
    );
  }

  const title = getDynamicTitle(recentCompletions);

  return (
    <Page>
      <AuthenticatedHeader />

      <div className="px-4 w-full max-w-2xl mx-auto">
        {/* Action section with "Faire quelque chose" button */}
        <div className="flex items-center justify-center min-h-[300px] mb-8">
          <Link
            to="/get-it-done"
            className="px-8 py-4 text-xl font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors shadow-md"
          >
            Faire quelque chose
          </Link>
        </div>

        <h2 className="text-center text-2xl font-semibold text-slate-900 mb-8">{title}</h2>

        {recentCompletions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Commencez par créer des tâches</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentCompletions.map((completion) => (
              <TaskCompletionItem
                key={completion._id}
                taskTitle={completion.task?.title || "Tâche supprimée"}
                completedAt={completion.completedAt}
                memberName={completion.member?.firstName || "Membre inconnu"}
                duration={completion.duration}
              />
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
