import { Fragment, useId } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronRight, Minus, Plus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/flipone";

/**
 * White panel with a ruled header (mock-up `.panel` + `.panel-h`).
 * step: optional number in an ink ring (checkout sequence only). description: muted text on the right.
 */
export function Panel({ title, step, description, actions, as: Comp = "section", headingLevel: Heading = "h2", className, bodyClassName, children }) {
  const headingId = useId();
  return (
    <Comp aria-labelledby={title ? headingId : undefined} className={cn("min-w-0 rounded-md border border-line-soft bg-surface", className)}>
      {title && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line-soft px-[18px] py-3.5">
          <Heading id={headingId} className="flex items-center gap-2.5 text-[17px] leading-tight font-semibold text-ink">
            {step != null && (
              <span
                aria-hidden="true"
                className="inline-grid size-6 place-items-center rounded-full border-[1.5px] border-ink font-display text-[14px] leading-none font-semibold"
              >
                {step}
              </span>
            )}
            {title}
          </Heading>
          {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
          {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </Comp>
  );
}

/** Breadcrumb trail (mock-up `.crumbs`). items: [{ label, to? }]; the last item is the current page. */
export function Breadcrumbs({ items, className }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-[13px] text-muted-foreground", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li className="min-w-0">
                {item.to && !last ? (
                  <Link
                    to={item.to}
                    className="rounded-xs transition-colors duration-150 hover:text-ink hover:underline hover:decoration-[1.5px] hover:underline-offset-[3px]"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={last ? "page" : undefined} className={cn("block truncate", last && "max-w-[48ch] text-ink-2")}>
                    {item.label}
                  </span>
                )}
              </li>
              {!last && (
                <li aria-hidden="true" className="grid place-items-center">
                  <ChevronRight className="size-[13px]" strokeWidth={1.75} />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Quantity stepper (mock-up `.stepper`, `.stepper-sm`): − value +, ink-bordered, value in Barlow tabular.
 * label: accessible group name. Buttons disable at min/max; the value ticks with a short slide.
 */
export function QuantityStepper({ value, min = 1, max = Infinity, onChange, size = "md", label, labelledBy, disabled = false, className }) {
  const small = size === "sm";
  const btn = cn(
    "grid h-full place-items-center text-ink transition-colors duration-150 hover:bg-paper-2 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-[#77726A]",
    "focus-visible:relative focus-visible:z-[1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    small ? "w-8" : "w-10"
  );
  return (
    <div
      role="group"
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      className={cn(
        "inline-flex items-center rounded-md border-[1.5px] border-ink bg-surface",
        small ? "h-9" : "h-11",
        className
      )}
    >
      <button
        type="button"
        className={cn(btn, "rounded-l-[4px]")}
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus className="size-4" strokeWidth={2} aria-hidden="true" />
      </button>
      <output aria-live="polite" className="relative grid min-w-8 place-items-center overflow-hidden font-display text-[18px] leading-none font-semibold tabular">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </output>
      <button
        type="button"
        className={cn(btn, "rounded-r-[4px]")}
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
      >
        <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * Filter chip (mock-up `.chip`): 32px pill, pressed = ink fill with a check.
 * Pass `icon` (lucide component) for a leading icon when not pressed.
 */
export function Chip({ pressed = false, icon: Icon, onClick, children, className, ...props }) {
  return (
    <motion.button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.12 }}
      className={cn(
        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-line-mid bg-surface px-3 text-[13.5px] font-medium whitespace-nowrap text-ink",
        "transition-[background-color,border-color,color] duration-150 ease-(--ease-out-quint) hover:border-ink",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper aria-pressed:hover:bg-ink-hover",
        "[&_svg]:size-[15px] [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {pressed ? <Check strokeWidth={2.25} aria-hidden="true" /> : Icon ? <Icon strokeWidth={1.75} aria-hidden="true" /> : null}
      {children}
    </motion.button>
  );
}

/** Error state for a failed fetch: the message and a retry button. */
export function LoadError({ title = "Could not load this page", message, onRetry, className, variant = "panel" }) {
  return (
    <div role="alert">
      <EmptyState
        illustration={null}
        variant={variant}
        className={className}
        title={title}
        body={message || "Check your connection and try again."}
        action={
          onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <RotateCcw aria-hidden="true" />
              Try again
            </Button>
          )
        }
      />
    </div>
  );
}
