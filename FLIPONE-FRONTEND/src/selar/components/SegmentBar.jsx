import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const share = (value, total) => (total > 0 ? `${Math.round((value / total) * 100)}%` : "0%");

/**
 * One 100% stacked bar with its counts printed as direct labels (no hover needed to read it).
 * Plain HTML, no chart library: it is small, and the legend list doubles as the text alternative
 * (the bar itself is aria-hidden).
 *
 * Props:
 *  label     accessible name for the legend list ("Order items by status")
 *  segments  [{ key, label, value, swatch }]; `swatch` is a background class ("bg-warning")
 *  layout    'stacked' (bar above a row-per-segment list, for panels) or 'inline' (bar and legend on one
 *            line, for a compact strip)
 */
export default function SegmentBar({ label, segments, layout = "stacked", className }) {
  const total = segments.reduce((sum, s) => sum + (Number(s.value) || 0), 0);
  const inline = layout === "inline";

  const bar = (
    <div
      aria-hidden="true"
      className={cn("flex w-full gap-[2px] overflow-hidden rounded-[2px] bg-paper-2", inline ? "h-2" : "h-3")}
    >
      {segments
        .filter((s) => Number(s.value) > 0)
        .map((s) => (
          <span
            key={s.key}
            className={cn("min-w-[3px] transition-[flex-grow] duration-300 ease-(--ease-out-quint)", s.swatch)}
            style={{ flex: `${Number(s.value)} 1 0%` }}
          />
        ))}
    </div>
  );

  const legend = (
    <ul
      aria-label={label}
      className={cn(inline ? "flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1" : "mt-3 divide-y divide-line-soft")}
    >
      {segments.map((s) => (
        <li
          key={s.key}
          className={cn("flex items-center text-[13.5px]", inline ? "gap-1.5" : "gap-2 py-2 first:pt-0 last:pb-0")}
        >
          <span aria-hidden="true" className={cn("size-2 shrink-0", s.swatch)} />
          <span className={cn("text-ink-2", !inline && "flex-1")}>{s.label}</span>
          <span className="font-display text-[15px] leading-none font-semibold text-ink tabular">
            {formatNumber(Number(s.value) || 0)}
          </span>
          <span className="w-9 text-right font-display text-[13px] leading-none font-medium text-muted-foreground tabular">
            {share(Number(s.value) || 0, total)}
          </span>
        </li>
      ))}
    </ul>
  );

  if (inline) {
    return (
      <div className={cn("flex min-w-0 flex-1 items-center gap-5", className)}>
        <div className="min-w-[140px] flex-1">{bar}</div>
        {legend}
      </div>
    );
  }
  return (
    <div className={className}>
      {bar}
      {legend}
    </div>
  );
}
