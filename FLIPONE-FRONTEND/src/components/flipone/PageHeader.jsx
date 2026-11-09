import { cn } from "@/lib/utils";

/**
 * Page title row (mock-up `.co h1` / `.filters h2`): title, optional muted count beside it, optional subtitle
 * under it, actions on the right.
 *
 * Props: title, count (node, e.g. "2 items"), subtitle, actions, as (heading tag, default 'h1'),
 *        size 'lg' (28px, page titles) | 'md' (19px, section heads above a grid).
 */
export default function PageHeader({ title, count, subtitle, actions, as: Heading = "h1", size = "lg", className, children }) {
  return (
    <div className={cn("flex flex-wrap items-end gap-x-4 gap-y-2", className)}>
      <div className="min-w-0">
        <Heading
          className={cn(
            "flex flex-wrap items-baseline gap-x-3 font-semibold text-balance text-ink",
            size === "lg" ? "text-[28px] leading-tight tracking-[-0.02em]" : "text-[19px] leading-snug tracking-[-0.01em]"
          )}
        >
          {title}
          {count != null && (
            <span className="text-[15px] font-medium tracking-normal text-muted-foreground tabular">{count}</span>
          )}
        </Heading>
        {subtitle && <p className="mt-1 max-w-[70ch] text-[14px] leading-normal text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
      {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
