import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a date string (YYYY-MM-DD) manually to avoid timezone issues.
 * This prevents dates from being shifted by one day due to UTC conversion.
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object with the correct local date
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}
