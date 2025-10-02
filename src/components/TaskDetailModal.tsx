import {XIcon, CheckIcon} from 'lucide-react';
import {Dialog, DialogPortal} from "@/components/ui/dialog";
import {Doc, Id} from "../../convex/_generated/dataModel";
import {useEffect, useState} from "react";
import {useMutation} from "convex/react";
import {api} from "../../convex/_generated/api";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {pushModal, popModal} from "@/lib/modalStack";

interface TaskDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Doc<"tasks"> | null;
  activeMemberId?: Id<"householdMembers">;
  onTaskCompleted?: () => void;
}

type DurationOption = '5' | '15' | '30' | '60' | 'custom';

export function TaskDetailModal({
  open,
  onOpenChange,
  task,
  activeMemberId,
  onTaskCompleted,
}: TaskDetailModalProps) {
  const [selectedDuration, setSelectedDuration] = useState<DurationOption | null>(null);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeTask = useMutation(api.tasks.completeTask);
  const assignTask = useMutation(api.tasks.assignTask);

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (open && task) {
      setSelectedDuration(null);
      setCustomDuration('');
      setNotes('');
      setShowNotes(false);
      setIsSubmitting(false);
    }
  }, [open, task]);

  // Block body scroll when modal is open
  useEffect(() => {
    if (open) {
      pushModal();
    }
    return () => {
      if (open) {
        popModal();
      }
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

    // Validate custom duration if selected
    if (selectedDuration === 'custom' && !customDuration) {
      alert('Veuillez saisir une durée');
      return;
    }

    // Get the duration value in minutes
    let durationInMinutes: number | undefined;
    if (selectedDuration && selectedDuration !== 'custom') {
      durationInMinutes = parseInt(selectedDuration, 10);
    } else if (selectedDuration === 'custom' && customDuration) {
      durationInMinutes = parseInt(customDuration, 10);
    }

    setIsSubmitting(true);
    try {
      await completeTask({
        taskId: task._id,
        completedBy: activeMemberId,
        duration: durationInMinutes,
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
              <div className="-mx-4 p-4 pb-6 bg-gray-50 rounded-lg space-y-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Vous l'avez fait ?
                </h3>

                {/* Duration selection */}
                <div>
                  <Label className="block mb-3">Temps passé</Label>

                  {/* Quick duration buttons */}
                  <div className="grid grid-cols-5 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDuration('5')}
                      className={`px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                        selectedDuration === '5'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      5mn
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDuration('15')}
                      className={`px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                        selectedDuration === '15'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      15mn
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDuration('30')}
                      className={`px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                        selectedDuration === '30'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      30mn
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDuration('60')}
                      className={`px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                        selectedDuration === '60'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      1h
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDuration('custom')}
                      className={`px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                        selectedDuration === 'custom'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Autre
                    </button>
                  </div>

                  {/* Custom duration input - shown only when "Autre" is selected */}
                  {selectedDuration === 'custom' && (
                    <div className="flex gap-2 items-center justify-center pt-2">
                      <Input
                        id="custom-duration"
                        type="number"
                        min="1"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                        className="w-20 bg-white text-base h-11"
                        autoFocus
                      />
                      <span className="text-base text-slate-500 font-medium">minutes</span>
                    </div>
                  )}
                </div>

                {/* Notes toggle/input */}
                <div>
                  {!showNotes ? (
                    <button
                      onClick={() => setShowNotes(true)}
                      className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      + Ajouter une note
                    </button>
                  ) : (
                    <>
                      <Label htmlFor="notes" className="block mb-3">Note</Label>
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
                  <CheckIcon className="h-5 w-5" />
                  <span>C'est fait</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
