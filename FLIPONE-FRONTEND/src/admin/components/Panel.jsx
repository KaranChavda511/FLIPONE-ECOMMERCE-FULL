import { CircleAlert, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * White panel with a 1px rule (mock-up `.panel`); optional header row (mock-up `.panel-h`).
 * `caption`: one muted line under the title saying what the figures cover ("All time · cancelled items
 * excluded"). `meta` (muted, right) and `actions` (right) sit at the other end of the header.
 */
export function Panel({ title, titleId, caption, meta, actions, className, bodyClassName, children, ...props }) {
  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={cn("min-w-0 rounded-md border border-line-soft bg-surface", className)}
      {...props}
    >
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-line-soft px-[18px] py-3.5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-[15px] leading-tight font-semibold">
              {title}
            </h2>
            {caption && <p className="mt-1 truncate text-[13px] leading-tight text-muted-foreground">{caption}</p>}
          </div>
          {meta && <p className="shrink-0 text-[13px] text-muted-foreground tabular">{meta}</p>}
          {actions}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/** Inline load error with a retry action, for sections that are not tables. */
export function ErrorNotice({ title = "Could not load this", message, onRetry, className }) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-md border border-danger/35 bg-danger-tint px-4 py-3 text-[14px]",
        className
      )}
    >
      <CircleAlert className="size-[18px] shrink-0 text-danger" strokeWidth={1.75} aria-hidden="true" />
      <p className="min-w-0 flex-1 text-ink-2">
        <span className="font-semibold text-danger">{title}.</span> {message}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  );
}
