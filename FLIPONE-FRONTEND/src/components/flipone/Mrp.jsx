import { cn } from "@/lib/utils";
import { formatInr } from "@/lib/format";

const SIZES = {
  sm: { box: "px-[7px] pt-1 pb-[3px]", k: "text-[12px]", v: "text-[20px]", n: "text-[12px]" },
  md: { box: "px-2 pt-[5px] pb-1", k: "text-[12px]", v: "text-[24px]", n: "text-[12px]" },
  lg: { box: "px-3 pt-[7px] pb-1.5", k: "text-[14px]", v: "text-[40px]", n: "text-[12px]" },
};

/**
 * The printed MRP block from the swing tag (mock-up `.mrp`):
 *   MRP ₹1,299
 *   (incl. of all taxes)
 * Props: value (number|string, rupees), size 'sm'|'md'|'lg', showNote (default true), label ("MRP"),
 *   boxed (default true: the printed box; false: the same lines without the box, for product tags), className.
 */
export default function Mrp({ value, size = "md", showNote = true, label = "MRP", boxed = true, className, ...props }) {
  const s = SIZES[size] ?? SIZES.md;
  return (
    <span
      data-slot="mrp"
      className={cn(
        "inline-grid w-fit grid-cols-[auto_auto] items-baseline gap-x-1.5",
        boxed && ["rounded-sm border border-line-mid bg-surface", s.box],
        className
      )}
      {...props}
    >
      <span className={cn("font-display leading-none font-semibold tracking-[0.1em] text-ink-2", s.k)}>{label}</span>
      <span
        className={cn(
          "font-display leading-none font-semibold tracking-[0.01em] whitespace-nowrap text-red tabular",
          s.v
        )}
      >
        {formatInr(value)}
      </span>
      {showNote && (
        <span className={cn("col-span-full mt-[3px] leading-[1.3] whitespace-nowrap text-muted-foreground", s.n)}>
          {boxed ? "(incl. of all taxes)" : "Incl. of all taxes"}
        </span>
      )}
    </span>
  );
}
