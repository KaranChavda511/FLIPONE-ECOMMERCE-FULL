import { cva } from "class-variance-authority";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Stamp chips: the system's state language (mock-up `.stamp`). Bordered, Barlow Condensed caps.
 * PENDING is dashed; DELIVERED carries a check.
 */
const stampVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-[5px] rounded-sm border-[1.5px] border-current font-display leading-none font-semibold tracking-[0.08em] whitespace-nowrap uppercase [&_svg]:size-[13px] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        pending: "border-dashed bg-surface text-warning",
        shipped: "bg-surface text-ink",
        delivered: "bg-success-tint text-success",
        cancelled: "bg-danger-tint text-danger",
        lowStock: "bg-warning-tint text-warning",
        outOfStock: "border-dashed bg-surface text-muted-foreground",
        category: "border border-line text-muted-foreground font-medium bg-transparent",
        neutral: "bg-surface text-ink",
        kraft: "bg-transparent text-kraft",
        sample: "border-dashed bg-transparent text-ink-2",
      },
      size: {
        md: "h-6 px-2 pt-px text-[13px]",
        lg: "h-9 border-2 px-3 pt-0.5 text-[17px] tracking-[0.1em]",
      },
    },
    compoundVariants: [{ variant: "category", size: "md", class: "h-[22px]" }],
    defaultVariants: { variant: "neutral", size: "md" },
  }
);

const STATUS_VARIANT = {
  pending: "pending",
  shipped: "shipped",
  delivered: "delivered",
  cancelled: "cancelled",
  canceled: "cancelled",
};

/**
 * <Stamp variant="pending">Pending</Stamp>
 * <Stamp status={order.status} />            // maps backend 'pending'|'shipped'|'delivered'|'cancelled', label included
 * <Stamp variant="lowStock" count={2} />     // "ONLY 2 LEFT"
 * <Stamp variant="category">Men · Shirts</Stamp>
 */
export default function Stamp({ variant, status, count, size = "md", className, children, ...props }) {
  const key = status ? String(status).toLowerCase() : null;
  const v = variant ?? (key ? STATUS_VARIANT[key] ?? "neutral" : "neutral");

  let label = children;
  if (label == null && v === "lowStock") label = count != null ? `Only ${count} left` : "Low stock";
  if (label == null && v === "outOfStock") label = "Out of stock";
  if (label == null && key) label = key;

  return (
    <span data-slot="stamp" data-variant={v} className={cn(stampVariants({ variant: v, size }), className)} {...props}>
      {v === "delivered" && <Check strokeWidth={2.5} aria-hidden="true" />}
      {label}
    </span>
  );
}
