import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

/*
 * FlipOne buttons (mock-up `.btn`): 6px radius, 1.5px border, Work Sans 600.
 * primary = tag red (the one action per view), ink = strong secondary, outline = ink-bordered surface,
 * ghost = quiet, link = inline text action, remove = muted text that turns danger on hover (cart "Remove").
 */
const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-md border-[1.5px] border-transparent font-sans font-semibold leading-none whitespace-nowrap select-none",
    "transition-[background-color,border-color,color,transform] duration-150 ease-(--ease-out-quint)",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "active:not-disabled:scale-[.98] aria-disabled:pointer-events-none",
    "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-paper-2 disabled:text-muted-foreground",
    "aria-invalid:border-danger",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        ink: "bg-ink text-paper hover:bg-ink-hover",
        outline: "border-ink bg-surface text-ink hover:bg-paper-2",
        secondary: "bg-paper-2 text-ink hover:bg-line-soft",
        ghost: "bg-transparent text-ink hover:bg-paper-2",
        destructive: "bg-danger text-white hover:bg-[#861529]",
        remove:
          "bg-transparent font-medium text-muted-foreground hover:bg-danger-tint hover:text-danger",
        link:
          "h-auto border-0 px-0 text-ink underline decoration-line-mid decoration-[1.5px] underline-offset-[3px] hover:decoration-ink active:not-disabled:scale-100 disabled:bg-transparent",
      },
      size: {
        default: "h-11 px-[18px] text-[15px]",
        sm: "h-[34px] gap-1.5 px-3 text-sm",
        lg: "h-[52px] px-6 text-base",
        xs: "h-7 gap-1 rounded-sm px-2 text-[13px] [&_svg:not([class*='size-'])]:size-3.5",
        icon: "size-11 [&_svg:not([class*='size-'])]:size-5",
        "icon-sm": "size-[34px]",
        "icon-lg": "size-[52px] [&_svg:not([class*='size-'])]:size-5",
        "icon-xs": "size-7 rounded-sm [&_svg:not([class*='size-'])]:size-3.5",
      },
    },
    compoundVariants: [{ variant: "link", class: "h-auto px-0" }],
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  type,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      // A plain <button> defaults to type="button" so it never submits a form by accident.
      type={asChild ? type : (type ?? "button")}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- shadcn convention: variants are shared with asChild links
export { Button, buttonVariants }
