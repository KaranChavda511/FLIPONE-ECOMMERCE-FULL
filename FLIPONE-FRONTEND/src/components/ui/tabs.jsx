import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils"
import { Tabs as TabsPrimitive } from "radix-ui"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  )
}

/*
 * variant "pill" (default) = mock-up `.tabs/.tab`: quiet 32px tabs, the active one filled ink.
 * variant "line" = text tabs with a 2px ink underline on the active one (page-level sections).
 */
const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center text-ink-2 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col group-data-[orientation=vertical]/tabs:items-stretch",
  {
    variants: {
      variant: {
        default: "gap-1",
        pill: "gap-1",
        line: "gap-5 border-b border-line-soft",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex items-center justify-center gap-1.5 text-[13.5px] font-medium whitespace-nowrap",
        "transition-[background-color,color,border-color] duration-150 ease-(--ease-out-quint)",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-50 group-data-[orientation=vertical]/tabs:justify-start",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // pill
        "group-data-[variant=default]/tabs-list:h-8 group-data-[variant=default]/tabs-list:rounded-md group-data-[variant=default]/tabs-list:px-2.5",
        "group-data-[variant=pill]/tabs-list:h-8 group-data-[variant=pill]/tabs-list:rounded-md group-data-[variant=pill]/tabs-list:px-2.5",
        "group-data-[variant=default]/tabs-list:hover:bg-paper-2 group-data-[variant=default]/tabs-list:hover:text-ink",
        "group-data-[variant=pill]/tabs-list:hover:bg-paper-2 group-data-[variant=pill]/tabs-list:hover:text-ink",
        "group-data-[variant=default]/tabs-list:data-[state=active]:bg-ink group-data-[variant=default]/tabs-list:data-[state=active]:text-paper group-data-[variant=default]/tabs-list:data-[state=active]:hover:bg-ink-hover",
        "group-data-[variant=pill]/tabs-list:data-[state=active]:bg-ink group-data-[variant=pill]/tabs-list:data-[state=active]:text-paper group-data-[variant=pill]/tabs-list:data-[state=active]:hover:bg-ink-hover",
        // line
        "group-data-[variant=line]/tabs-list:-mb-px group-data-[variant=line]/tabs-list:h-10 group-data-[variant=line]/tabs-list:border-b-2 group-data-[variant=line]/tabs-list:border-transparent group-data-[variant=line]/tabs-list:hover:border-red group-data-[variant=line]/tabs-list:hover:text-ink",
        "group-data-[variant=line]/tabs-list:data-[state=active]:border-ink group-data-[variant=line]/tabs-list:data-[state=active]:font-semibold group-data-[variant=line]/tabs-list:data-[state=active]:text-ink",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring", className)}
      {...props}
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
