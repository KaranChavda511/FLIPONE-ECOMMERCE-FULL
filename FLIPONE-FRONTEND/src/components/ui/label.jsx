import { cn } from "@/lib/utils"
import { Label as LabelPrimitive } from "radix-ui"

/* Mock-up `.fld label`: 13.5px Work Sans 600, 6px above the control. */
function Label({
  className,
  ...props
}) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-[13.5px] leading-tight font-semibold text-ink select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-60 peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
}

export { Label }
