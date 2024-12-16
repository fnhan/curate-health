import { type ClassValue, clsx } from "clsx";
import { format, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getMostRecentPosts = (posts, count = 2) => {
  return [...posts]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, count);
};

export function formatDate(dateString: string) {
  const date = parseISO(dateString);
  return format(date, "LLLL	d, yyyy");
}
