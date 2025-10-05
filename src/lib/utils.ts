import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a timestamp to a human-readable date
 * Returns "Aujourd'hui", "Hier", or a formatted date
 */
export function formatCompletionDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time parts for comparison
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  if (dateDay.getTime() === todayDay.getTime()) {
    return "Aujourd'hui";
  } else if (dateDay.getTime() === yesterdayDay.getTime()) {
    return "Hier";
  } else {
    // Format: "Lundi 15 janv."
    const dayName = date.toLocaleDateString("fr-FR", { weekday: "long" });
    const dayNum = date.getDate();
    const monthShort = date.toLocaleDateString("fr-FR", { month: "short" });

    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dayNum} ${monthShort}`;
  }
}

/**
 * Trigger haptic feedback on mobile devices
 * @param duration - Duration in milliseconds (default: 10ms for a light tap)
 */
export function hapticFeedback(duration = 10): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration);
  }
}
