import { useId } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/format";

/**
 * Filter tab row (mock-up `.tabs .tab`): quiet 32px buttons with aria-pressed; the active one is filled ink,
 * and the ink fill slides between tabs (Motion layoutId; skipped under reduced motion).
 *
 * options: [{ value, label, count? }]
 */
export default function FilterTabs({ label, options, value, onChange, className }) {
  const groupId = useId();

  return (
    <div role="group" aria-label={label} className={cn("flex flex-wrap items-center gap-1", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "group/tab relative inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13.5px] font-medium",
              "transition-colors duration-150 ease-(--ease-out-quint)",
              active ? "text-paper" : "text-ink-2 hover:bg-paper-2 hover:text-ink"
            )}
          >
            {active && (
              <motion.span
                layoutId={`${groupId}-active`}
                aria-hidden="true"
                className="absolute inset-0 rounded-md bg-ink transition-colors duration-150 group-hover/tab:bg-ink-hover"
                transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              />
            )}
            <span className="relative">{option.label}</span>
            {option.count != null && (
              <span className="relative font-display text-[13px] leading-none font-semibold tabular opacity-80">
                {formatNumber(option.count)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
