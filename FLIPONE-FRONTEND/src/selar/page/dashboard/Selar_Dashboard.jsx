import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import { ArrowRight, Banknote, Clock, PackageOpen, Plus, ReceiptText, TriangleAlert, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CellSub,
  CellText,
  DataTable,
  EmptyState,
  PortalShell,
  StatStrip,
  StatTile,
  Stamp,
  StatusMeterList,
} from "@/components/flipone";
import {
  LazyChart,
  TABLE_COLUMNS,
  barListHeight,
  count,
  dailySummary,
  hasValues,
  inr,
  rankSummary,
  revenueOrdersCombo,
  topList,
} from "@/components/charts";
import { formatDate, formatInr, formatNumber, shortId } from "@/lib/format";
import { cn } from "@/lib/utils";
import { imageUrl } from "@/utils/imageUrl";
import { useApiGet } from "../../../hooks/useApiGet";
import { useUrlState } from "../../../hooks/useUrlState";
import FilterTabs from "../../components/FilterTabs";
import { Panel, PanelError } from "../../components/Panel";
import SegmentBar from "../../components/SegmentBar";
import StockCell from "../../components/StockCell";
import {
  ANALYTICS_URL,
  flattenOrderItems,
  inventorySegments,
  LOW_STOCK_AT,
  lineAmount,
  staggerDelay,
} from "../../lib/seller";

const LIST_LIMIT = 8;
/* Top products sits beside the status list (head + four 44px rows + caption): about one height. */
const ROW_CHART_HEIGHT = 220;
const MotionRow = motion.create(TableRow);

const RANGES = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

const TOP_COLUMNS = [
  { key: "name", label: "Product", format: (v) => String(v ?? "Other") },
  { key: "revenue", label: "Revenue", format: inr },
  { key: "units", label: "Units sold", format: count },
];

const sum = (rows, key) => (rows ?? []).reduce((total, row) => total + (Number(row?.[key]) || 0), 0);

/** Muted caption for a panel header's right side. */
const PanelNote = ({ children }) => <span className="text-[13px] text-muted-foreground">{children}</span>;

/** One figure of the selected period, printed above the hero chart. */
function PeriodFigure({ label, value, loading }) {
  return (
    <div className="min-w-0">
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-display text-[22px] leading-none font-semibold text-ink tabular">
        {loading ? <Skeleton className="h-[22px] w-20" /> : value}
      </dd>
    </div>
  );
}

/*
 * Figures come from GET /api/seller/analytics (cancelled items never count as sales). The "Needs attention"
 * lists still come from the seller's own products (GET /api/seller/products) and order items
 * (GET /api/seller/allOrders), because they list individual rows.
 */
const Selar_Dashboard = () => {
  const sellerName = useSelector((state) => state.seller?.sellerInfo?.name);
  // ?days= keeps the chosen period across Back/Forward, reloads and shared links; unknown values fall back to 30.
  const [daysParam, setDays] = useUrlState("days", 30, "number");
  const days = RANGES.some((range) => range.value === daysParam) ? daysParam : 30;

  const analyticsReq = useApiGet(ANALYTICS_URL, { days });
  const productsReq = useApiGet("/api/seller/products");
  const ordersReq = useApiGet("/api/seller/allOrders");

  const analytics = analyticsReq.data;
  const daily = useMemo(() => analytics?.daily ?? [], [analytics]);
  const topProducts = useMemo(() => analytics?.topProducts ?? [], [analytics]);
  const statusCounts = analytics?.statusCounts;
  const inventory = analytics?.products;
  const threshold = analytics?.lowStockThreshold ?? LOW_STOCK_AT;

  // The hook keeps the previous response while a new ?days= request is in flight.
  const refreshing = Boolean(analytics) && analytics.days !== days && !analyticsReq.error;
  const chartLoading = analyticsReq.loading;
  const chartError = analyticsReq.error && !refreshing ? analyticsReq.error : null;

  const comboOption = useMemo(() => revenueOrdersCombo(daily), [daily]);
  const topOption = useMemo(() => topList(topProducts, "revenue", { labelKey: "name", limit: 5 }), [topProducts]);

  const products = useMemo(() => productsReq.data?.products ?? [], [productsReq.data]);
  const orders = useMemo(() => ordersReq.data?.orders ?? [], [ordersReq.data]);

  const attentionLists = useMemo(() => {
    // Oldest first: the item that has waited longest is the one to ship next.
    const pending = flattenOrderItems(orders)
      .filter((item) => item.status === "pending")
      .sort((a, b) => new Date(a.date ?? 0) - new Date(b.date ?? 0));
    // Same line as the analytics low-stock count, so the list and the stat tile agree.
    const lowStock = products
      .filter((p) => (Number(p.stock) || 0) <= threshold)
      .sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0));
    return { pending, lowStock };
  }, [orders, products, threshold]);

  const attention = attentionLists.pending.length + attentionLists.lowStock.length;
  const loadingLists = productsReq.loading || ordersReq.loading;
  const pendingClear = !ordersReq.loading && !ordersReq.error && attentionLists.pending.length === 0;
  const totals = analytics?.totals;
  const lowCount = inventory ? Number(inventory.lowStock) || 0 : undefined;
  const outCount = inventory ? Number(inventory.outOfStock) || 0 : undefined;

  return (
    <PortalShell
      variant="seller"
      title="Dashboard"
      subtitle={`${sellerName ? `Signed in as ${sellerName}. ` : ""}Sales figures leave out cancelled items.`}
      actions={
        <>
          <Button asChild variant="outline" size="sm">
            <Link to="/orders">
              <Truck aria-hidden="true" />
              Orders
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/selar_Products?add=1">
              <Plus aria-hidden="true" />
              Add product
            </Link>
          </Button>
        </>
      }
    >
      <StatStrip aria-label="Shop at a glance">
        <StatTile
          label="Revenue, all time"
          icon={Banknote}
          value={totals?.revenue}
          format="inr"
          loading={analyticsReq.loading}
          animate
        />
        <StatTile label="Units sold" icon={PackageOpen} value={totals?.units} loading={analyticsReq.loading} animate />
        <StatTile label="Orders" icon={ReceiptText} value={totals?.orders} loading={analyticsReq.loading} animate />
        <StatTile
          label="Items pending"
          icon={Clock}
          value={statusCounts?.pending}
          note="to ship"
          loading={analyticsReq.loading}
          animate
        />
        <StatTile
          label="Low / out of stock"
          icon={TriangleAlert}
          note={inventory ? `low = 1 to ${threshold}` : undefined}
          value={
            inventory ? (
              <span className="tabular">
                <span aria-hidden="true">
                  <span className={lowCount ? "text-warning" : undefined}>{formatNumber(lowCount)}</span>
                  <span className="px-1 font-normal text-line">/</span>
                  <span className={outCount ? "text-danger" : undefined}>{formatNumber(outCount)}</span>
                </span>
                <span className="sr-only">{`${formatNumber(lowCount)} low, ${formatNumber(outCount)} out of stock`}</span>
              </span>
            ) : undefined
          }
          loading={analyticsReq.loading}
        />
      </StatStrip>

      {/* Hero: revenue and orders per day for the selected period */}
      <Panel
        title="Revenue and orders"
        titleId="dash-sales"
        action={<FilterTabs label="Period" items={RANGES} value={days} onChange={setDays} />}
      >
        <div className="px-4 pt-3.5 pb-4">
          <dl
            className="mb-3 flex flex-wrap gap-x-10 gap-y-2"
            aria-label={`Last ${days} days`}
            aria-busy={refreshing || undefined}
          >
            <PeriodFigure label={`Revenue, last ${days} days`} value={formatInr(sum(daily, "revenue"))} loading={chartLoading || refreshing} />
            <PeriodFigure label="Orders" value={formatNumber(sum(daily, "orders"))} loading={chartLoading || refreshing} />
            <PeriodFigure label="Units sold" value={formatNumber(sum(daily, "units"))} loading={chartLoading || refreshing} />
          </dl>
          <div
            className={cn("transition-opacity duration-200", refreshing && "opacity-50")}
            aria-busy={refreshing || undefined}
          >
            <LazyChart
              option={comboOption}
              height={300}
              ariaLabel={`Revenue and orders per day, last ${analytics?.days ?? days} days`}
              summary={`${dailySummary(daily, { key: "revenue" })} ${dailySummary(daily, { key: "orders" })}`}
              table={{ columns: TABLE_COLUMNS.revenueOrders, rows: daily }}
              loading={chartLoading}
              error={chartError}
              onRetry={analyticsReq.reload}
              empty={!hasValues(daily, ["revenue", "orders"])}
              emptyTitle={`No sales in the last ${analytics?.days ?? days} days`}
              emptyBody="Revenue and orders show here day by day once shoppers buy your products. Try a longer period."
            />
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-12 items-start gap-[18px]">
        <Panel
          title="Top products"
          titleId="dash-top"
          action={<PanelNote>By revenue, all time</PanelNote>}
          className="col-span-12 lg:col-span-6 xl:col-span-7"
        >
          <div className="px-4 py-4">
            <LazyChart
              option={topOption}
              height={Math.max(ROW_CHART_HEIGHT, barListHeight(topProducts.length))}
              ariaLabel="Top products by revenue"
              summary={rankSummary(topProducts, { valueKey: "revenue", labelKey: "name" })}
              table={{ columns: TOP_COLUMNS, rows: topProducts }}
              loading={chartLoading}
              error={chartError}
              onRetry={analyticsReq.reload}
              empty={!hasValues(topProducts, ["revenue"])}
              emptyTitle="No sales yet"
              emptyBody="Your best sellers rank here after the first order."
            />
          </div>
        </Panel>

        {chartError && !statusCounts ? (
          <Panel title="Order items by status" titleId="dash-status" className="col-span-12 lg:col-span-6 xl:col-span-5">
            <PanelError title="Could not load the status counts" message={chartError} onRetry={analyticsReq.reload} />
          </Panel>
        ) : (
          <StatusMeterList
            title="Order items by status"
            counts={statusCounts}
            unit="items"
            qualifier="all time"
            caption="Counted per order item: an order with 3 items counts 3 times."
            loading={chartLoading}
            className="col-span-12 min-w-0 lg:col-span-6 xl:col-span-5"
          />
        )}
      </div>

      <div className="flex items-baseline gap-3 pt-1">
        <h2 className="text-[19px] leading-snug font-semibold tracking-[-0.01em]">Needs attention</h2>
        {!loadingLists && (
          <span className="text-[14px] text-muted-foreground tabular">
            {attention} {attention === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-12 items-start gap-[18px]">
        {/* Pending order items. Nothing pending: one compact line, no table head or illustration. */}
        {pendingClear ? (
          <section
            aria-labelledby="dash-pending"
            className="col-span-12 flex min-h-[52px] flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-line-soft bg-surface px-4 py-2.5"
          >
            <Stamp variant="delivered">Clear</Stamp>
            <h2 id="dash-pending" className="text-[15px] leading-snug font-semibold text-ink">
              Nothing waiting to ship
            </h2>
            <span className="text-[13.5px] text-muted-foreground">New order items show here as pending.</span>
            <Button asChild variant="ghost" size="sm" className="ml-auto">
              <Link to="/orders">
                All orders
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </section>
        ) : (
        <Panel
          title="Waiting to ship"
          titleId="dash-pending"
          count={ordersReq.loading ? undefined : attentionLists.pending.length}
          // Full width: its height follows the pending count, so a side column next to it left dead space.
          className="col-span-12"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/orders">
                All orders
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          }
        >
          {ordersReq.error ? (
            <PanelError title="Could not load your orders" message={ordersReq.error} onRetry={ordersReq.reload} />
          ) : (
          <DataTable label="Pending order items" maxHeight="none" className="rounded-none border-0">
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersReq.loading ? (
                Array.from({ length: 4 }, (_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    <TableCell colSpan={6}>
                      <Skeleton className="h-9 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                attentionLists.pending.slice(0, LIST_LIMIT).map((item, index) => (
                  <MotionRow
                    key={item.itemId}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: staggerDelay(index), ease: [0.22, 1, 0.36, 1] }}
                  >
                    <TableCell>
                      <span className="block font-display text-[14px] font-semibold tracking-[0.06em]">{shortId(item.orderId)}</span>
                      <CellSub className="tabular">{formatDate(item.date)}</CellSub>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <img
                          src={imageUrl(item.itemImage)}
                          alt=""
                          className="h-[45px] w-9 shrink-0 rounded-[3px] bg-paper-2 object-cover"
                        />
                        <CellText strong max="22ch">{item.productName}</CellText>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular">{item.quantity}</TableCell>
                    <TableCell className="text-right font-semibold tabular">{formatInr(lineAmount(item))}</TableCell>
                    <TableCell>
                      <CellText strong>{item.customer || "—"}</CellText>
                      {item.city && <CellSub>{item.city}</CellSub>}
                    </TableCell>
                    <TableCell>
                      <Stamp status={item.status} />
                    </TableCell>
                  </MotionRow>
                ))
              )}
            </TableBody>
          </DataTable>
          )}
          {!ordersReq.loading && !ordersReq.error && attentionLists.pending.length > LIST_LIMIT && (
            <p className="border-t border-line-soft px-4 py-2.5 text-[13px] text-muted-foreground">
              Showing the {LIST_LIMIT} oldest of {attentionLists.pending.length}.{" "}
              <Link to="/orders" className="rounded-sm font-medium text-ink underline underline-offset-[3px] hover:decoration-2">
                Ship them from Orders
              </Link>
            </p>
          )}
        </Panel>
        )}

        {/* Stock: one full-width panel (inventory strip + low/out-of-stock list in two columns), so its
            height follows the data and never leaves a short panel beside a tall one. */}
        <Panel
          title="Stock"
          titleId="dash-stock"
          count={inventory ? formatNumber(inventory.active) : undefined}
          className="col-span-12"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/selar_Products">
                All products
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          }
        >
          {/* Inventory health: active products split by stock level */}
          <div className="border-b border-line-soft px-4 py-3">
            {chartLoading ? (
              <Skeleton className="h-5 w-full" aria-label="Loading inventory" />
            ) : chartError && !inventory ? (
              <PanelError title="Could not load your stock figures" message={chartError} onRetry={analyticsReq.reload} className="py-2" />
            ) : !inventory || !Number(inventory.active) ? (
              <p className="text-[14px] text-muted-foreground">No active products yet.</p>
            ) : (
              <SegmentBar layout="inline" label="Active products by stock level" segments={inventorySegments(inventory, threshold)} />
            )}
          </div>

          <h3 className="px-4 pt-3 pb-1 text-[13px] font-semibold text-muted-foreground">
            Low or out of stock
            {!productsReq.loading && (
              <span className="ml-1.5 font-display text-[14px] text-ink tabular">{attentionLists.lowStock.length}</span>
            )}
          </h3>

          {productsReq.loading ? (
            <ul className="grid lg:grid-cols-2" aria-label="Loading products">
              {Array.from({ length: 4 }, (_, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <Skeleton className="h-[45px] w-9" />
                  <Skeleton className="h-4 flex-1" />
                </li>
              ))}
            </ul>
          ) : productsReq.error ? (
            <PanelError title="Could not load your products" message={productsReq.error} onRetry={productsReq.reload} />
          ) : products.length === 0 ? (
            <EmptyState
              variant="plain"
              illustration="products"
              headingLevel="h3"
              title="No products yet"
              body="List your first product with its MRP, stock and up to 5 photos."
              action={
                <Button asChild variant="ink" size="sm">
                  <Link to="/selar_Products?add=1">
                    <Plus aria-hidden="true" />
                    Add product
                  </Link>
                </Button>
              }
            />
          ) : attentionLists.lowStock.length === 0 ? (
            <p className="px-4 pt-1 pb-4 text-[14px] text-muted-foreground">Every product has more than {threshold} in stock.</p>
          ) : (
            <ul className="grid border-t border-line-soft lg:grid-cols-2">
              {attentionLists.lowStock.slice(0, LIST_LIMIT).map((product, index) => (
                <motion.li
                  key={product.productId}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: staggerDelay(index), ease: [0.22, 1, 0.36, 1] }}
                  // Rule only between rows (2 per row at lg): the last row sits on the panel's own edge.
                  className={cn(
                    "flex items-center gap-3 border-line-soft px-4 py-2.5 transition-colors hover:bg-row-hover lg:odd:border-r",
                    index < Math.min(attentionLists.lowStock.length, LIST_LIMIT) - 1 && "max-lg:border-b",
                    index < (Math.ceil(Math.min(attentionLists.lowStock.length, LIST_LIMIT) / 2) - 1) * 2 && "lg:border-b"
                  )}
                >
                  <img
                    src={imageUrl(product.images)}
                    alt=""
                    className="h-[45px] w-9 shrink-0 rounded-[3px] bg-paper-2 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium" title={product.name}>
                      {product.name}
                    </span>
                    <StockCell stock={product.stock} className="mt-1" />
                  </div>
                  <Button asChild variant="outline" size="xs">
                    <Link to={`/updateproduct/${product.productId}`} aria-label={`Restock ${product.name}`}>
                      Restock
                    </Link>
                  </Button>
                </motion.li>
              ))}
            </ul>
          )}
          {!productsReq.loading && attentionLists.lowStock.length > LIST_LIMIT && (
            <p className="px-4 py-2.5 text-[13px] text-muted-foreground">
              Showing the {LIST_LIMIT} lowest of {attentionLists.lowStock.length}.
            </p>
          )}
        </Panel>
      </div>
    </PortalShell>
  );
};

export default Selar_Dashboard;
