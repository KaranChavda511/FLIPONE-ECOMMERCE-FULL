import { cn } from "@/lib/utils"
import { fieldClasses } from "@/components/ui/input"

function Textarea({
  className,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldClasses, "flex field-sizing-content min-h-24 py-2.5 leading-normal", className)}
      {...props}
    />
  )
}

export { Textarea }
