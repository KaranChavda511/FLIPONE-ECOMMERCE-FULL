import { Stamp } from "@/components/flipone";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { stockLevel } from "../lib/seller";

/**
 * Stock as the tag prints it: the count, plus a stamp when it needs attention
 * (ONLY N LEFT at or under the low-stock line, a dashed OUT OF STOCK at zero).
 */
export default function StockCell({ stock, className }) {
  const level = stockLevel(stock);
  if (level === "out") return <Stamp variant="outOfStock" className={className} />;
  if (level === "low") return <Stamp variant="lowStock" count={Number(stock)} className={className} />;
  return (
    <span className={cn("font-medium tabular", className)}>
      {formatNumber(stock)} <span className="font-normal text-muted-foreground">in stock</span>
    </span>
  );
}
