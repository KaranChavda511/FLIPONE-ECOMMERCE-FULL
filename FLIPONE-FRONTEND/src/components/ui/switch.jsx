import { cn } from "@/lib/utils"
import { Switch as SwitchPrimitive } from "radix-ui"

/* On = success green (an "active" account), off = control grey. Thumb is always white. */
function Switch({
  className,
  size = "default",
  ...props
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch inline-flex shrink-0 items-center rounded-full border-[1.5px] border-transparent transition-[background-color] duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[size=default]:h-6 data-[size=default]:w-10 data-[size=sm]:h-5 data-[size=sm]:w-8",
        "data-[state=checked]:bg-success data-[state=unchecked]:bg-line data-[state=unchecked]:hover:bg-ink-2",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-surface shadow-xs transition-transform duration-150 ease-(--ease-out-quint) group-data-[size=default]/switch:size-[18px] group-data-[size=sm]/switch:size-[14px] data-[state=checked]:translate-x-[calc(100%+1px)] data-[state=unchecked]:translate-x-px"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
