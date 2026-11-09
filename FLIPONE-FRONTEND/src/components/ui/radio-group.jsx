import { cn } from "@/lib/utils"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

function RadioGroup({
  className,
  ...props
}) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

/* 18px radio, 1.5px control border; checked shows a tag-red dot (mock-up `.opt input` accent). */
function RadioGroupItem({
  className,
  ...props
}) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "relative aspect-square size-[18px] shrink-0 rounded-full border-[1.5px] border-input bg-surface transition-[border-color] duration-150 hover:border-ink",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger data-[state=checked]:border-red",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="absolute inset-0 grid place-items-center"
      >
        <span className="size-2 rounded-full bg-red" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
