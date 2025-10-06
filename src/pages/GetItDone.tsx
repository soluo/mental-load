import { CircleIcon } from 'lucide-react';
import { Doc, Id } from "../../convex/_generated/dataModel";
import { Page } from "@/components/Page";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useActiveMember } from "@/contexts/MemberContext";
import { useState, useRef } from "react";
import { TaskCompletionDetail } from "@/components/TaskCompletionDetail";
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemGroup } from "@/components/ui/item";
import { IOSHeader } from "@/components/IOSHeader";
import { useIOSHeaderScroll } from "@/hooks/useIOSHeaderScroll";
import { cn } from "@/lib/utils";

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

interface GetItDoneProps {
  household: Household;
}

interface TaskItemProps {
  task: Doc<"tasks">;
  onClick: () => void;
  subtitle: string;
  estimatedDuration?: number;
}

function TaskItem({ task, onClick, subtitle, estimatedDuration }: TaskItemProps) {
  return (
    <Item asChild variant="outline" size="sm">
      <button onClick={onClick} className="w-full text-left bg-white">
        <ItemMedia>
          <CircleIcon size={20} className="text-primary" />
        </ItemMedia>
        <ItemContent className="gap-0">
          <ItemTitle className="leading-6">{task.title}</ItemTitle>
          <ItemDescription className="leading-5">{subtitle}</ItemDescription>
        </ItemContent>
        {estimatedDuration && (
          <ItemActions>
            <span className="text-xs text-muted-foreground">~{estimatedDuration} mn</span>
          </ItemActions>
        )}
      </button>
    </Item>
  );
}

function formatDueDate(dueDate: number): string {
  const date = new Date(dueDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Reset time parts for comparison
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const tomorrowDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

  if (dateDay.getTime() === todayDay.getTime()) {
    return "Aujourd'hui";
  } else if (dateDay.getTime() === tomorrowDay.getTime()) {
    return "Demain";
  } else {
    // Format: "Lundi 15 janv."
    const dayName = date.toLocaleDateString("fr-FR", { weekday: "long" });
    const dayNum = date.getDate();
    const monthShort = date.toLocaleDateString("fr-FR", { month: "short" });

    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dayNum} ${monthShort}`;
  }
}

interface TaskSectionProps {
  title: string;
  tasks: Doc<"tasks">[];
  emptyMessage: string;
  onTaskClick: (task: Doc<"tasks">) => void;
  getSubtitle: (task: Doc<"tasks">) => string;
}

function TaskSection({ title, tasks, emptyMessage, onTaskClick, getSubtitle }: TaskSectionProps) {
  return (
    <div className="mb-8">
      <h3 className="sticky z-10 top-[calc(env(safe-area-inset-top)+48px)] bg-background text-xs uppercase text-primary pt-2 pb-3 px-2">{title}</h3>
      {tasks.length === 0 ? (
        <p className="text-slate-500 text-sm px-2">{emptyMessage}</p>
      ) : (
        <ItemGroup className="space-y-2">
          {tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onClick={() => onTaskClick(task)}
              subtitle={getSubtitle(task)}
              estimatedDuration={task.estimatedDuration}
            />
          ))}
        </ItemGroup>
      )}
    </div>
  );
}

export function GetItDone({ household }: GetItDoneProps) {
  const { activeMemberId } = useActiveMember();
  const [selectedTask, setSelectedTask] = useState<Doc<"tasks"> | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const titleRef = useRef<HTMLSpanElement>(null);
  const { isHeaderVisible, headerRef } = useIOSHeaderScroll(titleRef);

  const tasksForPicker = useQuery(
    api.tasks.getTasksForPicker,
    activeMemberId
      ? {
          householdId: household.id,
          memberId: activeMemberId,
        }
      : "skip"
  );

  if (tasksForPicker === undefined) {
    return (
      <Page>
        <div className="flex justify-center items-center h-dvh">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Page>
    );
  }

  const handleTaskClick = (task: Doc<"tasks">) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleTaskCompleted = () => {
    setIsTaskDetailOpen(false);
  };

  return (
    <Page className="pt-[calc(env(safe-area-inset-top)+48px)] pb-8 isolate">
      <IOSHeader
        title="Faire quelque chose"
        headerRef={headerRef}
        isHeaderVisible={isHeaderVisible}
      />

      <div className="px-4 w-full max-w-lg mx-auto">
        <h1 className={cn("px-2 mb-8 text-3xl font-semibold text-stone-950", isHeaderVisible && "invisible")}>
          <span ref={titleRef} className="inline-block leading-none">Faire quelque chose</span>
        </h1>

        <TaskSection
          title="À faire"
          tasks={tasksForPicker.toDo}
          emptyMessage="Aucune tâche avec échéance pour le moment"
          onTaskClick={handleTaskClick}
          getSubtitle={(task) =>
            task.scheduling?.dueDate ? formatDueDate(task.scheduling.dueDate) : ""
          }
        />

        <TaskSection
          title="Vous faites souvent"
          tasks={tasksForPicker.frequentTasks}
          emptyMessage="Aucune tâche fréquente pour le moment"
          onTaskClick={handleTaskClick}
          getSubtitle={(task) => {
            const count = tasksForPicker.completionCounts[task._id] || 0;
            return `Vous l'avez fait ${count} fois`;
          }}
        />

        <TaskSection
          title="Vous pourriez faire"
          tasks={tasksForPicker.otherTasks}
          emptyMessage="Aucune autre tâche disponible"
          onTaskClick={handleTaskClick}
          getSubtitle={(task) => {
            const count = tasksForPicker.completionCounts[task._id] || 0;
            return count === 0 ? "Vous ne l'avez jamais fait" : `Vous l'avez fait ${count} fois`;
          }}
        />
      </div>

      {/* Task Completion Detail */}
      <TaskCompletionDetail
        open={isTaskDetailOpen}
        onOpenChange={setIsTaskDetailOpen}
        task={selectedTask}
        activeMemberId={activeMemberId || undefined}
        onTaskCompleted={handleTaskCompleted}
      />
    </Page>
  );
}
