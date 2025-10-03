import { CircleIcon } from 'lucide-react';
import { Doc, Id } from "../../convex/_generated/dataModel";
import { Page } from "@/components/Page";
import { AuthenticatedHeader } from "@/components/AuthenticatedHeader";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useActiveMember } from "@/contexts/MemberContext";
import { useState } from "react";
import { TaskDetailModal } from "@/components/TaskDetailModal";

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
    <button
      onClick={onClick}
      className="w-full text-left bg-gray-100/25 flex gap-2 p-1.5 border border-gray-300 rounded-full hover:bg-gray-100/50 transition-colors"
    >
      <div className="shrink-0 flex items-center justify-center size-12 bg-gray-500/10 rounded-full">
        <CircleIcon className="h-5 w-5 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm/6 font-medium text-slate-900 truncate">{task.title}</div>
        <div className="text-sm text-slate-500">
          {subtitle}
        </div>
      </div>
      <div className="shrink-0 flex items-center justify-center size-12 rounded-full">
        {estimatedDuration && <span className="text-xs text-slate-500">{estimatedDuration} mn</span>}
      </div>
    </button>
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
  estimatedDuration?: number;
}

function TaskSection({ title, tasks, emptyMessage, onTaskClick, getSubtitle, estimatedDuration }: TaskSectionProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-slate-900 mb-3 px-2">{title}</h3>
      {tasks.length === 0 ? (
        <p className="text-slate-500 text-sm px-2">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onClick={() => onTaskClick(task)}
              subtitle={getSubtitle(task)}
              estimatedDuration={estimatedDuration}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function GetItDone({ household }: GetItDoneProps) {
  const { activeMemberId } = useActiveMember();
  const [selectedTask, setSelectedTask] = useState<Doc<"tasks"> | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

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
        <AuthenticatedHeader />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
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
    <Page>
      <AuthenticatedHeader />

      <div className="w-full max-w-md mx-auto px-4 pb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 px-2">
          Faire quelque chose
        </h2>

        <TaskSection
          title="À faire"
          tasks={tasksForPicker.toDo}
          emptyMessage="Aucune tâche avec échéance pour le moment"
          onTaskClick={handleTaskClick}
          getSubtitle={(task) =>
            task.scheduling?.dueDate ? formatDueDate(task.scheduling.dueDate) : ""
          }
          estimatedDuration={15}
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
          estimatedDuration={10}
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
          estimatedDuration={10}
        />
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        open={isTaskDetailOpen}
        onOpenChange={setIsTaskDetailOpen}
        task={selectedTask}
        activeMemberId={activeMemberId || undefined}
        onTaskCompleted={handleTaskCompleted}
      />
    </Page>
  );
}
