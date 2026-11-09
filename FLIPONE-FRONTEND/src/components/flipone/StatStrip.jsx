import { cn } from "@/lib/utils";
import { formatInr, formatNumber } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import NumberTicker from "./NumberTicker";

/**
 * Stat strip (mock-up `.stats`): a <dl> of auto-fit tiles (min 150px). 1px gaps over the rule colour draw
 * the dividers, so wrapped rows stay clean. Keep it to 4-5 tiles.
 */
export function StatStrip({ className, children, ...props }) {
  return (
    <dl
      className={cn(
        "grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-px overflow-hidden rounded-md border border-line-soft bg-line-soft",
        className
      )}
      {...props}
    >
      {children}
    </dl>
  );
}

const FORMATTERS = { number: (n) => formatNumber(n), inr: (n) => formatInr(Math.round(n)) };

/**
 * One tile (mock-up `.stat`): icon + label, then the figure in Barlow Condensed ink.
 *
 * Props:
 *  label, icon (lucide component), value (number|string), note (small muted text after the figure)
 *  format: 'number' (default) | 'inr' | (n) => string
 *  animate: count up with NumberTicker when value is a number (respects reduced motion)
 *  loading: show a skeleton instead of the figure
 */
export function StatTile({ label, icon: Icon, value, note, format = "number", animate = false, loading = false, className }) {
  const fmt = typeof format === "function" ? format : FORMATTERS[format] ?? FORMATTERS.number;
  const numeric = typeof value === "number" && Number.isFinite(value);

  let figure;
  if (loading) figure = <Skeleton className="h-[30px] w-24" />;
  else if (numeric && animate) figure = <NumberTicker value={value} format={fmt} />;
  else if (numeric) figure = <span className="tabular">{fmt(value)}</span>;
  else figure = value ?? "—";

  return (
    <div className={cn("min-w-0 bg-surface px-3 pt-3 pb-[13px] xl:px-[18px] xl:pt-3.5 xl:pb-[15px]", className)}>
      <dt className="flex items-center gap-[7px] text-[13px] font-medium text-muted-foreground">
        {Icon && <Icon className="size-[15px] shrink-0" strokeWidth={1.75} aria-hidden="true" />}
        <span className="truncate">{label}</span>
      </dt>
      <dd className="mt-1.5 truncate font-display text-[28px] leading-none font-semibold tracking-[0.005em] whitespace-nowrap text-ink tabular xl:text-[34px]">
        {figure}
        {note && <small className="ml-1.5 font-sans text-[12px] font-normal tracking-normal text-muted-foreground">{note}</small>}
      </dd>
    </div>
  );
}
