import { Check } from "lucide-react";
import { Stamp } from "@/components/flipone";
import { cn } from "@/lib/utils";
import { STATUS_STEPS } from "../lib/seller";

// Current-step colours, same as the Stamp kit (mock-up `.seg` current step).
const CURRENT = {
  pending: "z-[1] border-dashed border-warning bg-warning-tint text-warning",
  shipped: "z-[1] border-ink bg-ink text-paper",
  delivered: "z-[1] border-success bg-success text-white",
};

/**
 * Read-only pending → shipped → delivered track for one order item (mock-up `.seg`): finished steps keep a
 * check, the current step is stamped, later steps stay muted. Cancelled items show the CANCELLED stamp.
 */
export default function StatusTrack({ status, className }) {
  const key = String(status ?? "").toLowerCase();
  const current = STATUS_STEPS.indexOf(key);
  if (current === -1) return <Stamp status={status} className={className} />;

  return (
    <ol className={cn("inline-flex", className)} aria-label={`Status: ${key}, step ${current + 1} of ${STATUS_STEPS.length}`}>
      {STATUS_STEPS.map((step, i) => {
        const done = i < current;
        const isCurrent = i === current;
        return (
          <li
            key={step}
            aria-current={isCurrent ? "step" : undefined}
            className={cn(
              "relative -ml-[1.5px] inline-flex h-[30px] items-center gap-[5px] border-[1.5px] px-[11px] pt-px font-display text-[13px] leading-none font-semibold tracking-[0.08em] uppercase first:ml-0 first:rounded-l-sm last:rounded-r-sm",
              isCurrent ? CURRENT[step] : "border-line-mid",
              done && "bg-[#F4F2EC] text-ink-2",
              !done && !isCurrent && "bg-surface text-muted-foreground"
            )}
          >
            {done && <Check className="size-3" strokeWidth={2.5} aria-hidden="true" />}
            {isCurrent && step === "delivered" && <Check className="size-3" strokeWidth={2.5} aria-hidden="true" />}
            {step}
          </li>
        );
      })}
    </ol>
  );
}
