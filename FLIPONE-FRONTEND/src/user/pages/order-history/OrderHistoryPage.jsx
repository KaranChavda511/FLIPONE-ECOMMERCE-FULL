import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, X } from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { formatDate, formatInr, shortId } from "@/lib/format";
import { Container, EmptyState, PageHeader, Stamp } from "@/components/flipone";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import apiClient, { apiErrorMessage } from "../../../config/apiClient";
import { useApiGet } from "../../../hooks/useApiGet";
import { useUrlState } from "../../../hooks/useUrlState";
import { imageUrl } from "../../../utils/imageUrl";
import { LoadError } from "../../components/StoreBits";

// The history endpoint leaves cancelled orders out, so these are the states a shopper can see.
const FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

/** Filter row with a sliding ink indicator under the active filter (Motion layoutId). */
function FilterTabs({ value, onChange, counts }) {
  return (
    <div role="group" aria-label="Filter orders" className="flex flex-wrap items-center gap-1">
      {FILTERS.map((f) => {
        const active = value === f.value;
        return (
          <button
            key={f.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(f.value)}
            className={cn(
              "relative inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13.5px] font-medium text-ink-2 transition-colors duration-150",
              "hover:bg-paper-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              active && "text-paper hover:bg-transparent hover:text-paper"
            )}
          >
            {active && (
              <motion.span
                layoutId="order-filter-indicator"
                aria-hidden="true"
                className="absolute inset-0 rounded-md bg-ink"
                transition={{ type: "spring", stiffness: 520, damping: 40 }}
              />
            )}
            <span className="relative">{f.label}</span>
            <span className="relative font-display text-[13px] leading-none font-semibold opacity-75 tabular">{counts[f.value] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}

/** One order: ruled header (number, date, total, status, actions) over its item rows with per-item stamps. */
function OrderPanel({ order, index, cancelling, onCancel }) {
  const items = order.products ?? [];
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index, 10) * 0.022, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-md border border-line-soft bg-surface"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line-soft bg-head px-[18px] py-3">
        <div className="flex flex-col">
          <span className="label-caps text-[12px] leading-tight text-muted-foreground">Order</span>
          <Link
            to={`/ordersuccess/${order.orderId}`}
            className="font-display text-[16px] leading-tight font-semibold tracking-[0.06em] text-ink transition-colors duration-150 hover:text-red"
            aria-label={`Order ${shortId(order.orderId)}, view details`}
          >
            {shortId(order.orderId)}
          </Link>
        </div>
        <div className="flex flex-col">
          <span className="label-caps text-[12px] leading-tight text-muted-foreground">Placed</span>
          <span className="text-[14px] font-medium tabular">{formatDate(order.date)}</span>
        </div>
        <div className="flex flex-col">
          <span className="label-caps text-[12px] leading-tight text-muted-foreground">Total</span>
          <span className="text-[14px] font-semibold tabular">{formatInr(order.totalAmount)}</span>
        </div>
        <Stamp status={order.status} />
        <div className="ml-auto flex items-center gap-1.5">
          {order.status === "pending" && (
            <Button variant="remove" size="sm" onClick={() => onCancel(order)} disabled={cancelling}>
              <X aria-hidden="true" />
              {cancelling ? "Cancelling…" : "Cancel order"}
            </Button>
          )}
          {/* -mr-3 cancels the ghost padding so the label ends on the same edge as the item stamps below */}
          <Button asChild variant="ghost" size="sm" className="-mr-3">
            <Link to={`/ordersuccess/${order.orderId}`}>
              View details
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
      <ul>
        {items.map((item, i) => (
          <li
            key={`${item.name}-${i}`}
            className="grid grid-cols-[40px_minmax(0,1fr)_auto_auto] items-center gap-4 border-t border-dashed border-line-mid px-[18px] py-2.5 first:border-t-0"
          >
            <img src={imageUrl(item.image)} alt="" loading="lazy" className="aspect-[4/5] w-10 rounded-[3px] bg-paper-2 object-cover" />
            <div className="min-w-0">
              <p className="truncate text-[14.5px] font-semibold">{item.name}</p>
              <p className="text-[12.5px] text-muted-foreground tabular">
                {formatInr(item.price)} × {item.quantity}
              </p>
            </div>
            <span className="text-[14px] font-medium tabular">
              {formatInr((Number(item.price) || 0) * (Number(item.quantity) || 0))}
            </span>
            {item.status ? <Stamp status={item.status} className="min-w-[96px] justify-center" /> : <span />}
          </li>
        ))}
      </ul>
    </motion.li>
  );
}

function HistorySkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">Loading your orders…</span>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} aria-hidden="true" className="h-40 w-full" />
      ))}
    </div>
  );
}

const OrderHistoryPage = () => {
  const { data, loading, error, reload } = useApiGet("/api/order/orderHistory");
  const [cancellingId, setCancellingId] = useState(null);
  const [confirming, setConfirming] = useState(null);
  // ?status=shipped: Back, reload and shared links keep the tab. Unknown values fall back to All.
  const [statusParam, setFilter] = useUrlState("status", "all");
  const filter = FILTERS.some((f) => f.value === statusParam) ? statusParam : "all";
  const orders = useMemo(() => data?.orders ?? [], [data]);

  const counts = useMemo(() => {
    const result = { all: orders.length };
    orders.forEach((o) => {
      result[o.status] = (result[o.status] ?? 0) + 1;
    });
    return result;
  }, [orders]);
  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const cancelOrder = async (orderId) => {
    setConfirming(null);
    setCancellingId(orderId);
    try {
      await apiClient.put(`/api/order/${orderId}/cancel`);
      toast.success("Order cancelled");
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not cancel the order"));
    } finally {
      setCancellingId(null);
    }
  };

  let body;
  if (loading) body = <HistorySkeleton />;
  else if (error) body = <LoadError title="Could not load your orders" message={error} onRetry={reload} />;
  else if (orders.length === 0)
    body = (
      <EmptyState
        illustration="orders"
        title="No orders yet"
        body="When you place an order it shows up here, with each item's status from its seller."
        action={
          <Button asChild>
            <Link to="/">Browse the shop</Link>
          </Button>
        }
      />
    );
  else if (visible.length === 0)
    body = (
      <EmptyState
        illustration="orders"
        title={`No ${filter} orders`}
        body="Orders move from pending to shipped to delivered as sellers update them."
        action={<Button variant="outline" onClick={() => setFilter("all")}>Show all orders</Button>}
      />
    );
  else
    body = (
      <ul className="flex flex-col gap-4">
        {visible.map((order, index) => (
          <OrderPanel
            key={order.orderId}
            order={order}
            index={index}
            cancelling={cancellingId === order.orderId}
            onCancel={setConfirming}
          />
        ))}
      </ul>
    );

  return (
    <Container className="pt-5 pb-10">
      <div className="mx-auto max-w-[1120px]">
        <PageHeader
          title="My orders"
          count={!loading && !error ? `${orders.length} ${orders.length === 1 ? "order" : "orders"}` : undefined}
          subtitle="You can cancel an order while it is pending. Cancelled orders are not listed."
          className="mb-4"
          actions={!loading && !error && orders.length > 0 ? <FilterTabs value={filter} onChange={setFilter} counts={counts} /> : null}
        />
        {body}
      </div>

      <Dialog open={Boolean(confirming)} onOpenChange={(open) => !open && setConfirming(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel order {confirming ? shortId(confirming.orderId) : ""}?</DialogTitle>
            <DialogDescription>
              All items in this order will be cancelled and returned to the sellers' stock. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Keep order</Button>
            </DialogClose>
            <Button variant="destructive" onClick={() => confirming && cancelOrder(confirming.orderId)}>
              Cancel order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default OrderHistoryPage;
