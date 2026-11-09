import { cn } from "@/lib/utils";

/**
 * Shared SVG frame for the FlipOne line illustrations: 160x120 viewBox, ink 1.75px round strokes, no fill.
 * Decorative by default (aria-hidden); pass `title` to expose it as an image.
 */
export default function IllustrationFrame({ title, className, children }) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      stroke="#17150F"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-[120px] w-40 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {children}
    </svg>
  );
}
