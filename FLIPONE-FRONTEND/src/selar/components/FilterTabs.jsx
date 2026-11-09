import { useId } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Filter buttons for a table toolbar (mock-up `.tabs` / `.tab`): quiet 32px buttons with a count, the active
 * one filled ink. The ink fill slides between buttons (Motion layoutId; instant under reduced motion).
 *
 * Props: label (group name for screen readers), items [{ value, label, count }], value, onChange(value).
 */
export default function FilterTabs({ label, items, value, onChange, className }) {
  const layoutId = `filter-fill-${useId()}`;

  return (
    <div role="group" aria-label={label} className={cn("flex flex-wrap items-center gap-1", className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "group relative inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13.5px] font-medium transition-colors duration-150 ease-(--ease-out-quint)",
              active ? "text-paper" : "text-ink-2 hover:bg-paper-2 hover:text-ink"
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                aria-hidden="true"
                className="absolute inset-0 rounded-md bg-ink transition-colors duration-150 group-hover:bg-ink-hover"
                transition={{ type: "spring", stiffness: 520, damping: 40 }}
              />
            )}
            <span className="relative">{item.label}</span>
            {item.count != null && (
              <span className="relative font-display text-[13px] leading-none font-semibold tabular opacity-80">
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
