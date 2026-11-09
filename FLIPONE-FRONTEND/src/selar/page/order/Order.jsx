import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Check, CircleAlert, Loader2, Truck, PackageCheck } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CellSub,
  CellText,
  DataTable,
  DataTableFooter,
  DataTableMessage,
  DataTableToolbar,
  EmptyState,
  PortalShell,
  Stamp,
} from "@/components/flipone";
import { formatDate, formatInr, formatNumber, shortId } from "@/lib/format";
import { imageUrl } from "@/utils/imageUrl";
import apiClient, { apiErrorMessage } from "../../../config/apiClient";
import { useApiGet } from "../../../hooks/useApiGet";
import { useUrlState } from "../../../hooks/useUrlState";
import FilterTabs from "../../components/FilterTabs";
import { PanelError } from "../../components/Panel";
import SearchBox from "../../components/SearchBox";
import StatusTrack from "../../components/StatusTrack";
import { flattenOrderItems, lineAmount, NEXT_STATUS, staggerDelay } from "../../lib/seller";

const COLS = 6;
const STATUSES = ["all", "pending", "shipped", "delivered", "cancelled"];
const MotionRow = motion.create(TableRow);
const ACTION = {
  shipped: { label: "Mark shipped", icon: Truck },
  delivered: { label: "Mark delivered", icon: PackageCheck },
};

const Order = () => {
  const { data, loading, error, setData, reload } = useApiGet("/api/seller/allOrders");
  const orders = useMemo(() => data?.orders ?? [], [data]);
  const items = useMemo(() => flattenOrderItems(orders), [orders]);

  // View state lives in the URL (?status=&q=) so Back/Forward, reloads and shared links keep it.
  const [, setSearchParams] = useSearchParams();
  const [statusParam, setFilter] = useUrlState("status", "all");
  const [q, setQ] = useUrlState("q", "");
  const filter = STATUSES.includes(statusParam) ? statusParam : "all";

  // The box keeps its own copy so typing never waits on the router (it updates the URL in a transition);
  // a URL change from elsewhere (Back/Forward, Show all items) is copied back in.
  const [query, setQueryText] = useState(q);
  const [shownQ, setShownQ] = useState(q);
  if (q !== shownQ) {
    setShownQ(q);
    setQueryText(q);
  }
  const setQuery = (value) => {
    setQueryText(value);
    setQ(value);
  };
  // One URL update: separate setters in one handler would each start from the same URL and undo each other.
  const showAll = () => {
    setQueryText("");
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        ["status", "q"].forEach((key) => next.delete(key));
        return next;
      },
      { replace: true, preventScrollReset: true }
    );
  };

  const [updating, setUpdating] = useState(null); // itemId being saved

  const counts = useMemo(() => {
    const c = { all: items.length, pending: 0, shipped: 0, delivered: 0, cancelled: 0 };
    items.forEach((item) => {
      if (c[item.status] != null) c[item.status] += 1;
    });
    return c;
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^#/, "");
    return items.filter((item) => {
      if (filter !== "all" && item.status !== filter) return false;
      if (!q) return true;
      return [String(item.orderId), item.customer, item.productName, item.city].some((v) =>
        String(v ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, filter, query]);

  const handleStatusChange = async (orderId, itemId, status) => {
    setUpdating(itemId);
    try {
      await apiClient.patch(`/api/seller/orders/${orderId}/items/${itemId}`, { status });
      setData((prev) => ({
        ...prev,
        orders: prev.orders.map((order) =>
          order.orderId === orderId
            ? { ...order, items: order.items.map((item) => (item.itemId === itemId ? { ...item, status } : item)) }
            : order
        ),
      }));
      toast.success(`Item marked as ${status}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update status"));
    } finally {
      setUpdating(null);
    }
  };

  const tabs = [
    { value: "all", label: "All", count: counts.all },
    { value: "pending", label: "Pending", count: counts.pending },
    { value: "shipped", label: "Shipped", count: counts.shipped },
    { value: "delivered", label: "Delivered", count: counts.delivered },
    ...(counts.cancelled ? [{ value: "cancelled", label: "Cancelled", count: counts.cancelled }] : []),
  ];

  return (
    <PortalShell
      variant="seller"
      title="Orders"
      titleAddon={
        !loading && !error ? (
          <span className="text-[15px] font-medium text-muted-foreground tabular">
            {formatNumber(orders.length)} {orders.length === 1 ? "order" : "orders"}
          </span>
        ) : null
      }
      actions={<SearchBox value={query} onChange={setQuery} label="Search order items" placeholder="Order id, customer or item" />}
    >
      <DataTable
        label="Order items"
        maxHeight="calc(100vh - 280px)"
        toolbar={
          <DataTableToolbar>
            <h2 className="sr-only">Order items</h2>
            <FilterTabs label="Filter order items by status" value={filter} onChange={setFilter} items={tabs} />
            {!loading && !error && (
              <div className="ml-auto flex items-center gap-1.5 text-[13px] text-muted-foreground" aria-live="polite">
                {counts.pending > 0 ? (
                  <>
                    <CircleAlert className="size-4 text-warning" strokeWidth={1.75} aria-hidden="true" />
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={counts.pending}
                        initial={{ scale: 1.35, opacity: 0.4 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 600, damping: 22 }}
                        className="inline-block font-display text-[14px] font-semibold text-ink tabular"
                      >
                        {counts.pending}
                      </motion.span>
                    </AnimatePresence>
                    {counts.pending === 1 ? "item waiting to ship" : "items waiting to ship"}
                  </>
                ) : (
                  <>
                    <Check className="size-4 text-success" strokeWidth={2} aria-hidden="true" />
                    Nothing waiting to ship
                  </>
                )}
              </div>
            )}
          </DataTableToolbar>
        }
        footer={
          !loading && !error && items.length > 0 ? (
            <DataTableFooter>
              <span>Status changes save per item.</span>
              <span className="tabular">
                {visible.length === items.length
                  ? `${formatNumber(items.length)} items`
                  : `${formatNumber(visible.length)} of ${formatNumber(items.length)} items`}
              </span>
            </DataTableFooter>
          ) : null
        }
      >
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Next step</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 7 }, (_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-[45px] w-9" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-4 w-14" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-[30px] w-24 xl:w-[260px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-7 w-28" />
                </TableCell>
              </TableRow>
            ))
          ) : error ? (
            <DataTableMessage colSpan={COLS} className="py-0">
              <PanelError title="Could not load your orders" message={error} onRetry={reload} />
            </DataTableMessage>
          ) : items.length === 0 ? (
            <DataTableMessage colSpan={COLS} className="py-2">
              <EmptyState
                variant="plain"
                illustration="orders"
                title="No orders yet"
                body="When a shopper orders one of your products, each item shows up here as pending."
              />
            </DataTableMessage>
          ) : visible.length === 0 ? (
            <DataTableMessage colSpan={COLS} className="py-2">
              <EmptyState
                variant="plain"
                illustration="results"
                title="No order items match"
                body="Try another status or search term."
                action={
                  <Button variant="outline" size="sm" onClick={showAll}>
                    Show all items
                  </Button>
                }
              />
            </DataTableMessage>
          ) : (
            visible.map((item, index) => {
              const next = NEXT_STATUS[item.status];
              const action = next ? ACTION[next] : null;
              const saving = updating === item.itemId;
              return (
                <MotionRow
                  key={item.itemId}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: staggerDelay(index), ease: [0.22, 1, 0.36, 1] }}
                >
                  <TableCell>
                    <span
                      className="block font-display text-[14px] font-semibold tracking-[0.06em]"
                      title={String(item.orderId)}
                    >
                      {shortId(item.orderId)}
                    </span>
                    <CellSub className="tabular">{formatDate(item.date)}</CellSub>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <img
                        src={imageUrl(item.itemImage)}
                        alt=""
                        className="h-[45px] w-9 shrink-0 rounded-[3px] bg-paper-2 object-cover"
                      />
                      <div className="min-w-0">
                        <CellText strong max="24ch">{item.productName}</CellText>
                        <CellSub className="tabular">
                          {formatInr(item.price)} × {item.quantity}
                        </CellSub>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular">{formatInr(lineAmount(item))}</TableCell>
                  <TableCell>
                    <CellText strong>{item.customer || "—"}</CellText>
                    {item.city && <CellSub>{item.city}</CellSub>}
                  </TableCell>
                  <TableCell>
                    {/* The full three-step track needs ~260px: from xl only. Below, the current step as a stamp. */}
                    <div className="hidden xl:block">
                      <StatusTrack status={item.status} />
                    </div>
                    <Stamp status={item.status} className="xl:hidden" />
                  </TableCell>
                  <TableCell className="text-right">
                    {action ? (
                      <Button
                        size="xs"
                        className="w-[140px]"
                        disabled={updating != null}
                        onClick={() => handleStatusChange(item.orderId, item.itemId, next)}
                        aria-label={`${action.label}: ${item.productName}, order ${shortId(item.orderId)}`}
                      >
                        {saving ? <Loader2 className="animate-spin" aria-hidden="true" /> : <action.icon aria-hidden="true" />}
                        {saving ? "Saving…" : action.label}
                      </Button>
                    ) : (
                      <span className="pr-1 text-[13px] text-muted-foreground">
                        {item.status === "delivered" ? "Complete" : "No action"}
                      </span>
                    )}
                  </TableCell>
                </MotionRow>
              );
            })
          )}
        </TableBody>
      </DataTable>
    </PortalShell>
  );
};

export default Order;
