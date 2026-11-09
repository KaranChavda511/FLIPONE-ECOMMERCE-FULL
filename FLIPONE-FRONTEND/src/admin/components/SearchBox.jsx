import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Compact top-bar search (mock-up `.search-sm`): 36px, 260px wide, icon + borderless input.
 * The focus ring is drawn on the box while the input has keyboard focus.
 */
export default function SearchBox({ value, onChange, placeholder, label, className, ...inputProps }) {
  return (
    <label
      className={cn(
        "flex h-9 w-[260px] items-center gap-2 rounded-md border border-line bg-surface px-2.5",
        "transition-colors duration-150 ease-(--ease-out-quint) hover:border-ink-2 focus-within:border-ink",
        "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ink",
        className
      )}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-muted-foreground focus-visible:outline-none"
        {...inputProps}
      />
    </label>
  );
}
