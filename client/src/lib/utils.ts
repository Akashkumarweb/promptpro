import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const audienceOptions = [
  { value: "general", label: "General audience" },
  { value: "technical", label: "Technical professionals" },
  { value: "business", label: "Business leaders" },
  { value: "creative", label: "Creative professionals" },
  { value: "academic", label: "Academic/Educational" },
  { value: "marketing", label: "Marketing specialists" },
];

export const focusAreaOptions = [
  { value: "specificity", label: "Specificity" },
  { value: "clarity", label: "Clarity" },
  { value: "cta", label: "CTAs (Calls to Action)" },
  { value: "conciseness", label: "Conciseness" },
  { value: "engagement", label: "Engagement" },
];

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function formatDate(date: Date | string): string {
  if (!date) return "";
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
