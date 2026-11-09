import { isValidElement } from "react";
import { cn } from "@/lib/utils";
import { EmptyBag, NoOrders, NoProducts, NoResults } from "./illustrations";

const ILLUSTRATIONS = { bag: EmptyBag, orders: NoOrders, results: NoResults, products: NoProducts };

/**
 * Empty / zero state: line illustration, title, short body, one action.
 *
 * Props:
 *  illustration: 'bag' | 'orders' | 'results' | 'products' | a React element | null
 *  title, body (node), action (node: usually a <Button asChild><Link/></Button>)
 *  variant: 'panel' (white surface with a 1px rule; default) | 'plain' (no frame, e.g. inside a table panel)
 *  headingLevel: default 'h2'
 */
export default function EmptyState({
  illustration = "bag",
  title,
  body,
  action,
  variant = "panel",
  headingLevel: Heading = "h2",
  className,
}) {
  let art = null;
  if (isValidElement(illustration)) art = illustration;
  else if (typeof illustration === "string" && ILLUSTRATIONS[illustration]) {
    const Art = ILLUSTRATIONS[illustration];
    art = <Art />;
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 py-10 text-center",
        variant === "panel" && "rounded-md border border-line-soft bg-surface",
        className
      )}
    >
      {art}
      {title && (
        <Heading className={cn("text-[19px] leading-snug font-semibold tracking-[-0.01em] text-balance text-ink", art && "mt-4")}>
          {title}
        </Heading>
      )}
      {body && <div className="mt-1.5 max-w-[46ch] text-[14.5px] leading-relaxed text-muted-foreground">{body}</div>}
      {action && <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{action}</div>}
    </div>
  );
}
