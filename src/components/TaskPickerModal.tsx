import {XIcon, CircleIcon} from 'lucide-react';
import {Dialog, DialogPortal} from "@/components/ui/dialog";
import {Doc} from "../../convex/_generated/dataModel";
import {useEffect} from "react";

interface TaskPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toDo: Doc<"tasks">[];
  frequentTasks: Doc<"tasks">[];
  otherTasks: Doc<"tasks">[];
  completionCounts: Map<string, number>;
  onTaskSelect: (task: Doc<"tasks">) => void;
}

interface TaskItemProps {
  task: Doc<"tasks">;
  onClick: () => void;
  subtitle: string;
  estimatedDuration?: number;
}

function TaskItem({task, onClick, subtitle, estimatedDuration}: TaskItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-gray-100/25 flex gap-2 p-1.5 border border-gray-300 rounded-full hover:bg-gray-100/50 transition-colors"
    >
      <div className="shrink-0 flex items-center justify-center size-12 bg-gray-500/10 rounded-full">
        <CircleIcon className="h-5 w-5 text-slate-400"/>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-base/6 font-medium text-slate-900 truncate">{task.title}</div>
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

function TaskSection({title, tasks, emptyMessage, onTaskClick, getSubtitle, estimatedDuration}: TaskSectionProps) {
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

export function TaskPickerModal({
  open,
  onOpenChange,
  toDo,
  frequentTasks,
  otherTasks,
  completionCounts,
  onTaskSelect,
}: TaskPickerModalProps) {
  const handleTaskClick = (task: Doc<"tasks">) => {
    onTaskSelect(task);
  };

  // Block body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        {/* Full-screen content without overlay */}
        <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden">
          {/* Fixed close bar */}
          <div className="fixed top-0 left-0 right-0 z-10 min-h-12 lg:min-h-16 bg-white/90 backdrop-blur-[2px] flex items-center justify-end px-4">
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
            >
              <XIcon className="h-6 w-6" />
              <span className="sr-only">Fermer</span>
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <div className="w-full max-w-md mx-auto pt-12 lg:pt-16 pb-8 px-4">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 px-2">
                Faire quelque chose
              </h2>

              <TaskSection
                title="À faire"
                tasks={toDo}
                emptyMessage="Aucune tâche avec échéance pour le moment"
                onTaskClick={handleTaskClick}
                getSubtitle={(task) =>
                  task.scheduling?.dueDate ? formatDueDate(task.scheduling.dueDate) : ""
                }
                estimatedDuration={15}
              />

              <TaskSection
                title="Vous faites souvent"
                tasks={frequentTasks}
                emptyMessage="Aucune tâche fréquente pour le moment"
                onTaskClick={handleTaskClick}
                getSubtitle={(task) => {
                  const count = completionCounts.get(task._id) || 0;
                  return `Vous l'avez fait ${count} fois`;
                }}
                estimatedDuration={10}
              />

              <TaskSection
                title="Vous pourriez faire"
                tasks={otherTasks}
                emptyMessage="Aucune autre tâche disponible"
                onTaskClick={handleTaskClick}
                getSubtitle={(task) => {
                  const count = completionCounts.get(task._id) || 0;
                  return count === 0 ? "Vous ne l'avez jamais fait" : `Vous l'avez fait ${count} fois`;
                }}
                estimatedDuration={10}
              />
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
