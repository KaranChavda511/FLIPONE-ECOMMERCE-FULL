import { useId, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Banknote, CircleAlert, Heart, ShoppingBag, Store, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { capitalize, formatInr, formatNumber } from "@/lib/format";
import { Container, EmptyState, Mrp, Stamp } from "@/components/flipone";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { imageUrl } from "@/utils/imageUrl";
import { useApiGet } from "../../../hooks/useApiGet";
import { useAddToCart } from "../../../hooks/useAddToCart";
import { useLikes } from "../../../hooks/useLikes";
import { ProductGrid } from "../../components/ProductGrid";
import { Breadcrumbs, LoadError, QuantityStepper } from "../../components/StoreBits";

const LOW_STOCK_AT = 5;
const SHIPPING_FLAT = 30; // same as SHIPPING_COST.flat in the cart (the server charges it)

const categoryNameOf = (product) =>
  typeof product?.category === "string" ? product.category : product?.category?.name ?? "";

/** Thumbnails + main photo with a "1 / 4" counter (mock-up `.thumbs` / `.main-img`). */
function Gallery({ images, name }) {
  const [index, setIndex] = useState(0);
  const photos = images.length > 0 ? images : [null];
  const current = Math.min(index, photos.length - 1);

  return (
    <div className={cn("grid items-start gap-4 xl:gap-5", photos.length > 1 ? "grid-cols-[64px_minmax(0,1fr)] xl:grid-cols-[72px_minmax(0,1fr)]" : "grid-cols-1")}>
      {photos.length > 1 && (
        <div role="group" aria-label="Product photos" className="flex flex-col gap-2.5">
          {photos.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              aria-label={`Photo ${i + 1} of ${photos.length}`}
              aria-current={i === current ? "true" : undefined}
              onClick={() => setIndex(i)}
              className={cn(
                "block aspect-[4/5] overflow-hidden rounded-md border-[1.5px] border-line-soft bg-paper-2 transition-[border-color] duration-150 hover:border-ink-2",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                i === current && "border-2 border-ink hover:border-ink"
              )}
            >
              <img src={imageUrl(src)} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-line-soft bg-paper-2">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.img
            key={current}
            src={imageUrl(photos[current])}
            alt={photos.length > 1 ? `${name}, photo ${current + 1} of ${photos.length}` : name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 size-full object-cover object-[50%_20%]"
          />
        </AnimatePresence>
        {photos.length > 1 && (
          <span className="absolute bottom-3 left-3 rounded-sm bg-ink px-2 pt-1.5 pb-[5px] font-display text-[13px] leading-none font-semibold tracking-[0.08em] text-white tabular">
            {current + 1} / {photos.length}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * The price swing tag (notched corners, punched hole): MRP on the left, stock on the right. Its left edge sits on
 * the column edge like everything else in the column; seller and category are shown once, above the name.
 */
function SwingTag({ product }) {
  const stock = Number(product.stock) || 0;
  return (
    <div className="bg-line-mid p-px [clip-path:polygon(22px_0,100%_0,100%_100%,22px_100%,0_calc(100%-22px),0_22px)]">
      <div className="relative flex flex-wrap items-center justify-between gap-4 bg-surface py-4 pr-5 pl-[52px] [clip-path:polygon(21.5px_0,100%_0,100%_100%,21.5px_100%,0_calc(100%-21.5px),0_21.5px)]">
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-4 -mt-[7px] size-3.5 rounded-full bg-paper shadow-[0_0_0_3px_var(--color-kraft),inset_0_1px_2px_rgb(23_21_15/0.25)]"
        />
        <Mrp value={product.price} size="lg" boxed={false} />
        {stock <= 0 ? (
          <Stamp variant="outOfStock" size="lg" />
        ) : stock <= LOW_STOCK_AT ? (
          <Stamp variant="lowStock" count={stock} size="lg" />
        ) : (
          <span className="text-[14px] text-muted-foreground tabular">{formatNumber(stock)} in stock</span>
        )}
      </div>
    </div>
  );
}

/** Buy row: quantity stepper, red Add to cart, Save (mock-up `.buy`). */
function BuyBox({ product, liked, onToggleLike }) {
  const addToCart = useAddToCart();
  const qtyLabelId = useId();
  const stock = Math.max(0, Number(product.stock) || 0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const qty = Math.min(quantity, Math.max(stock, 1));

  const add = async () => {
    setAdding(true);
    const ok = await addToCart(product, qty);
    setAdding(false);
    if (ok) setQuantity(1);
  };

  return (
    <>
      {/* One row, one height: quantity, the main action, and Save as a square icon button. */}
      <div className="flex items-stretch gap-2.5">
        {stock > 0 && (
          <>
            <span id={qtyLabelId} className="sr-only">
              Quantity
            </span>
            <QuantityStepper value={qty} min={1} max={stock} onChange={setQuantity} labelledBy={qtyLabelId} className="h-12" />
          </>
        )}
        <Button className="h-12 min-w-0 flex-1 text-base" onClick={add} disabled={stock <= 0 || adding}>
          <ShoppingBag className="size-5" aria-hidden="true" />
          {stock <= 0 ? "Out of stock" : adding ? "Adding…" : "Add to cart"}
        </Button>
        <Button
          variant="outline"
          className={cn("size-12 shrink-0 p-0", liked && "border-red text-red hover:text-red")}
          aria-pressed={liked}
          aria-label={liked ? "Saved. Remove from saved" : "Save for later"}
          title={liked ? "Saved" : "Save for later"}
          onClick={onToggleLike}
        >
          <motion.span
            className="grid place-items-center"
            initial={false}
            animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Heart className={cn("size-5", liked && "fill-red")} strokeWidth={1.75} aria-hidden="true" />
          </motion.span>
        </Button>
      </div>
      {stock > 0 && stock <= LOW_STOCK_AT && (
        <p className="-mt-2.5 flex items-center gap-1.5 text-[13px] text-warning">
          <CircleAlert className="size-[15px]" strokeWidth={1.75} aria-hidden="true" />
          Only {stock} left, so you can add up to {stock}.
        </p>
      )}
    </>
  );
}

/** "More in <category>" row (mock-up `.more`), excluding this product. */
function MoreInCategory({ category, excludeId }) {
  const addToCart = useAddToCart();
  const { data } = useApiGet(category ? "/api/product" : null, { category, limit: 7 });
  const products = useMemo(
    () => (Array.isArray(data?.products) ? data.products.filter((p) => p._id !== excludeId).slice(0, 6) : []),
    [data, excludeId]
  );
  if (!category || products.length === 0) return null;

  return (
    <section aria-labelledby="more-title" className="mt-8 border-t border-line-soft pt-2">
      <div className="mt-3.5 mb-3 flex items-baseline justify-between gap-4">
        <h2 id="more-title" className="text-[19px] font-semibold tracking-[-0.01em]">
          More in {capitalize(category)}
        </h2>
        <Link
          to={`/categories?category=${encodeURIComponent(category)}`}
          className="group/see inline-flex items-center gap-1 rounded-xs text-[14px] font-semibold hover:underline hover:decoration-[1.5px] hover:underline-offset-[3px]"
        >
          See all
          <ArrowRight className="size-4 transition-transform duration-150 group-hover/see:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
      <ProductGrid
        label={`More in ${capitalize(category)}`}
        columns="more"
        products={products}
        onAdd={addToCart}
        className="[&>li:nth-child(n+5)]:hidden xl:[&>li:nth-child(n+5)]:grid"
      />
    </section>
  );
}

function ProductSkeleton() {
  return (
    <div role="status" aria-live="polite" className="mt-4 grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-8">
      <span className="sr-only">Loading product…</span>
      <div aria-hidden="true" className="grid grid-cols-[72px_minmax(0,1fr)] gap-5">
        <div className="flex flex-col gap-2.5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="aspect-[4/5]" />
          ))}
        </div>
        <Skeleton className="aspect-[4/5]" />
      </div>
      <div aria-hidden="true" className="flex flex-col gap-4">
        <Skeleton className="h-9 w-4/5" />
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

const ProductPage = () => {
  const { id } = useParams();
  const likes = useLikes();
  const { data, loading, error, reload } = useApiGet(`/api/product/${encodeURIComponent(id)}`);
  const product = data?.product;

  if (loading) {
    return (
      <Container className="pt-4 pb-10">
        <Skeleton className="h-4 w-64" />
        <ProductSkeleton />
      </Container>
    );
  }

  if (error || !product) {
    const notFound = !error || /not found|invalid/i.test(error);
    return (
      <Container className="py-10">
        {notFound ? (
          <EmptyState
            illustration="results"
            headingLevel="h1"
            title="This product is not available"
            body="It may have been removed by the seller, or the link is wrong."
            action={
              <Button asChild variant="outline">
                <Link to="/">Back to the shop</Link>
              </Button>
            }
          />
        ) : (
          <LoadError title="Could not load this product" message={error} onRetry={reload} />
        )}
      </Container>
    );
  }

  const category = categoryNameOf(product);
  const subcategory = Array.isArray(product.subcategories) ? product.subcategories[0] : undefined;
  const categoryLabel = [capitalize(category), capitalize(subcategory)].filter(Boolean).join(" · ");
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const liked = likes.isLiked(product);

  const crumbs = [{ label: "Home", to: "/" }];
  if (category) crumbs.push({ label: capitalize(category), to: `/categories?category=${encodeURIComponent(category)}` });
  crumbs.push({ label: product.name });

  return (
    <Container className="pt-4 pb-10">
      <Breadcrumbs items={crumbs} />

      <div className="mt-4 grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-7 xl:gap-8">
        <Gallery key={product._id} images={images} name={product.name} />

        <div className="sticky top-4 flex max-w-[600px] min-w-0 flex-col gap-[18px]">
          <div>
            {category && (
              <Link
                to={`/categories?category=${encodeURIComponent(category)}`}
                className="label-caps inline-block text-[13px] leading-none text-muted-foreground transition-colors hover:text-ink"
              >
                {categoryLabel}
              </Link>
            )}
            <h1 className="mt-2 text-[28px] leading-[1.12] font-semibold tracking-[-0.02em] text-balance xl:text-[34px]">{product.name}</h1>
            {product.seller?.name && (
              <p className="mt-2 flex items-center gap-2 text-[14px] text-muted-foreground">
                <Store className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
                Sold by <span className="font-semibold text-ink">{product.seller.name}</span>
              </p>
            )}
          </div>

          <SwingTag product={product} />

          <BuyBox key={product._id} product={product} liked={liked} onToggleLike={() => likes.toggle(product)} />

          {/* Delivery facts: two short lines, not sentences. */}
          <ul className="grid gap-2 text-[14px]">
            <li className="flex items-center gap-2.5">
              <Banknote className="size-[18px] shrink-0 text-ink-2" strokeWidth={1.75} aria-hidden="true" />
              Cash on delivery
            </li>
            <li className="flex items-center gap-2.5">
              <Truck className="size-[18px] shrink-0 text-ink-2" strokeWidth={1.75} aria-hidden="true" />
              {formatInr(SHIPPING_FLAT)} delivery, or free pickup
            </li>
          </ul>

          {product.description && (
            <p className="max-w-[62ch] border-t border-line-soft pt-4 text-[14.5px] leading-relaxed whitespace-pre-line text-ink-2">
              {product.description}
            </p>
          )}
        </div>
      </div>

      <MoreInCategory category={category} excludeId={product._id} />
    </Container>
  );
};

export default ProductPage;
