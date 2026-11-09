import { cn } from "@/lib/utils"
import { Separator as SeparatorPrimitive } from "radix-ui"

/* 1px rule in line-soft. Pass variant="dashed" for the tag's dashed tear line. */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  variant = "solid",
  ...props
}) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full",
        variant === "dashed"
          ? "border-line-mid data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-dashed data-[orientation=vertical]:border-l data-[orientation=vertical]:border-dashed"
          : "bg-line-soft data-[orientation=horizontal]:h-px data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
