import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

/*
 * Small count/label pill. For order/stock statuses use <Stamp> (src/components/flipone/Stamp.jsx);
 * Badge is for counts (cart count, tab counts) and neutral meta labels.
 */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent font-display font-semibold whitespace-nowrap tabular [&>svg]:pointer-events-none [&>svg]:size-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary-hover",
        count: "h-5 min-w-5 bg-primary px-1.5 text-[13px] leading-5 text-primary-foreground",
        ink: "bg-ink text-paper [a&]:hover:bg-ink-hover",
        secondary: "bg-paper-2 text-ink [a&]:hover:bg-line-soft",
        destructive: "bg-danger text-white",
        outline: "border-line-mid bg-surface text-ink [a&]:hover:border-ink",
        ghost: "text-ink [a&]:hover:bg-paper-2",
        link: "text-ink underline-offset-4 [a&]:hover:underline",
      },
    },
    compoundVariants: [
      {
        variant: ["default", "ink", "secondary", "destructive", "outline", "ghost", "link"],
        class: "px-2 py-0.5 text-[13px]",
      },
    ],
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- shadcn convention
export { Badge, badgeVariants }
