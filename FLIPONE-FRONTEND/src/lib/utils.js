import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge class names; later Tailwind utilities win over earlier ones (shadcn/ui convention). */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
