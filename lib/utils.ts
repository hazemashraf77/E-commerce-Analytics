import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * shadcn/ui cn() utility (components.json).
 * clsx and tailwind-merge must be added via pnpm after pnpm install.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
