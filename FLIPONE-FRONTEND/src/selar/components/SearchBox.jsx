import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/** Compact 36px search field for portal top bars and table toolbars (mock-up `.search-sm`). */
export default function SearchBox({ value, onChange, label, placeholder, className }) {
  return (
    <label
      className={cn(
        "flex h-9 w-[260px] items-center gap-2 rounded-md border-[1.5px] border-line bg-surface px-2.5 transition-colors duration-150",
        "hover:border-ink-2 focus-within:border-ink",
        "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ring",
        className
      )}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-muted-foreground focus-visible:outline-none"
      />
    </label>
  );
}
