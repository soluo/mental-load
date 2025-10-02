import {XIcon, CheckIcon} from 'lucide-react';
import {Dialog, DialogPortal} from "@/components/ui/dialog";
import {Doc, Id} from "../../convex/_generated/dataModel";
import {useEffect, useState} from "react";
import {useMutation} from "convex/react";
import {api} from "../../convex/_generated/api";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";

interface TaskDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Doc<"tasks"> | null;
  activeMemberId?: Id<"householdMembers">;
  onTaskCompleted?: () => void;
}

export function TaskDetailModal({
  open,
  onOpenChange,
  task,
  activeMemberId,
  onTaskCompleted,
}: TaskDetailModalProps) {
  const [duration, setDuration] = useState<string>('');
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeTask = useMutation(api.tasks.completeTask);
  const assignTask = useMutation(api.tasks.assignTask);

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (open && task) {
      setDuration('');
      setNotes('');
      setShowNotes(false);
      setIsSubmitting(false);
    }
  }, [open, task]);

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

  const handleAssignTask = async () => {
    if (!task || !activeMemberId) return;

    setIsSubmitting(true);
    try {
      await assignTask({
        taskId: task._id,
        assignedTo: activeMemberId,
      });
    } catch (error) {
      console.error('Error assigning task:', error);
      alert('Erreur lors de l\'attribution de la tâche');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!task || !activeMemberId) return;

    setIsSubmitting(true);
    try {
      await completeTask({
        taskId: task._id,
        completedBy: activeMemberId,
        duration: duration ? parseInt(duration, 10) : undefined,
        notes: notes || undefined,
      });
      if (onTaskCompleted) {
        onTaskCompleted();
      } else {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Erreur lors de la complétion de la tâche');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task) return null;

  const isAssigned = task.assignedTo === activeMemberId;
  const canAssign = task.type === 'one-time' && !task.assignedTo && !task.isCompleted && activeMemberId;

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
              {/* Task header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {task.title}
                </h2>
                {task.description && (
                  <p className="text-slate-600 text-base leading-relaxed">
                    {task.description}
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                    {task.type === 'one-time' ? 'Tâche unique' : 'Tâche flexible'}
                  </span>
                  {isAssigned && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      Vous êtes assigné
                    </span>
                  )}
                </div>
              </div>

              {/* Assign button for one-time tasks */}
              {canAssign && (
                <div className="mb-8">
                  <Button
                    onClick={handleAssignTask}
                    disabled={isSubmitting}
                    className="w-full"
                    variant="outline"
                  >
                    Je m'en occupe
                  </Button>
                </div>
              )}

              {/* Completion form */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Marquer comme terminée
                </h3>

                {/* Duration input */}
                <div className="space-y-2">
                  <Label htmlFor="duration">Temps passé (optionnel)</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      placeholder="15"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="flex-1"
                    />
                    <span className="text-sm text-slate-500">minutes</span>
                  </div>
                </div>

                {/* Notes toggle/input */}
                <div className="space-y-2">
                  {!showNotes ? (
                    <button
                      onClick={() => setShowNotes(true)}
                      className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      + Ajouter une note
                    </button>
                  ) : (
                    <>
                      <Label htmlFor="notes">Note</Label>
                      <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ajoutez des détails sur cette réalisation..."
                        className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
                      />
                    </>
                  )}
                </div>

                {/* Submit button */}
                <Button
                  onClick={handleCompleteTask}
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Terminer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
