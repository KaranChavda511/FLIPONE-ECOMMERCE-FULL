import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Banknote, CircleAlert, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { capitalize, formatInr } from "@/lib/format";
import { Container, EmptyState, FieldShell, PageHeader, Stamp } from "@/components/flipone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { createOrder } from "../../../config/orderService";
import { apiErrorMessage } from "../../../config/apiClient";
import {
  clearCart,
  fetchCartItems,
  removeCartItemAsync,
  updateQuantityAsync,
} from "../../../redux/cartSlice";
import { imageUrl } from "../../../utils/imageUrl";
import { LoadError, Panel, QuantityStepper } from "../../components/StoreBits";

// Must match SHIPPING_FEES in FLIPONE-BACKEND src/models/Order.js (the server charges those).
const SHIPPING_COST = { flat: 30, pickup: 0 };
const SHIPPING_OPTIONS = [
  { value: "flat", title: "Flat rate", note: "Delivered to your address", label: "Flat rate" },
  { value: "pickup", title: "Local pickup", note: "Collect from the seller", label: "Local pickup" },
];
const LOW_STOCK_AT = 5;

// States and union territories of India, for the address select.
const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
];

const ADDRESS_ERRORS = {
  street: "Enter your street address.",
  city: "Enter your city.",
  state: "Choose your state.",
  postalCode: "Enter all 6 digits of the PIN code.",
};

/** Inline address errors (shown after the first Place order attempt). */
const addressErrors = (address) => {
  const errors = {};
  Object.keys(ADDRESS_ERRORS).forEach((key) => {
    if (!String(address[key] ?? "").trim()) errors[key] = ADDRESS_ERRORS[key];
  });
  if (!errors.postalCode && !/^\d{6}$/.test(address.postalCode.trim())) errors.postalCode = ADDRESS_ERRORS.postalCode;
  return errors;
};

/** One cart line (mock-up `.line`): photo, name + stamps, stepper, price, remove. */
function CartLine({ item, busy, onQuantity, onRemove }) {
  const product = item.product || {};
  const name = product.name || "Unnamed Product";
  const quantity = item.requestedQuantity || 1;
  const price = product.price || 0;
  const stock = product.stock ?? item.availableQuantity;
  const href = product.ProductId ? `/product/${product.ProductId}` : null;

  return (
    <motion.li
      layout="position"
      initial={false}
      exit={{ opacity: 0, x: -12, transition: { duration: 0.16 } }}
      className="grid grid-cols-[64px_minmax(0,1fr)_auto_auto_auto] items-center gap-3 border-t border-dashed border-line-mid px-[18px] py-3.5 first:border-t-0 xl:grid-cols-[76px_minmax(0,1fr)_auto_110px_auto] xl:gap-4"
    >
      {href ? (
        <Link to={href} tabIndex={-1} aria-hidden="true" className="block">
          <img src={imageUrl(product.images)} alt="" className="aspect-[4/5] w-full rounded-[4px] bg-paper-2 object-cover" />
        </Link>
      ) : (
        <img src={imageUrl(product.images)} alt="" className="aspect-[4/5] w-full rounded-[4px] bg-paper-2 object-cover" />
      )}
      <div className="min-w-0">
        <h3 className="truncate text-[15px] font-semibold">
          {href ? (
            <Link to={href} className="hover:underline hover:decoration-[1.5px] hover:underline-offset-[3px]">
              {name}
            </Link>
          ) : (
            name
          )}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {product.category && <Stamp variant="category">{capitalize(product.category)}</Stamp>}
          {stock <= 0 ? (
            <Stamp variant="outOfStock" />
          ) : stock <= LOW_STOCK_AT ? (
            <Stamp variant="lowStock" count={stock} />
          ) : (
            <span className="text-[12.5px] text-muted-foreground tabular">{stock} in stock</span>
          )}
        </div>
        {item.warnings?.map((warning) => (
          <p key={warning} className="mt-1.5 flex items-center gap-1.5 text-[13px] text-warning">
            <CircleAlert className="size-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
            {warning}
          </p>
        ))}
      </div>
      <QuantityStepper
        size="sm"
        value={quantity}
        min={1}
        max={Math.max(stock ?? quantity, quantity)}
        label={`Quantity, ${name}`}
        disabled={busy}
        onChange={(next) => onQuantity(item, next - quantity)}
      />
      <div className="text-right">
        <span className="block font-display text-[22px] leading-none font-semibold tabular">{formatInr(price * quantity)}</span>
        <small className="mt-1 block text-[12px] leading-tight text-muted-foreground tabular">
          {formatInr(price)} × {quantity}
        </small>
      </div>
      <Button
        variant="remove"
        size="sm"
        // -mr-2.5: the icon/label ends on the panel's right edge, like the header text above it
        className="-mr-2.5 max-xl:w-[34px] max-xl:px-0"
        aria-label={`Remove ${name}`}
        disabled={busy}
        onClick={() => onRemove(item.ItemId)}
      >
        <Trash2 aria-hidden="true" />
        <span className="max-xl:sr-only">Remove</span>
      </Button>
    </motion.li>
  );
}

function CartSkeleton() {
  return (
    <div role="status" aria-live="polite" className="grid grid-cols-[minmax(0,1fr)_minmax(320px,400px)] items-start gap-7">
      <span className="sr-only">Loading your cart…</span>
      <div aria-hidden="true" className="flex flex-col gap-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
      <Skeleton aria-hidden="true" className="h-80 w-full" />
    </div>
  );
}

const AddToCart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: cartItems, status, error } = useSelector((state) => state.cart);

  const [shipping, setShipping] = useState("flat");
  const [shippingAddress, setShippingAddress] = useState({ street: "", city: "", state: "", postalCode: "" });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    dispatch(fetchCartItems());
  }, [dispatch]);

  // Totals are derived from the cart, not kept in extra state.
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * (item.requestedQuantity ?? 1),
    0
  );
  const shippingCost = SHIPPING_COST[shipping] ?? 0;
  const total = subtotal + shippingCost;
  const itemCount = cartItems.reduce((sum, item) => sum + (item.requestedQuantity ?? 1), 0);
  const itemsLabel = `${itemCount} ${itemCount === 1 ? "item" : "items"}`;
  const errors = attempted ? addressErrors(shippingAddress) : {};

  const handleQuantityChange = async (item, delta) => {
    const quantity = (item.requestedQuantity ?? 1) + delta;
    if (quantity < 1) return;
    // availableQuantity is min(requested, stock), so cap on the product's real stock instead.
    const stock = item.product?.stock ?? item.availableQuantity;
    if (delta > 0 && quantity > stock) {
      toast.info(`Only ${stock} available`);
      return;
    }
    setBusyId(item.ItemId);
    const result = await dispatch(updateQuantityAsync({ itemId: item.ItemId, quantity }));
    setBusyId(null);
    if (updateQuantityAsync.rejected.match(result)) toast.error(result.payload);
  };

  const handleRemove = async (itemId) => {
    setBusyId(itemId);
    const result = await dispatch(removeCartItemAsync(itemId));
    setBusyId(null);
    if (removeCartItemAsync.rejected.match(result)) toast.error(result.payload);
  };

  const handleCheckout = async () => {
    setAttempted(true);
    const address = Object.fromEntries(
      Object.entries(shippingAddress).map(([key, value]) => [key, value.trim()])
    );
    const firstInvalid = Object.keys(addressErrors(address))[0];
    if (Object.values(address).some((value) => !value)) {
      toast.error("Please fill in your complete shipping address.");
      document.getElementById(`addr-${firstInvalid}`)?.focus();
      return;
    }
    if (!/^\d{6}$/.test(address.postalCode)) {
      toast.error("Postal code must be 6 digits.");
      document.getElementById("addr-postalCode")?.focus();
      return;
    }

    setPlacingOrder(true);
    try {
      const response = await createOrder(address, shipping);
      const orderId = response?.order?.OrderId;
      dispatch(clearCart()); // the server empties the cart on checkout
      if (orderId) navigate(`/ordersuccess/${orderId}`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Checkout failed"));
    } finally {
      setPlacingOrder(false);
    }
  };

  const setField = (name) => (value) => setShippingAddress((prev) => ({ ...prev, [name]: value }));

  if (status === "loading" && cartItems.length === 0) {
    return (
      <Container className="pt-5 pb-10">
        <CartSkeleton />
      </Container>
    );
  }

  if (status === "failed" && cartItems.length === 0 && error) {
    return (
      <Container className="pt-5 pb-10">
        <PageHeader title="Cart" className="mb-4" />
        <LoadError title="Could not load your cart" message={error} onRetry={() => dispatch(fetchCartItems())} />
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container className="pt-5 pb-10">
        <PageHeader title="Cart" className="mb-4" />
        <EmptyState
          illustration="bag"
          title="Your cart is empty"
          body="Add something from the shop and it will wait here."
          action={
            <Button asChild>
              <Link to="/#shop">Browse the shop</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  return (
    <Container className="pt-5 pb-10">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!placingOrder) handleCheckout();
        }}
        className="grid grid-cols-[minmax(0,1fr)_minmax(320px,400px)] items-start gap-x-7 gap-y-5"
      >
        <PageHeader title="Cart" count={itemsLabel} className="col-span-full" />

        <div className="flex min-w-0 flex-col gap-4">
          <Panel step={1} title="Items" description="Stock is checked again when you place the order.">
            <ul>
              <AnimatePresence initial={false}>
                {cartItems.map((item) => (
                  <CartLine
                    key={item.ItemId}
                    item={item}
                    busy={busyId === item.ItemId || placingOrder}
                    onQuantity={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                ))}
              </AnimatePresence>
            </ul>
          </Panel>

          <Panel step={2} title="Delivery">
            <RadioGroup
              value={shipping}
              onValueChange={setShipping}
              aria-label="Shipping method"
              className="grid grid-cols-2 gap-3 px-[18px] py-4"
            >
              {SHIPPING_OPTIONS.map((option) => {
                const id = `ship-${option.value}`;
                const cost = SHIPPING_COST[option.value];
                return (
                  <label
                    key={option.value}
                    htmlFor={id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-md border-[1.5px] border-line-mid bg-surface px-4 py-3.5 transition-[border-color,background-color,box-shadow] duration-150 hover:border-ink-2",
                      shipping === option.value && "border-ink bg-[#FCFBF8] shadow-[inset_0_0_0_0.5px_var(--color-ink)] hover:border-ink"
                    )}
                  >
                    <RadioGroupItem id={id} value={option.value} className="mt-0.5" />
                    <span className="min-w-0">
                      <b className="block text-[15px] font-semibold">{option.title}</b>
                      <span className="mt-0.5 block text-[13px] text-muted-foreground">{option.note}</span>
                    </span>
                    <span className="ml-auto font-display text-[20px] leading-none font-semibold text-ink tabular">
                      {cost > 0 ? formatInr(cost) : "Free"}
                    </span>
                  </label>
                );
              })}
            </RadioGroup>
          </Panel>

          <Panel step={3} title="Delivery address" description="Needed for every order, including pickup.">
            <div className="grid grid-cols-3 gap-x-4 gap-y-3.5 px-[18px] pt-4 pb-[18px]">
              <FieldShell id="addr-street" label="Street address" error={errors.street} required className="col-span-full">
                {(control) => (
                  <Input
                    {...control}
                    name="street"
                    autoComplete="street-address"
                    placeholder="House no., building, street, area"
                    value={shippingAddress.street}
                    onChange={(e) => setField("street")(e.target.value)}
                  />
                )}
              </FieldShell>
              <FieldShell id="addr-city" label="City" error={errors.city} required>
                {(control) => (
                  <Input
                    {...control}
                    name="city"
                    autoComplete="address-level2"
                    value={shippingAddress.city}
                    onChange={(e) => setField("city")(e.target.value)}
                  />
                )}
              </FieldShell>
              <FieldShell id="addr-state" label="State" error={errors.state} required>
                {(control) => (
                  <Select name="state" value={shippingAddress.state} onValueChange={setField("state")} autoComplete="address-level1">
                    <SelectTrigger {...control} className="w-full">
                      <SelectValue placeholder="Choose state" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-72">
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FieldShell>
              <FieldShell id="addr-postalCode" label="PIN code" error={errors.postalCode} required>
                {(control) => (
                  <Input
                    {...control}
                    name="postalCode"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="postal-code"
                    className="tabular"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setField("postalCode")(e.target.value.replace(/\D/g, ""))}
                  />
                )}
              </FieldShell>
            </div>
          </Panel>
        </div>

        <aside aria-labelledby="summary-title" className="sticky top-4 overflow-hidden rounded-md border border-line-mid bg-surface">
          <div className="flex items-center justify-between bg-ink px-[18px] py-3.5 text-paper">
            <h2 id="summary-title" className="font-display text-[22px] leading-none font-bold tracking-[0.04em] uppercase">
              Order summary
            </h2>
            <span className="text-[13px] text-[#CFC9BC] tabular">{itemsLabel}</span>
          </div>
          <dl className="grid gap-2.5 px-[18px] py-3.5 text-[14.5px]">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-2">Subtotal</dt>
              <dd className="font-medium tabular">{formatInr(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-2">
                Shipping · {SHIPPING_OPTIONS.find((o) => o.value === shipping)?.label}
              </dt>
              <dd className="font-medium tabular">{shippingCost > 0 ? formatInr(shippingCost) : "Free"}</dd>
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
            <span className="font-display text-[40px] leading-none font-semibold text-red tabular" aria-live="polite">
              {formatInr(total)}
            </span>
          </div>
          <div className="grid gap-3 px-[18px] pt-4 pb-[18px]">
            <Button type="submit" size="lg" className="w-full" disabled={placingOrder || busyId != null}>
              {placingOrder ? "Placing order…" : "Place order (Cash on delivery)"}
            </Button>
            <p className="flex gap-2 text-[13px] leading-[1.45] text-muted-foreground">
              <Banknote className="mt-px size-4 shrink-0 text-ink-2" strokeWidth={1.75} aria-hidden="true" />
              Keep {formatInr(total)} ready in cash. You can cancel while the order is pending.
            </p>
          </div>
        </aside>
      </form>
    </Container>
  );
};

export default AddToCart;
