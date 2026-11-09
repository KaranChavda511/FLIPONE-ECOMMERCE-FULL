import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useApiGet } from "../../hooks/useApiGet";
import { useUrlState } from "../../hooks/useUrlState";
import { imageUrl } from "../../utils/imageUrl";
import { formatDate, formatInr, formatNumber, shortId } from "@/lib/format";
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
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import SearchBox from "../components/SearchBox";
import FilterTabs from "../components/FilterTabs";
import { AnimatedRow, ErrorRow, SkeletonRows } from "../components/TableBits";

const STATUSES = ["pending", "shipped", "delivered", "cancelled"];
const COLUMNS = 5;
const SHIPPING_LABEL = { flat: "Flat rate", pickup: "Local pickup" };

const matchesQuery = (order, q) => {
  if (!q) return true;
  const needle = q.toLowerCase().replace(/^#/, "");
  const haystack = [
    order._id,
    order.user?.name,
    order.user?.email,
    order.shippingAddress?.city,
    ...(order.items ?? []).flatMap((item) => [item.name, item.seller?.name]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
};

/**
 * Read-only order overview. Sellers move their own items through pending → shipped → delivered;
 * the backend has no admin endpoint to change or delete an order.
 */
const Order_Manage = () => {
  const { data, loading, error, reload } = useApiGet("/api/admin/analytics/seller-orders");
  const orders = useMemo(() => data?.orders ?? [], [data]);
  // View state lives in the URL (?q=&status=); the dashboard search links here with ?q=.
  const [, setSearchParams] = useSearchParams();
  const [q, setQ] = useUrlState("q", "");
  const [statusParam, setStatus] = useUrlState("status", "all");
  const status = statusParam === "all" || STATUSES.includes(statusParam) ? statusParam : "all";

  // The box keeps its own copy so typing never waits on the router (it updates the URL in a transition);
  // a URL change from elsewhere (Back/Forward, Clear filters) is copied back in.
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

  const searched = useMemo(() => orders.filter((order) => matchesQuery(order, query.trim())), [orders, query]);
  const visible = status === "all" ? searched : searched.filter((order) => order.status === status);

  const tabs = [
    { value: "all", label: "All", count: searched.length },
    ...STATUSES.map((s) => ({
      value: s,
      label: s.charAt(0).toUpperCase() + s.slice(1),
      count: searched.filter((order) => order.status === s).length,
    })),
  ];

  // One URL update: separate setters in one handler would each start from the same URL and undo each other.
  const clearFilters = () => {
    setQueryText("");
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        ["q", "status"].forEach((key) => next.delete(key));
        return next;
      },
      { replace: true, preventScrollReset: true }
    );
  };

  return (
    <PortalShell
      variant="admin"
      title="Orders"
      subtitle="Read only. Each seller moves their own items from pending to shipped to delivered."
      actions={
        <SearchBox value={query} onChange={setQuery} placeholder="Order id, customer, seller" label="Search orders" />
      }
    >

      <DataTable
        label="Orders"
        toolbar={
          <DataTableToolbar>
            <h2 className="sr-only">Orders</h2>
            <FilterTabs label="Filter orders by status" options={tabs} value={status} onChange={setStatus} />
          </DataTableToolbar>
        }
        footer={
          !loading &&
          !error &&
          orders.length > 0 && (
            <DataTableFooter>
              <span className="tabular">
                Showing {formatNumber(visible.length)} of the latest {formatNumber(orders.length)} orders
              </span>
            </DataTableFooter>
          )
        }
      >
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items · seller · item status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Order status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <SkeletonRows rows={8} cols={COLUMNS} />
          ) : error ? (
            <ErrorRow colSpan={COLUMNS} title="Could not load orders" message={error} onRetry={reload} />
          ) : orders.length === 0 ? (
            <DataTableMessage colSpan={COLUMNS}>
              <EmptyState
                variant="plain"
                illustration="orders"
                headingLevel="h3"
                title="No orders yet"
                body="Orders show up here as soon as shoppers check out."
              />
            </DataTableMessage>
          ) : visible.length === 0 ? (
            <DataTableMessage colSpan={COLUMNS}>
              <EmptyState
                variant="plain"
                illustration="results"
                headingLevel="h3"
                title="No orders match"
                body={query ? `Nothing matches “${query}” with this status.` : "No orders have this status."}
                action={
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            </DataTableMessage>
          ) : (
            visible.map((order, index) => (
              <AnimatedRow key={order._id} index={index} className="align-top">
                <TableCell className="align-top">
                  <span className="font-display text-[14px] font-semibold tracking-[0.06em]" title={order._id}>
                    {shortId(order._id)}
                  </span>
                  {/* the date sits under the id (every order is cash on delivery, so that note said nothing) */}
                  <CellSub className="tabular">{formatDate(order.createdAt)}</CellSub>
                </TableCell>
                <TableCell className="align-top">
                  <CellText strong>{order.user?.name ?? "Deleted account"}</CellText>
                  <CellSub>
                    <CellText max="24ch">{order.user?.email ?? "—"}</CellText>
                  </CellSub>
                  {order.shippingAddress?.city && <CellSub>{order.shippingAddress.city}</CellSub>}
                </TableCell>
                <TableCell className="py-2 align-top">
                  <ul className="flex min-w-[360px] flex-col gap-2 xl:min-w-[440px]">
                    {(order.items ?? []).map((item, i) => (
                      <li key={item._id ?? i} className="flex items-center gap-2.5">
                        <img
                          src={imageUrl(item.image)}
                          alt=""
                          loading="lazy"
                          className="h-[45px] w-9 shrink-0 rounded-[3px] bg-paper-2 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <CellText strong max="22ch" className="font-semibold">
                            {item.name ?? "Removed product"}
                          </CellText>
                          <CellSub className="tabular">
                            {formatNumber(item.quantity)} × {formatInr(item.price)} · {item.seller?.name ?? "Unknown seller"}
                          </CellSub>
                        </div>
                        <Stamp status={item.status ?? "pending"} className="ml-auto" />
                      </li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell className="text-right align-top">
                  <span className="font-semibold tabular">{formatInr(order.totalAmount)}</span>
                  <CellSub>
                    {SHIPPING_LABEL[order.shippingMethod] ?? "Delivery"}
                    {order.shippingFee ? ` ${formatInr(order.shippingFee)}` : ""}
                  </CellSub>
                </TableCell>
                <TableCell className="align-top">
                  <Stamp status={order.status ?? "pending"} />
                </TableCell>
              </AnimatedRow>
            ))
          )}
        </TableBody>
      </DataTable>
    </PortalShell>
  );
};

export default Order_Manage;
