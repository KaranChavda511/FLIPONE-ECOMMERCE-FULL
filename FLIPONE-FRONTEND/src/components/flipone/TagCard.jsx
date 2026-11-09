import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Check, Heart, Plus, ShoppingBag, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { capitalize } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { imageUrl } from "@/utils/imageUrl";
import Mrp from "./Mrp";
import Stamp from "./Stamp";

const EASE = [0.22, 1, 0.36, 1];

const categoryName = (category) => (typeof category === "string" ? category : category?.name ?? "");

/** "Men · Shirts" from the product's category and first subcategory. */
const categoryLabel = (product) => {
  const cat = categoryName(product?.category);
  const sub = Array.isArray(product?.subcategories) ? product.subcategories[0] : product?.subcategories;
  return [cat, sub].filter(Boolean).map(capitalize).join(" · ");
};

/** The most specific kind for the narrow grid tag: "Sunglasses" (falls back to the category). */
const kindLabel = (product) => {
  const sub = Array.isArray(product?.subcategories) ? product.subcategories[0] : product?.subcategories;
  return capitalize(sub || categoryName(product?.category));
};

/** Second photo for the hover swap, when the seller uploaded more than one. */
const secondImage = (images) => (Array.isArray(images) && images.length > 1 ? imageUrl(images.slice(1)) : null);

/**
 * Runs onAdd and shows "Added" for a moment when it resolves to anything but false
 * (useAddToCart resolves false on failure or when the shopper still has to log in).
 */
function useAddFeedback(onAdd, product) {
  const [state, setState] = useState("idle"); // idle | busy | done
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const add = async () => {
    if (state === "busy") return;
    setState("busy");
    let ok = false;
    try {
      ok = (await onAdd(product)) !== false;
    } finally {
      setState(ok ? "done" : "idle");
      if (ok) {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setState("idle"), 1600);
      }
    }
  };
  return [state, add];
}

/** Wishlist heart: white disc on the photo, pops when saved. */
function SaveButton({ liked, name, onClick }) {
  return (
    <motion.button
      type="button"
      aria-pressed={Boolean(liked)}
      aria-label={liked ? `Saved: ${name}. Remove from saved` : `Save ${name}`}
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 480, damping: 22 }}
      className={cn(
        "absolute top-2.5 right-2.5 z-[2] grid size-9 place-items-center rounded-full bg-white/95 text-ink shadow-xs",
        "transition-colors duration-200 hover:text-red focus-visible:text-red",
        liked && "text-red"
      )}
    >
      <motion.span
        className="grid place-items-center"
        initial={false}
        animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.34, ease: EASE }}
      >
        <Heart className={cn("size-[18px]", liked && "fill-red")} strokeWidth={1.75} aria-hidden="true" />
      </motion.span>
    </motion.button>
  );
}

/** Quick add: an ink bar that rises inside the photo on hover or keyboard focus, then confirms with a check. */
function QuickAdd({ name, onAdd, product }) {
  const [state, add] = useAddFeedback(onAdd, product);
  const done = state === "done";
  return (
    <button
      type="button"
      onClick={add}
      aria-label={`Add ${name} to cart`}
      aria-busy={state === "busy" || undefined}
      className={cn(
        "absolute inset-x-2.5 bottom-2.5 z-[2] flex h-10 items-center justify-center gap-1.5 overflow-hidden rounded-md text-[14px] font-semibold text-paper shadow-md",
        "translate-y-[calc(100%+12px)] opacity-0 transition-[translate,opacity,background-color] duration-300 ease-(--ease-out-quint)",
        "group-hover/tag:translate-y-0 group-hover/tag:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-[.98]",
        done ? "translate-y-0 bg-success opacity-100" : "bg-ink hover:bg-red"
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={done ? "done" : "add"}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="inline-flex items-center gap-1.5"
        >
          {done ? (
            <>
              <Check className="size-4" strokeWidth={2.25} aria-hidden="true" />
              Added
            </>
          ) : (
            <>
              <Plus className="size-4" strokeWidth={2} aria-hidden="true" />
              Quick add
            </>
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

/** Stock at the price line: "10 in stock", the ONLY N LEFT stamp, or the out-of-stock stamp. */
function StockState({ stock, lowStockAt }) {
  if (typeof stock !== "number") return null;
  if (stock <= 0) return <Stamp variant="outOfStock" />;
  if (stock <= lowStockAt) return <Stamp variant="lowStock" count={stock} />;
  return <span className="pb-0.5 text-[12.5px] whitespace-nowrap text-muted-foreground tabular">{stock} in stock</span>;
}

/**
 * The swing-tag perforation between the photo/name and the price: a dashed rule with a punched notch at
 * each edge. The notches take the colour of the surface behind the card (--tag-ground, default the paper).
 */
function Perforation({ className }) {
  const notch =
    "absolute top-1/2 size-4 -translate-y-1/2 rounded-full border border-line-soft bg-[var(--tag-ground,var(--background))] transition-colors duration-300 group-hover/tag:border-line-mid";
  return (
    <div aria-hidden="true" className={cn("relative h-4", className)}>
      <div className="absolute inset-x-3 top-1/2 border-t border-dashed border-line-mid" />
      <span className={cn(notch, "-left-[9px]")} />
      <span className={cn(notch, "-right-[9px]")} />
    </div>
  );
}

/**
 * Product swing tag.
 *
 * product: backend shape { _id, name, price, stock, images[], category: {name}|string, subcategories[], seller: {name} }
 * size: 'md' (grid tag) | 'feature' (2x2 first-look tag; spans 2 columns and 2 rows in a CSS grid)
 * onAdd(product): shows "Quick add" (md, rises on hover/focus) or "Add to cart" (feature). Hidden when out of stock.
 *   May return a promise; resolving to anything but false shows "Added" for a moment.
 * onToggleLike(product) + liked: shows the wishlist heart.
 * lowStockAt: stock at or below this shows "ONLY N LEFT" (default 5).
 * Set the CSS variable --tag-ground on a parent when the card sits on something other than the paper.
 */
export default function TagCard({
  product,
  size = "md",
  onAdd,
  onToggleLike,
  liked = false,
  lowStockAt = 5,
  imageClassName,
  className,
  ...props
}) {
  if (!product) return null;
  const { _id: id, name = "Untitled product", price, stock } = product;
  const href = `/product/${id}`;
  const seller = product.seller?.name;
  const catLabel = size === "feature" ? categoryLabel(product) : kindLabel(product);
  const inStock = typeof stock !== "number" || stock > 0;
  const feature = size === "feature";
  const alt = secondImage(product.images);

  const imgBase = "absolute inset-0 size-full object-cover transition-[scale,opacity,filter] ease-(--ease-out-quint)";
  const media = (
    <div className={cn("relative overflow-hidden bg-paper-2", feature ? "min-h-[280px] flex-1" : "aspect-[3/4]")}>
      <Link to={href} tabIndex={-1} aria-hidden="true" className="absolute inset-0 block">
        <img
          src={imageUrl(product.images)}
          alt=""
          loading="lazy"
          decoding="async"
          className={cn(
            imgBase,
            "duration-700 group-hover/tag:scale-[1.05]",
            alt && "group-hover/tag:opacity-0",
            !inStock && "opacity-70 grayscale-[60%]",
            feature && "object-[50%_30%]",
            imageClassName
          )}
        />
        {alt && (
          <img
            src={alt}
            alt=""
            loading="lazy"
            decoding="async"
            className={cn(imgBase, "scale-[1.05] opacity-0 duration-700 group-hover/tag:scale-100 group-hover/tag:opacity-100")}
          />
        )}
        {/* soft floor shade so the white quick-add bar and stamps read on light photos */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-ink/25 to-transparent opacity-0 transition-opacity duration-300 group-hover/tag:opacity-100" />
      </Link>
      {onToggleLike && <SaveButton liked={liked} name={name} onClick={() => onToggleLike(product)} />}
      {!feature && onAdd && inStock && <QuickAdd name={name} onAdd={onAdd} product={product} />}
    </div>
  );

  const sellerLine = seller && (
    <p className="flex min-w-0 items-center gap-1.5 text-[12.5px] leading-tight text-muted-foreground">
      <Store className="size-[13px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <span className="sr-only">Sold by </span>
      <span className="truncate">{seller}</span>
    </p>
  );
  const kind = catLabel && (
    <p className="truncate label-caps text-[12px] leading-none text-muted-foreground">{catLabel}</p>
  );

  const shell = cn(
    "group/tag relative flex min-w-0 flex-col overflow-hidden rounded-md border border-line-soft bg-surface",
    "transition-[translate,box-shadow,border-color] duration-300 ease-(--ease-out-quint)",
    "hover:-translate-y-1 hover:border-line-mid hover:shadow-tag focus-within:border-line-mid focus-within:shadow-tag",
    // the name link sits in a line-clamped box, so its focus ring is drawn on the whole tag instead
    "has-[h3_a:focus-visible]:outline-2 has-[h3_a:focus-visible]:outline-offset-2 has-[h3_a:focus-visible]:outline-ring",
    feature && "col-span-2 row-span-2",
    className
  );

  const nameLink = (
    <Link
      to={href}
      className="decoration-[1.5px] underline-offset-[3px] transition-colors duration-200 hover:underline focus-visible:outline-none"
    >
      {name}
    </Link>
  );

  if (feature) {
    return (
      <article className={shell} aria-label={name} {...props}>
        {media}
        <div className="flex flex-none flex-col px-[18px] pt-4 pb-[18px]">
          {kind}
          <h3 className="mt-2 text-[22px] leading-[1.2] font-semibold tracking-[-0.015em]">{nameLink}</h3>
          <div className="mt-1.5">{sellerLine}</div>
          <Perforation className="-mx-[18px] my-3.5" />
          <div className="flex flex-wrap items-end gap-3">
            <Mrp value={price} size="lg" boxed={false} />
            <div className="ml-auto flex items-center gap-3">
              <StockState stock={stock} lowStockAt={lowStockAt} />
              {onAdd && inStock && <FeatureAdd name={name} onAdd={onAdd} product={product} />}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={shell} aria-label={name} {...props}>
      {media}
      <div className="flex min-w-0 flex-1 flex-col px-3.5 pt-3 pb-3">
        {kind}
        {/* two lines reserved, so the price lines of a row sit level */}
        <h3 className="mt-1.5 line-clamp-2 min-h-[2lh] text-[14.5px] leading-[1.3] font-semibold">{nameLink}</h3>
        <div className="mt-1">{sellerLine}</div>
        <div className="mt-auto pt-2.5">
          <Perforation className="-mx-3.5 mb-2" />
          <div className="flex items-end justify-between gap-2">
            <Mrp value={price} size="md" boxed={false} />
            <StockState stock={stock} lowStockAt={lowStockAt} />
          </div>
        </div>
      </div>
    </article>
  );
}

/** Feature tag's visible "Add to cart" button, with the same "Added" confirmation as Quick add. */
function FeatureAdd({ name, onAdd, product }) {
  const [state, add] = useAddFeedback(onAdd, product);
  const done = state === "done";
  return (
    <Button
      onClick={add}
      aria-label={`Add ${name} to cart`}
      aria-busy={state === "busy" || undefined}
      className={cn("min-w-[148px] overflow-hidden", done && "bg-success hover:bg-success")}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={done ? "done" : "add"}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="inline-flex items-center gap-2"
        >
          {done ? <Check aria-hidden="true" /> : <ShoppingBag aria-hidden="true" />}
          {done ? "Added" : "Add to cart"}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
