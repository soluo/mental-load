import {CheckIcon, PencilIcon} from 'lucide-react';
import {Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription} from "@/components/ui/drawer";
import {Id} from "../../convex/_generated/dataModel";
import {useEffect, useState} from "react";
import {useMutation, useQuery} from "convex/react";
import {api} from "../../convex/_generated/api";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {formatCompletionDate} from "@/lib/utils";

interface TaskCompletionViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  completionId: Id<"taskCompletions"> | null;
  activeMemberId?: Id<"householdMembers">;
}

type DurationOption = '5' | '15' | '30' | '60' | 'custom';

export function TaskCompletionViewer({
  open,
  onOpenChange,
  completionId,
  activeMemberId,
}: TaskCompletionViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<DurationOption | null>(null);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completion = useQuery(
    api.taskCompletions.getTaskCompletionDetails,
    completionId ? { completionId } : "skip"
  );
  const updateCompletion = useMutation(api.taskCompletions.updateTaskCompletion);

  // Initialize form when completion data loads
  useEffect(() => {
    if (completion) {
      setNotes(completion.notes || '');

      // Set duration
      if (completion.duration) {
        const presetDurations = [5, 15, 30, 60];
        if (presetDurations.includes(completion.duration)) {
          setSelectedDuration(completion.duration.toString() as DurationOption);
          setCustomDuration('');
        } else {
          setSelectedDuration('custom');
          setCustomDuration(completion.duration.toString());
        }
      } else {
        setSelectedDuration(null);
        setCustomDuration('');
      }
    }
  }, [completion]);

  // Reset edit mode when drawer closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false);
    }
  }, [open]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        if (isEditing) {
          setIsEditing(false);
        } else {
          onOpenChange(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, isEditing, onOpenChange]);

  const handleSave = async () => {
    if (!completionId) return;

    // Get the duration value in minutes
    let durationInMinutes: number | undefined;
    if (selectedDuration && selectedDuration !== 'custom') {
      durationInMinutes = parseInt(selectedDuration, 10);
    } else if (selectedDuration === 'custom' && customDuration) {
      durationInMinutes = parseInt(customDuration, 10);
    }

    setIsSubmitting(true);
    try {
      await updateCompletion({
        completionId,
        duration: durationInMinutes,
        notes: notes || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating completion:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!completion) return null;

  const canEdit = activeMemberId === completion.completedBy;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent>
        <div className="w-full max-w-md mx-auto px-4">
          <DrawerHeader className="px-0">
            <DrawerTitle className="text-2xl mb-2">
              {completion.task?.title || "Tâche supprimée"}
            </DrawerTitle>
            {completion.task?.description && (
              <DrawerDescription className="text-slate-600 text-base leading-relaxed">
                {completion.task.description}
              </DrawerDescription>
            )}
          </DrawerHeader>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
              {completion.task?.type === 'one-time' ? 'Tâche unique' : 'Tâche flexible'}
            </span>
            <span className="text-xs px-2 py-1 bg-lime-100 text-lime-700 rounded-full flex items-center gap-1">
              <CheckIcon size={12}/>
              {completion.member?.firstName || "Membre inconnu"} • {formatCompletionDate(completion.completedAt)}
            </span>
          </div>

          {/* View or Edit Mode */}
          <div className="-mx-4 p-4 pb-6 mt-6 bg-gray-50 rounded-lg space-y-6">
            {!isEditing ? (
              <>
                {/* View mode */}
                <div className="space-y-4">
                  {completion.duration && (
                    <div>
                      <Label className="block mb-1 text-slate-600">Temps passé</Label>
                      <p className="text-lg font-medium">{completion.duration} minutes</p>
                    </div>
                  )}

                  {completion.notes && (
                    <div>
                      <Label className="block mb-1 text-slate-600">Note</Label>
                      <p className="text-base text-slate-900 whitespace-pre-wrap">{completion.notes}</p>
                    </div>
                  )}

                  {!completion.duration && !completion.notes && (
                    <p className="text-slate-500 text-sm">Aucun détail supplémentaire</p>
                  )}
                </div>

                {canEdit && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Modifier</span>
                  </Button>
                )}
              </>
            ) : (
              <>
                {/* Edit mode */}
                <h3 className="text-lg font-semibold text-slate-900">
                  Modifier les détails
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

                  {/* Custom duration input */}
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

                {/* Notes input */}
                <div>
                  <Label htmlFor="notes" className="block mb-3">Note</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ajoutez des détails sur cette réalisation..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="flex-1"
                    size="lg"
                  >
                    <CheckIcon className="h-5 w-5" />
                    <span>Enregistrer</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
