import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { text: "text-[24px]", dot: "size-[6px] ml-[2px]", mark: "size-7" },
  md: { text: "text-[30px]", dot: "size-[7px] ml-[3px]", mark: "size-8" },
  lg: { text: "text-[40px]", dot: "size-[9px] ml-[3px]", mark: "size-10" },
};

/**
 * The square tag mark: ink tag with a paper "F" and the red dot. Same drawing as public/favicon.svg.
 * Used where the wordmark does not fit (collapsed portal rail).
 */
export function LogoMark({ className, tone = "ink", title }) {
  const ground = tone === "paper" ? "#F5F4F0" : "#17150F";
  const letter = tone === "paper" ? "#17150F" : "#F5F4F0";
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect width="32" height="32" rx="6" fill={ground} />
      <path d="M9 7.5h13v4H13.5v3.5h7v4h-7V25H9z" fill={letter} />
      <rect x="21" y="20" width="5" height="5" rx="1" fill="#D3261C" />
    </svg>
  );
}

/**
 * FlipOne wordmark (mock-up `.wordmark`): Barlow Condensed 700 with the square tag-red dot.
 * Renders a home link by default; pass `to={null}` for a static mark.
 *
 * Props: size 'sm'|'md'|'lg', tone 'ink' (on paper/white) | 'paper' (on the ink sidebar),
 * compact (mark only), to (link target, default "/"), className.
 */
export default function Logo({ size = "md", tone = "ink", compact = false, to = "/", className, ...props }) {
  const s = SIZES[size] ?? SIZES.md;
  const content = compact ? (
    <LogoMark className={s.mark} tone={tone === "paper" ? "paper" : "ink"} />
  ) : (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex items-baseline font-display leading-none font-bold tracking-[0.005em]",
        s.text
      )}
    >
      FlipOne
      <i
        className={cn(
          "inline-block rounded-[1px] bg-red transition-colors duration-150 group-hover/logo:bg-red-hover",
          s.dot
        )}
      />
    </span>
  );

  const classes = cn(
    "group/logo inline-flex shrink-0 items-center rounded-xs no-underline transition-colors duration-150",
    tone === "paper"
      ? "text-paper hover:text-kraft focus-visible:outline-paper"
      : "text-ink hover:text-ink-2",
    className
  );

  if (!to) {
    return (
      <span className={classes} role="img" aria-label="FlipOne" {...props}>
        {content}
      </span>
    );
  }

  return (
    <Link to={to} className={classes} aria-label="FlipOne home" {...props}>
      {content}
    </Link>
  );
}
