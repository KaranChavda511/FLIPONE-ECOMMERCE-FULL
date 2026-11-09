import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";

/** "Showing 1–10 of 938" (mock-up `.tbl-foot` left side). */
export function RangeText({ page, perPage, total, noun = "" }) {
  if (!total) return <span className="tabular">Nothing to show</span>;
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  return (
    <span className="tabular">
      Showing {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)}
      {noun ? ` ${noun}` : ""}
    </span>
  );
}

/** Prev / page / Next (mock-up `.pager`). */
export default function Pager({ page, totalPages, onChange, label = "Pages" }) {
  const pages = Math.max(totalPages || 1, 1);
  return (
    <nav aria-label={label} className="flex items-center gap-1.5">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft aria-hidden="true" />
        Prev
      </Button>
      <span className="px-1.5 text-[13px] text-muted-foreground tabular" aria-live="polite">
        Page {page} of {pages}
      </span>
      <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next
        <ChevronRight aria-hidden="true" />
      </Button>
    </nav>
  );
}
