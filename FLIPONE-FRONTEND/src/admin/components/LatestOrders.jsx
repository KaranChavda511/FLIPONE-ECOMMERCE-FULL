import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { formatDate, formatInr, formatNumber, shortId } from "@/lib/format";
import {
  CellSub,
  CellText,
  DataTable,
  DataTableFooter,
  DataTableMessage,
  DataTableToolbar,
  EmptyState,
  Stamp,
} from "@/components/flipone";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import FilterTabs from "./FilterTabs";
import Pager from "./Pager";
import { AnimatedRow, ErrorRow, SkeletonRows } from "./TableBits";

const ORDER_STATUSES = ["pending", "shipped", "delivered", "cancelled"];
const ROWS_PER_PAGE = 8;
const COLUMNS = 7;

const itemCount = (order) => (order.items ?? []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
const orderNoun = (n) => (n === 1 ? "order" : "orders");

/**
 * Dashboard "Latest orders" (mock-up admin `.panel` + `.tabs` + table + `.tbl-foot`): status tabs with counts,
 * 8 rows per page, footer that says what the count includes.
 *
 * orders: GET /api/admin/analytics/seller-orders?limit= (newest first). `limit` is that request's cap: when the
 * list is full, the footer says only the latest `limit` orders are counted here.
 * status / onStatusChange: the active tab ('all' or an order status), owned by the page so the status list
 * beside the table can set it too.
 */
export default function LatestOrders({ orders, limit, status, onStatusChange, loading, error, onRetry, className }) {
  // Page belongs to one status: switching tabs (here or from the status list) starts at page 1 again.
  const [paging, setPaging] = useState({ status, page: 1 });
  const list = Array.isArray(orders) ? orders : [];
  const visible = status === "all" ? list : list.filter((order) => (order.status ?? "pending") === status);
  const totalPages = Math.max(Math.ceil(visible.length / ROWS_PER_PAGE), 1);
  const page = paging.status === status ? Math.min(paging.page, totalPages) : 1;
  const rows = visible.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const countOf = (s) => list.filter((order) => (order.status ?? "pending") === s).length;
  const cancelled = countOf("cancelled");
  const capped = Boolean(limit) && list.length >= limit;

  const tabs = [
    { value: "all", label: "All", count: list.length },
    ...ORDER_STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1), count: countOf(s) })),
  ];

  const from = (page - 1) * ROWS_PER_PAGE + 1;
  const to = Math.min(page * ROWS_PER_PAGE, visible.length);
  const range = visible.length > ROWS_PER_PAGE ? `${formatNumber(from)}–${formatNumber(to)}` : formatNumber(visible.length);
  const footerText = [
    status === "all"
      ? `Showing ${range} of ${formatNumber(visible.length)} ${orderNoun(visible.length)}`
      : `Showing ${range} of ${formatNumber(visible.length)} ${status} ${orderNoun(visible.length)}`,
    status === "all" ? (cancelled > 0 ? `incl. ${formatNumber(cancelled)} cancelled` : null) : null,
    capped ? `latest ${formatNumber(limit)} only` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const ready = !loading && !error && list.length > 0;

  return (
    <DataTable
      label="Latest orders"
      maxHeight="none"
      className={className}
      toolbar={
        <DataTableToolbar>
          <h2 className="sr-only">Latest orders</h2>
          <FilterTabs
            label="Filter latest orders by status"
            options={ready ? tabs : tabs.map(({ count: _count, ...tab }) => tab)}
            value={status}
            onChange={onStatusChange}
          />
          <div className="ml-auto">
            {/* -mr-2.5: label and chevron end on the same edge as the row chevrons below */}
            <Button asChild variant="ghost" size="sm" className="-mr-2.5">
              <Link to="/order_manage">
                All orders
                <ChevronRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </DataTableToolbar>
      }
      footer={
        ready && (
          <DataTableFooter className="min-h-[54px]">
            <span className="tabular">{footerText}</span>
            {totalPages > 1 && (
              <Pager
                page={page}
                totalPages={totalPages}
                onChange={(next) => setPaging({ status, page: next })}
                label="Latest orders pages"
              />
            )}
          </DataTableFooter>
        )
      }
    >
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead className="text-right">Items</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>
            <span className="sr-only">Open</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <SkeletonRows rows={ROWS_PER_PAGE} cols={COLUMNS} />
        ) : error ? (
          <ErrorRow colSpan={COLUMNS} title="Could not load orders" message={error} onRetry={onRetry} />
        ) : list.length === 0 ? (
          <DataTableMessage colSpan={COLUMNS}>
            <EmptyState
              variant="plain"
              illustration="orders"
              headingLevel="h3"
              title="No orders yet"
              body="Orders show up here as soon as shoppers check out."
            />
          </DataTableMessage>
        ) : rows.length === 0 ? (
          <DataTableMessage colSpan={COLUMNS}>
            <EmptyState
              variant="plain"
              illustration={null}
              headingLevel="h3"
              title={`No ${status} orders`}
              body={capped ? `None among the latest ${formatNumber(limit)} orders.` : "No order has this status right now."}
              action={
                <Button variant="outline" size="sm" onClick={() => onStatusChange("all")}>
                  Show all orders
                </Button>
              }
              className="py-6"
            />
          </DataTableMessage>
        ) : (
          rows.map((order, index) => {
            const id = shortId(order._id);
            const to = `/order_manage?q=${encodeURIComponent(id.slice(1))}`;
            return (
              <AnimatedRow key={order._id} index={index}>
                <TableCell>
                  <Link
                    to={to}
                    aria-label={`Order ${id}, open in Orders`}
                    className="font-display text-[14px] font-semibold tracking-[0.06em] text-ink underline-offset-[3px] transition-colors duration-150 hover:underline"
                  >
                    {id}
                  </Link>
                </TableCell>
                <TableCell>
                  <CellText strong>{order.user?.name ?? "Deleted account"}</CellText>
                  <CellSub>{order.shippingAddress?.city ?? order.user?.email ?? "—"}</CellSub>
                </TableCell>
                <TableCell className="text-right tabular">{formatNumber(itemCount(order))}</TableCell>
                <TableCell className="text-right font-semibold tabular">{formatInr(order.totalAmount)}</TableCell>
                <TableCell>
                  <Stamp status={order.status ?? "pending"} />
                </TableCell>
                <TableCell className="text-muted-foreground tabular">{formatDate(order.createdAt)}</TableCell>
                <TableCell className="w-10 pr-2">
                  <Link
                    to={to}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="grid size-[30px] place-items-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-paper-2 hover:text-ink"
                  >
                    <ChevronRight className="size-4" strokeWidth={1.75} />
                  </Link>
                </TableCell>
              </AnimatedRow>
            );
          })
        )}
      </TableBody>
    </DataTable>
  );
}
