import { motion } from "motion/react";
import { RotateCw } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DataTableMessage, EmptyState } from "@/components/flipone";

const MotionTableRow = motion.create(TableRow);
const EASE_OUT_QUINT = [0.22, 1, 0.36, 1];

/**
 * Table row that fades in once, staggered by `index` (25ms steps, capped at 250ms) so a fresh page of
 * rows settles top to bottom. Opacity/position only; reduced motion keeps the fade and drops the shift.
 */
export function AnimatedRow({ index = 0, ...props }) {
  return (
    <MotionTableRow
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: EASE_OUT_QUINT, delay: Math.min(index, 10) * 0.025 }}
      {...props}
    />
  );
}

const WIDTHS = ["w-24", "w-40", "w-28", "w-16", "w-32", "w-20", "w-12"];

/** Placeholder rows while a table loads. */
export function SkeletonRows({ rows = 6, cols = 5 }) {
  return Array.from({ length: rows }, (_, r) => (
    <TableRow key={r} className="hover:bg-transparent" aria-hidden="true">
      {Array.from({ length: cols }, (_, c) => (
        <TableCell key={c}>
          <Skeleton className={`h-4 rounded-sm ${WIDTHS[(r + c) % WIDTHS.length]}`} />
        </TableCell>
      ))}
    </TableRow>
  ));
}

/** Full-width error row with a retry button. */
export function ErrorRow({ colSpan, title = "Could not load this list", message, onRetry }) {
  return (
    <DataTableMessage colSpan={colSpan}>
      <div role="alert">
        <EmptyState
          variant="plain"
          illustration={null}
          headingLevel="h3"
          title={title}
          body={message}
          action={
            onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RotateCw aria-hidden="true" />
                Try again
              </Button>
            )
          }
          className="py-4"
        />
      </div>
    </DataTableMessage>
  );
}
