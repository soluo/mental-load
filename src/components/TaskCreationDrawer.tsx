import { CheckIcon, CalendarIcon, MinusIcon, PlusIcon } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Id } from "../../convex/_generated/dataModel";
import { ChangeEvent, useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface TaskCreationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId: Id<"households">;
}

export function TaskCreationDrawer({
  open,
  onOpenChange,
  householdId,
}: TaskCreationDrawerProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<'flexible' | 'one-time'>('flexible');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default date to today when switching to one-time
  useEffect(() => {
    if (taskType === 'one-time' && !selectedDate) {
      setSelectedDate(new Date());
    }
  }, [taskType, selectedDate]);

  const createTask = useMutation(api.tasks.createTask);

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (!open) {
      setTitle('');
      setDescription('');
      setTaskType('flexible');
      setSelectedDate(undefined);
      setSelectedTime('');
      setEstimatedDuration(0);
      setIsSubmitting(false);
    }
  }, [open]);

  // Close drawer on Escape key
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

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Veuillez saisir un titre pour la tâche');
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate dueDate timestamp if date is set
      let dueDate: number | undefined;
      if (selectedDate) {
        const date = new Date(selectedDate);
        if (selectedTime) {
          const [hours, minutes] = selectedTime.split(':');
          date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        } else {
          // If no time specified, set to end of day
          date.setHours(23, 59, 59, 999);
        }
        dueDate = date.getTime();
      }

      await createTask({
        householdId,
        title: title.trim(),
        description: description.trim() || undefined,
        type: taskType,
        dueDate,
        estimatedDuration: estimatedDuration > 0 ? estimatedDuration : undefined,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Erreur lors de la création de la tâche');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateButton = (date: Date | undefined) => {
    if (!date) return "Aujourd'hui";

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time for comparison
    const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    if (dateDay.getTime() === todayDay.getTime()) {
      return "Aujourd'hui";
    } else if (dateDay.getTime() === tomorrowDay.getTime()) {
      return "Demain";
    } else {
      return format(date, "dd MMM", { locale: fr });
    }
  };

  // Calculate minimum date (7 days ago)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - 7);
  minDate.setHours(0, 0, 0, 0);

  // Handlers for duration increment/decrement
  const handleIncrement = () => {
    setEstimatedDuration((prev) => Math.min(prev + 5, 360));
  };

  const handleDecrement = () => {
    setEstimatedDuration((prev) => Math.max(prev - 5, 0));
  };

  const handleDurationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setEstimatedDuration(Math.min(Math.max(value, 0), 360));
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} repositionInputs={false}>
      <DrawerContent>
        <DrawerTitle className="sr-only">Créer une tâche</DrawerTitle>
        <DrawerDescription className="sr-only">
          Remplissez les informations pour créer une nouvelle tâche
        </DrawerDescription>
        <div className="w-full max-w-md mx-auto px-4 py-6 space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nom de la tâche"
              className="mt-2"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajoutez des détails..."
              className="mt-2 min-h-[80px]"
            />
          </div>

          {/* Task Type Toggle */}
          <div>
            <Label>Type de tâche</Label>
            <ToggleGroup
              type="single"
              value={taskType}
              onValueChange={(value) => {
                if (value) setTaskType(value as 'flexible' | 'one-time');
              }}
              className="mt-2 justify-start"
            >
              <ToggleGroupItem value="flexible" className="flex-1 rounded-md">
                Flexible
              </ToggleGroupItem>
              <ToggleGroupItem value="one-time" className="flex-1 rounded-md">
                Prévue
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Estimated Duration */}
          <div>
            <Label htmlFor="estimatedDuration">Durée estimée (optionnel)</Label>
            <InputGroup className="mt-2">
              <InputGroupAddon>
                <InputGroupButton
                  type="button"
                  size="icon-xs"
                  onClick={handleDecrement}
                  disabled={estimatedDuration === 0}
                >
                  <MinusIcon className="h-4 w-4" />
                </InputGroupButton>
              </InputGroupAddon>

              <InputGroupInput
                id="estimatedDuration"
                type="number"
                min="0"
                max="360"
                value={estimatedDuration || ''}
                onChange={handleDurationChange}
                onKeyDown={(e) => {
                  // Bloquer tout sauf les chiffres, backspace, delete, tab, arrows
                  if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                placeholder="En minutes"
                className="text-center"
              />

              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  size="icon-xs"
                  onClick={handleIncrement}
                  disabled={estimatedDuration >= 360}
                >
                  <PlusIcon className="h-4 w-4" />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>

          {/* Scheduling (only for one-time tasks) */}
          {taskType === 'one-time' && (
            <div className="flex gap-2">
              {/* Date Picker */}
              <div className="flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDateButton(selectedDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={{ before: minDate }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Picker */}
              <div className="flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {selectedTime || "Aucune"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <Input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !title.trim()}
            className="w-full"
            size="lg"
          >
            <CheckIcon className="h-5 w-5" />
            <span>Créer la tâche</span>
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
