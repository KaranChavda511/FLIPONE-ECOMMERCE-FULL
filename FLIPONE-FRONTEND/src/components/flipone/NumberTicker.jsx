import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { formatNumber } from "@/lib/format";

/**
 * Magic UI-style number ticker, rebuilt on Motion: counts from `from` to `value` once, when it scrolls into view.
 * Reduced motion: renders the final value immediately. Screen readers always get the final value (the counting
 * digits are aria-hidden).
 *
 * Props: value (number), from (default 0), format (n => string, default en-IN grouping), duration (s, default 0.9).
 */
export default function NumberTicker({ value, from = 0, format = formatNumber, duration = 0.9, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const target = Number(value) || 0;
  const skip = reduce || target === from;

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (skip) {
      node.textContent = format(target);
      return undefined;
    }
    if (!inView) return undefined;
    const controls = animate(from, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        node.textContent = format(Number.isInteger(target) ? Math.round(latest) : latest);
      },
    });
    return () => controls.stop();
  }, [inView, skip, from, target, duration, format]);

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true" className="tabular">
        {format(skip ? target : from)}
      </span>
      <span className="sr-only">{format(target)}</span>
    </span>
  );
}
