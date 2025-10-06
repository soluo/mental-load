import {useQuery} from "convex/react";
import {api} from "../../convex/_generated/api";
import {Id} from "../../convex/_generated/dataModel";
import {formatCompletionDate, cn} from "@/lib/utils";
import {CheckIcon} from 'lucide-react';
import {Page} from "@/components/Page.tsx";
import {Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemGroup} from "@/components/ui/item";
import {useState, useRef} from "react";
import {TaskCompletionViewer} from "@/components/TaskCompletionViewer";
import {useActiveMember} from "@/contexts/MemberContext";
import {MemberActivityGrid} from "@/components/MemberActivityGrid";
import {IOSHeader} from "@/components/IOSHeader";
import {useIOSHeaderScroll} from "@/hooks/useIOSHeaderScroll";

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
  onClick: () => void;
}

function TaskCompletionItem({
  taskTitle,
  completedAt,
  memberName,
  duration,
  onClick,
}: TaskCompletionItemProps) {
  return (
    <Item asChild variant="outline" className="bg-white" size="sm">
      <button onClick={onClick} className="w-full text-left">
        <ItemMedia>
          <CheckIcon size={20} className="text-lime-500"/>
        </ItemMedia>

        <ItemContent className="gap-0">
          <ItemTitle className="leading-6">{taskTitle}</ItemTitle>
          <ItemDescription className="leading-5">
            {memberName} • {formatCompletionDate(completedAt)}
          </ItemDescription>
        </ItemContent>
        {duration && (
          <ItemActions>
            <span className="text-xs text-muted-foreground">{duration} mn</span>
          </ItemActions>
        )}
      </button>
    </Item>
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
  const { activeMemberId } = useActiveMember();
  const [selectedCompletionId, setSelectedCompletionId] = useState<Id<"taskCompletions"> | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const titleRef = useRef<HTMLSpanElement>(null);
  const { isHeaderVisible, headerRef } = useIOSHeaderScroll(titleRef);

  const recentCompletions = useQuery(api.taskCompletions.getRecentCompletions, {
    householdId: household.id,
  });

  if (recentCompletions === undefined) {
    return (
      <Page>
        <div className="flex justify-center items-center h-dvh">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Page>
    );
  }

  const title = getDynamicTitle(recentCompletions);

  const handleCompletionClick = (completionId: Id<"taskCompletions">) => {
    setSelectedCompletionId(completionId);
    setIsViewerOpen(true);
  };

  return (
    <Page className="pt-[calc(env(safe-area-inset-top)+48px)] pb-8">
      <IOSHeader
        title="Activité"
        headerRef={headerRef}
        isHeaderVisible={isHeaderVisible}
      />

      <div className="pt-4 px-4 w-full max-w-lg mx-auto">
        <h1 className={cn("text-3xl font-bold text-stone-950 mb-6", isHeaderVisible && "invisible")}>
          <span ref={titleRef} className="inline-block leading-none">Activité</span>
        </h1>

        {/* Member activity stats */}
        <MemberActivityGrid householdId={household.id} />

        <h2 className="text-2xl font-semibold text-slate-900 mb-8">{title}</h2>

        {recentCompletions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Commencez par créer des tâches</p>
          </div>
        ) : (
          <ItemGroup className="space-y-2">
            {recentCompletions.map((completion) => (
              <TaskCompletionItem
                key={completion._id}
                taskTitle={completion.task?.title || "Tâche supprimée"}
                completedAt={completion.completedAt}
                memberName={completion.member?.firstName || "Membre inconnu"}
                duration={completion.duration}
                onClick={() => handleCompletionClick(completion._id)}
              />
            ))}
          </ItemGroup>
        )}
      </div>

      {/* Task Completion Viewer */}
      <TaskCompletionViewer
        open={isViewerOpen}
        onOpenChange={setIsViewerOpen}
        completionId={selectedCompletionId}
        activeMemberId={activeMemberId || undefined}
      />
    </Page>
  );
}
