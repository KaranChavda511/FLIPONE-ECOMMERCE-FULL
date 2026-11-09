import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { Banknote, MapPin } from "lucide-react";
import { formatDate, formatInr, shortId } from "@/lib/format";
import { Container, EmptyState, Stamp } from "@/components/flipone";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiGet } from "../../../hooks/useApiGet";
import { imageUrl } from "../../../utils/imageUrl";
import { LoadError, Panel } from "../../components/StoreBits";

const timeFmt = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" });
const formatTime = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : timeFmt.format(d);
};

function SuccessSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-5">
      <span className="sr-only">Loading your order…</span>
      <Skeleton aria-hidden="true" className="h-9 w-72" />
      <Skeleton aria-hidden="true" className="h-4 w-96" />
      <div aria-hidden="true" className="grid grid-cols-[minmax(0,1fr)_minmax(300px,380px)] gap-7">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}

const OrderSuccess = () => {
  const { orderId } = useParams();
  // There is no single-order endpoint, so look the order up in the history.
  const { data, loading, error, reload } = useApiGet("/api/order/orderHistory");
  const order = data?.orders?.find((o) => String(o.orderId) === String(orderId));

  if (loading) {
    return (
      <Container className="pt-6 pb-10">
        <SuccessSkeleton />
      </Container>
    );
  }
  if (error) {
    return (
      <Container className="pt-6 pb-10">
        <LoadError title="Could not load your order" message={error} onRetry={reload} />
      </Container>
    );
  }
  if (!order) {
    return (
      <Container className="pt-6 pb-10">
        <EmptyState
          illustration="orders"
          headingLevel="h1"
          title="Order not found"
          body="It may have been cancelled, or the link is wrong. Your order history lists every open order."
          action={
            <Button asChild variant="outline">
              <Link to="/order-history">View my orders</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  const items = order.products ?? [];
  const shippingFee = Number(order.shippingFee) || 0;
  const total = Number(order.totalAmount) || 0;
  const subtotal = Math.max(total - shippingFee, 0);
  const address = order.shippingAddress ?? {};
  const units = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  return (
    <Container className="pt-6 pb-10">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em]">Order placed</h1>
        <motion.span
          initial={{ opacity: 0, scale: 1.25, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 22, delay: 0.1 }}
          className="inline-flex"
        >
          <Stamp status={order.status} size="lg" />
        </motion.span>
      </div>
      <p className="mt-1.5 text-[15px] text-muted-foreground">
        Thank you. Order{" "}
        <span className="font-display text-[16px] font-semibold tracking-[0.06em] text-ink">{shortId(order.orderId)}</span>{" "}
        was placed on {formatDate(order.date)}
        {formatTime(order.date) && ` at ${formatTime(order.date)}`}. Each seller ships their own items.
      </p>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_minmax(300px,380px)] items-start gap-7">
        <Panel title="Items" description={`${units} ${units === 1 ? "item" : "items"}`}>
          <ul>
            {items.map((item, index) => (
              <li
                key={`${item.name}-${index}`}
                className="grid grid-cols-[56px_minmax(0,1fr)_auto_auto] items-center gap-4 border-t border-dashed border-line-mid px-[18px] py-3 first:border-t-0"
              >
                <img src={imageUrl(item.image)} alt="" className="aspect-[4/5] w-14 rounded-[4px] bg-paper-2 object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold">{item.name}</p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground tabular">
                    {formatInr(item.price)} × {item.quantity}
                  </p>
                </div>
                {item.status ? <Stamp status={item.status} /> : <span />}
                <span className="min-w-[88px] text-right font-display text-[20px] leading-none font-semibold tabular">
                  {formatInr((Number(item.price) || 0) * (Number(item.quantity) || 0))}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <aside aria-labelledby="receipt-title" className="overflow-hidden rounded-md border border-line-mid bg-surface">
          <div className="flex items-center justify-between bg-ink px-[18px] py-3.5 text-paper">
            <h2 id="receipt-title" className="font-display text-[22px] leading-none font-bold tracking-[0.04em] uppercase">
              Receipt
            </h2>
            <span className="font-display text-[15px] font-semibold tracking-[0.06em] text-[#CFC9BC]">{shortId(order.orderId)}</span>
          </div>
          <dl className="grid gap-2.5 px-[18px] py-3.5 text-[14.5px]">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-2">Subtotal</dt>
              <dd className="font-medium tabular">{formatInr(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-2">Shipping</dt>
              <dd className="font-medium tabular">{shippingFee > 0 ? formatInr(shippingFee) : "Free (local pickup)"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-2">Payment</dt>
              <dd className="font-semibold">Cash on delivery</dd>
            </div>
          </dl>
          <div className="flex items-end justify-between border-y border-dashed border-line-mid px-[18px] py-3.5">
            <b className="font-semibold">
              Total
              <small className="block text-[12px] font-normal text-muted-foreground">incl. of all taxes</small>
            </b>
            <span className="font-display text-[36px] leading-none font-semibold text-red tabular">{formatInr(total)}</span>
          </div>
          {(address.street || address.city) && (
            <div className="flex gap-2.5 border-b border-line-soft px-[18px] py-3.5 text-[14px] leading-normal">
              <MapPin className="mt-0.5 size-4 shrink-0 text-ink-2" strokeWidth={1.75} aria-hidden="true" />
              <address className="not-italic">
                <span className="block font-semibold">Delivery address</span>
                <span className="block text-muted-foreground">{address.street}</span>
                <span className="block text-muted-foreground tabular">
                  {[address.city, address.state].filter(Boolean).join(", ")} {address.postalCode}
                </span>
              </address>
            </div>
          )}
          <div className="grid gap-3 px-[18px] pt-4 pb-[18px]">
            <p className="flex gap-2 text-[13px] leading-[1.45] text-muted-foreground">
              <Banknote className="mt-px size-4 shrink-0 text-ink-2" strokeWidth={1.75} aria-hidden="true" />
              Keep {formatInr(total)} ready in cash. You can cancel from My orders while the order is pending.
            </p>
            <Button asChild size="lg" className="w-full">
              <Link to="/">Continue shopping</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/order-history">View my orders</Link>
            </Button>
          </div>
        </aside>
      </div>
    </Container>
  );
};

export default OrderSuccess;
