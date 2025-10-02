import { Doc } from "../_generated/dataModel";

/**
 * Returns the timestamp for the start of today (00:00:00)
 */
export function getStartOfDay(date: Date = new Date()): number {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay.getTime();
}

/**
 * Returns the timestamp for the end of today (23:59:59.999)
 */
export function getEndOfDay(date: Date = new Date()): number {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.getTime();
}

/**
 * Determines if a task should be visible today based on its type and scheduling
 */
export function isTaskVisibleToday(
  task: Doc<"tasks">,
  isCompletedToday: boolean
): boolean {
  // Inactive tasks are never visible
  if (!task.isActive) return false;

  if (task.type === "flexible") {
    // Flexible tasks are visible if not completed today
    return !isCompletedToday;
  } else {
    // One-time tasks
    // If already completed, never visible
    if (task.isCompleted) return false;

    const dueDate = task.scheduling?.dueDate;
    if (!dueDate) return true; // No due date = always visible

    const showBeforeDays = task.scheduling?.showBeforeDays ?? 7;
    const daysToDue = Math.ceil((dueDate - Date.now()) / (1000 * 60 * 60 * 24));

    // Visible if within the visibility window or past due
    return daysToDue <= showBeforeDays;
  }
}

/**
 * Checks if a one-time task is overdue
 */
export function isTaskOverdue(task: Doc<"tasks">): boolean {
  if (task.type !== "one-time") return false;
  if (task.isCompleted) return false;

  const dueDate = task.scheduling?.dueDate;
  if (!dueDate) return false;

  return Date.now() > dueDate;
}

/**
 * Calculates the number of days since the last completion
 */
export function calculateDaysSinceLastCompletion(
  lastCompletionTimestamp: number | null | undefined
): number | null {
  if (!lastCompletionTimestamp) return null;

  const daysSince = Math.floor(
    (Date.now() - lastCompletionTimestamp) / (1000 * 60 * 60 * 24)
  );

  return daysSince;
}

/**
 * Calculates if a task completion was late and by how many days
 */
export function calculateLateness(
  task: Doc<"tasks">,
  completionTimestamp: number
): { wasLate: boolean; daysLate?: number } {
  if (task.type !== "one-time") {
    return { wasLate: false };
  }

  const dueDate = task.scheduling?.dueDate;
  if (!dueDate) {
    return { wasLate: false };
  }

  const wasLate = completionTimestamp > dueDate;
  const daysLate = wasLate
    ? Math.ceil((completionTimestamp - dueDate) / (1000 * 60 * 60 * 24))
    : undefined;

  return { wasLate, daysLate };
}
