import { CircleAlert, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Load error inside a panel or table row: what failed, the server's message, and a retry. */
export function PanelError({ title = "Could not load this", message, onRetry, className }) {
  return (
    <div role="alert" className={cn("flex flex-col items-center gap-2 px-6 py-8 text-center", className)}>
      <CircleAlert className="size-6 text-danger" strokeWidth={1.75} aria-hidden="true" />
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {message && <p className="max-w-[46ch] text-[13.5px] text-muted-foreground">{message}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          <RotateCw aria-hidden="true" />
          Try again
        </Button>
      )}
    </div>
  );
}

/** Panel with a header row (mock-up `.panel` + `.panel-h`): title, optional count and right-side action. */
export function Panel({ title, titleId, count, action, className, children }) {
  return (
    <section aria-labelledby={titleId} className={cn("min-w-0 overflow-hidden rounded-md border border-line-soft bg-surface", className)}>
      <div className="flex min-h-[52px] items-center gap-3 border-b border-line-soft px-4 py-2.5">
        <h2 id={titleId} className="flex items-baseline gap-2 text-[17px] leading-tight font-semibold">
          {title}
          {count != null && <span className="text-[14px] font-medium text-muted-foreground tabular">{count}</span>}
        </h2>
        {action && <div className="ml-auto flex items-center gap-2">{action}</div>}
      </div>
      {children}
    </section>
  );
}
