import { cn } from "@/lib/utils"

/*
 * Mock-up `.inp`: 44px, 1.5px control border (3.7:1 on white), surface fill.
 * Hover darkens the border, focus turns it ink with the shared 2px ring; aria-invalid paints it danger.
 */
const fieldClasses = [
  "w-full min-w-0 rounded-md border-[1.5px] border-input bg-surface px-3 text-[15px] text-ink",
  "transition-[border-color,background-color] duration-150 ease-(--ease-out-quint)",
  "placeholder:text-muted-foreground hover:border-ink-2 focus:border-ink",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  "disabled:cursor-not-allowed disabled:border-line-soft disabled:bg-paper-2 disabled:text-muted-foreground",
  "aria-invalid:border-danger aria-invalid:bg-[#FFFBFB] aria-invalid:focus-visible:outline-danger",
].join(" ")

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        fieldClasses,
        "h-11 py-0",
        "file:mr-3 file:inline-flex file:h-8 file:items-center file:rounded-sm file:border-0 file:bg-paper-2 file:px-3 file:text-sm file:font-medium file:text-ink",
        type === "file" && "py-[5px]",
        className
      )}
      {...props}
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Input, fieldClasses }
