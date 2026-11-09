import { cn } from "@/lib/utils"

/* Paper-2 block with a gentle pulse (frozen under prefers-reduced-motion by index.css). */
function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-paper-2", className)}
      {...props}
    />
  )
}

export { Skeleton }
