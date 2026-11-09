import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Banknote, Boxes, ReceiptText, Store, Users } from "lucide-react";
import { useApiGet } from "../../hooks/useApiGet";
import { useUrlState } from "../../hooks/useUrlState";
import { formatNumber } from "@/lib/format";
import { PortalShell, StatStrip, StatTile } from "@/components/flipone";
import SearchBox from "../components/SearchBox";
import RevenueChart from "../components/RevenueChart";
import LatestOrders from "../components/LatestOrders";
import { CategoryPanel, GrowthPanel, OrderStatusPanel, TopSellersPanel } from "../components/AnalyticsPanels";
import { ErrorNotice } from "../components/Panel";

/* The latest-orders table pages through this many orders client-side; its footer says so when the cap is hit. */
const LATEST_ORDERS_LIMIT = 200;
const GROWTH_DAYS = 30;
/* Allowed ?days= and ?status= values (the RevenueChart periods and the LatestOrders tabs); anything else falls back. */
const PERIODS = [7, 30, 90];
const ORDER_STATUSES = ["all", "pending", "shipped", "delivered", "cancelled"];

/*
 * Layout (desktop 1024–1920): stat strip → [latest orders 8 | orders by status 4] at xl, stacked below →
 * revenue by day, full width → [revenue by category | top sellers | sign-ups] three-up at xl, two-up below.
 * At 1440×900 the first viewport holds the stat strip and the latest-orders table.
 */
const Admin_Dashboard = () => {
  const navigate = useNavigate();
  // View state lives in the URL (?q=&days=&status=) so Back/Forward, reloads and shared links keep it.
  const [q, setQ] = useUrlState("q", "");
  const [daysParam, setDays] = useUrlState("days", 30, "number");
  const [statusParam, setOrderStatus] = useUrlState("status", "all");
  const days = PERIODS.includes(daysParam) ? daysParam : 30;
  const orderStatus = ORDER_STATUSES.includes(statusParam) ? statusParam : "all";

  // The box keeps its own copy so typing never waits on the router (it updates the URL in a transition);
  // a URL change from elsewhere (Back/Forward) is copied back in.
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

  const users = useApiGet("/api/admin/analytics/users");
  // One request feeds both the all-time totals (stat strip) and the daily rows for the chosen period.
  const sales = useApiGet("/api/admin/analytics/sales", { days });
  const products = useApiGet("/api/admin/analytics/products");
  const statuses = useApiGet("/api/admin/analytics/order-status");
  const categories = useApiGet("/api/admin/analytics/categories");
  const sellers = useApiGet("/api/admin/analytics/seller-sells");
  const growth = useApiGet("/api/admin/analytics/growth", { days: GROWTH_DAYS });
  const latest = useApiGet("/api/admin/analytics/seller-orders", { limit: LATEST_ORDERS_LIMIT });

  // After a period switch the previous period stays on screen (dimmed) until the new rows arrive.
  const salesRefreshing = Boolean(sales.data) && !sales.error && sales.data.days != null && sales.data.days !== days;
  // A failed period switch keeps the totals (they are all-time): only a first-load failure blanks the strip.
  const salesFailed = Boolean(sales.error) && !sales.data;

  const statsLoading = users.loading || sales.loading || products.loading;
  const statsError = users.error || (salesFailed && sales.error) || products.error;
  const retryStats = () => {
    if (users.error) users.reload();
    if (salesFailed) sales.reload();
    if (products.error) products.reload();
  };

  const joined = users.data?.registeredLastMonth;

  const searchOrders = (event) => {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/order_manage?q=${encodeURIComponent(q)}` : "/order_manage");
  };

  // A status row in the list beside the table filters the table; selecting it again shows every order.
  const selectStatus = (status) => setOrderStatus(orderStatus === status ? "all" : status);

  return (
    <PortalShell
      variant="admin"
      title="Dashboard"
      subtitle={
        users.data
          ? `${formatNumber(joined ?? 0)} ${joined === 1 ? "shopper" : "shoppers"} joined in the last 30 days`
          : undefined
      }
      actions={
        <form role="search" onSubmit={searchOrders} aria-label="Search orders">
          <SearchBox
            value={query}
            onChange={setQuery}
            placeholder="Order id, customer, seller"
            label="Search orders"
            enterKeyHint="search"
          />
        </form>
      }
    >
      {statsError && !statsLoading ? (
        <ErrorNotice title="Could not load the totals" message={statsError} onRetry={retryStats} />
      ) : (
        <StatStrip aria-busy={statsLoading || undefined}>
          <StatTile
            label="Total users"
            icon={Users}
            value={users.data?.totalUsers}
            note={users.data ? `${formatNumber(users.data.activeUsers ?? 0)} active` : undefined}
            loading={users.loading}
            animate
          />
          <StatTile label="Total sellers" icon={Store} value={users.data?.totalSellers} loading={users.loading} animate />
          <StatTile
            label="Products"
            icon={Boxes}
            value={products.data?.totalProducts}
            note={products.data ? `${formatNumber(products.data.activeProducts ?? 0)} live` : undefined}
            loading={products.loading}
            animate
          />
          <StatTile
            // "Net" carries the qualifier (cancelled orders left out) in a label short enough for 1024px; a note
            // beside a 9-digit ₹ figure was truncated, and "Revenue · excl. cancelled" was too.
            label="Net revenue"
            icon={Banknote}
            value={sales.data?.totalRevenue}
            format="inr"
            loading={sales.loading}
            animate
          />
          <StatTile
            label="Orders"
            icon={ReceiptText}
            value={sales.data?.totalOrders}
            note={sales.data ? "cancelled excluded" : undefined}
            loading={sales.loading}
            animate
          />
        </StatStrip>
      )}

      <div className="grid grid-cols-1 items-start gap-[18px] xl:grid-cols-12">
        <LatestOrders
          className="xl:col-span-8"
          orders={latest.data?.orders}
          limit={LATEST_ORDERS_LIMIT}
          status={orderStatus}
          onStatusChange={setOrderStatus}
          loading={latest.loading}
          error={latest.error}
          onRetry={latest.reload}
        />
        {/* Right column stacks status + top sellers so it matches the orders table's height (no dead column). */}
        <div className="flex flex-col gap-[18px] xl:col-span-4">
          <OrderStatusPanel
            counts={statuses.data}
            loading={statuses.loading}
            error={statuses.error}
            onRetry={statuses.reload}
            selected={orderStatus === "all" ? undefined : orderStatus}
            onSelect={selectStatus}
          />
          <TopSellersPanel
            rows={sellers.data?.stats}
            loading={sellers.loading}
            error={sellers.error}
            onRetry={sellers.reload}
          />
        </div>
      </div>

      <RevenueChart
        daily={sales.data?.daily}
        days={days}
        onDaysChange={setDays}
        loading={sales.loading}
        refreshing={salesRefreshing}
        error={sales.error}
        onRetry={sales.reload}
      />

      <div className="grid grid-cols-1 items-start gap-[18px] lg:grid-cols-2">
        <CategoryPanel
          rows={categories.data?.categories}
          loading={categories.loading}
          error={categories.error}
          onRetry={categories.reload}
        />
        <GrowthPanel
          daily={growth.data?.daily}
          days={GROWTH_DAYS}
          loading={growth.loading}
          error={growth.error}
          onRetry={growth.reload}
        />
      </div>
    </PortalShell>
  );
};

export default Admin_Dashboard;
