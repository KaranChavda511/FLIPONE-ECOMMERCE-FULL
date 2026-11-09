import { Fragment } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { TagCard } from "@/components/flipone";
import { Skeleton } from "@/components/ui/skeleton";

const EASE = [0.22, 1, 0.36, 1];

/** Fade-in stagger for grid items: 22ms steps, capped so the whole cascade stays within ~250ms. */
const enter = (index) => ({
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, delay: Math.min(index, 10) * 0.022, ease: EASE },
});

/** Column presets: home uses the mock-up's fixed 4/6 columns; listings beside a rail auto-fill (RESEARCH.md). */
const GRID_COLUMNS = {
  home: "grid-cols-4 xl:grid-cols-6",
  rail: "grid-cols-[repeat(auto-fill,minmax(200px,1fr))]",
  more: "grid-cols-4 xl:grid-cols-6",
};

/**
 * Tag grid (mock-up `.pgrid`). The first product can be the 2x2 feature tag.
 *
 * products, columns (GRID_COLUMNS key or class string), feature (bool), onAdd(product),
 * likes ({ isLiked, toggle } from useLikes), trailing (extra <li> nodes), label (aria-label of the list),
 * insert ({ at, node }: one extra <li> placed in the flow after the first `at` products),
 * tagProps (extra props for every TagCard, e.g. imageClassName).
 */
export function ProductGrid({
  products,
  columns = "home",
  feature = false,
  onAdd,
  likes,
  trailing,
  insert,
  label,
  tagProps,
  className,
}) {
  const cols = GRID_COLUMNS[columns] ?? columns;
  return (
    <ul aria-label={label} className={cn("grid grid-flow-dense gap-4 min-[1800px]:gap-5", cols, className)}>
      {products.map((product, index) => {
        const isFeature = feature && index === 0;
        return (
          <Fragment key={product._id}>
            {insert?.at === index && insert.node}
            <motion.li {...enter(index)} className={cn("grid min-w-0", isFeature && "col-span-2 row-span-2")}>
              <TagCard
                product={product}
                size={isFeature ? "feature" : "md"}
                onAdd={onAdd}
                onToggleLike={likes?.toggle}
                liked={likes ? likes.isLiked(product) : false}
                {...tagProps}
              />
            </motion.li>
          </Fragment>
        );
      })}
      {insert && insert.at >= products.length && insert.node}
      {trailing}
    </ul>
  );
}

/** Loading placeholder shaped like the tag grid (feature tag first when `feature`). */
export function ProductGridSkeleton({ count = 12, columns = "home", feature = false, className }) {
  const cols = GRID_COLUMNS[columns] ?? columns;
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="sr-only">Loading products…</span>
      <ul aria-hidden="true" className={cn("grid grid-flow-dense gap-4 min-[1800px]:gap-5", cols)}>
        {Array.from({ length: count }, (_, index) => {
          const isFeature = feature && index === 0;
          return (
            <li
              key={index}
              className={cn(
                "flex min-w-0 flex-col overflow-hidden rounded-md border border-line-soft bg-surface",
                isFeature && "col-span-2 row-span-2"
              )}
            >
              <Skeleton className={cn("rounded-none", isFeature ? "min-h-[280px] flex-1" : "aspect-[3/4]")} />
              <div className="flex flex-col gap-2.5 border-t border-dashed border-line-mid px-3 pt-3 pb-3">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-2/5" />
                <Skeleton className={cn("h-10", isFeature ? "w-44" : "w-24")} />
                <Skeleton className="h-5 w-3/5" />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
