import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getEnvironment() {
  return process.env.NODE_ENV === "production" ? "production" : "qa";
}

/** Formats a profile for display so repeated analyses of the same URL stay distinct (title + date). */
export function getProfileDisplayName(
  profile: { profileTitle: string; createdAt: Date | string },
  options?: { analysisDate?: Date | string },
): string {
  const date = options?.analysisDate ?? profile.createdAt;
  const d = typeof date === "string" ? new Date(date) : date;
  const dateStr = d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${profile.profileTitle} • ${dateStr}, ${timeStr}`;
}
