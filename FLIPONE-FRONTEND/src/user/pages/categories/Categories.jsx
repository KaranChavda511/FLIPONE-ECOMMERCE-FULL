import { useId, useMemo } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { capitalize, formatInr } from "@/lib/format";
import { Container, EmptyState, PageHeader } from "@/components/flipone";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApiGet } from "../../../hooks/useApiGet";
import { useAddToCart } from "../../../hooks/useAddToCart";
import { useLikes } from "../../../hooks/useLikes";
import { useClearUrlState, useUrlState } from "../../../hooks/useUrlState";
import { ProductGrid, ProductGridSkeleton } from "../../components/ProductGrid";
import { Breadcrumbs, LoadError } from "../../components/StoreBits";

const SORTS = [
  { value: "relevance", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const PRICE_RANGES = [
  { value: "any", label: "Any price", test: () => true },
  { value: "lt500", label: `Under ${formatInr(500)}`, test: (p) => p < 500 },
  { value: "500-1499", label: `${formatInr(500)} – ${formatInr(1499)}`, test: (p) => p >= 500 && p < 1500 },
  { value: "1500-2999", label: `${formatInr(1500)} – ${formatInr(2999)}`, test: (p) => p >= 1500 && p < 3000 },
  { value: "3000+", label: `${formatInr(3000)} and above`, test: (p) => p >= 3000 },
];

// Filters that belong to one listing: cleared when the category or search changes.
const FILTER_KEYS = ["sub", "price", "stock", "seller"];

const lower = (value) => String(value ?? "").trim().toLowerCase();
const categoryNameOf = (product) =>
  typeof product?.category === "string" ? product.category : product?.category?.name ?? "";
const sellerOf = (product) => product?.seller?.name ?? "";
const subcategoriesOf = (product) => (Array.isArray(product?.subcategories) ? product.subcategories.map(lower) : []);

/** Rail section: Barlow caps heading over its controls, separated by a rule. */
function RailSection({ title, children }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="border-t border-line-soft px-4 py-3.5 first:border-t-0">
      <h2 id={id} className="mb-2.5 font-display text-[13px] leading-none font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Checkbox + label row with an optional count on the right. */
function CheckRow({ checked, onCheckedChange, label, count }) {
  const id = useId();
  return (
    <div className="flex min-h-8 items-center gap-2.5">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onCheckedChange(v === true)} />
      <Label htmlFor={id} className="min-w-0 flex-1 cursor-pointer text-[14px] font-medium">
        <span className="truncate">{label}</span>
      </Label>
      {count != null && <span className="text-[12.5px] text-muted-foreground tabular">{count}</span>}
    </div>
  );
}

/**
 * Results for one URL state (category/q). Filters and sort live in the URL too
 * (?category=Men&sub=shirts&price=500-1499&stock=1&seller=Acme%20Store&sort=price-asc), so Back, reload and shared
 * links keep them.
 */
function Listing({ q, category, categories, setParam }) {
  const addToCart = useAddToCart();
  const likes = useLikes();

  // Search: GET /api/product/search?q=  ·  Browse: GET /api/product?category=&limit=
  const url = q ? "/api/product/search" : "/api/product";
  const params = q ? { q } : { ...(category ? { category } : {}), limit: 200 };
  const { data, loading, error, reload } = useApiGet(url, params);
  const fetched = useMemo(() => (Array.isArray(data?.products) ? data.products : []), [data]);

  // A search can also be narrowed by ?category= (the search endpoint ignores it, so filter here).
  const base = useMemo(
    () => (q && category ? fetched.filter((p) => lower(categoryNameOf(p)) === lower(category)) : fetched),
    [fetched, q, category]
  );

  const [subsParam, setSubs] = useUrlState("sub", [], "list");
  const [priceParam, setPrice] = useUrlState("price", "any");
  const [inStock, setInStock] = useUrlState("stock", false, "bool");
  const [sellers, setSellers] = useUrlState("seller", [], "list");
  const [sortParam, setSort] = useUrlState("sort", "relevance");
  // URL values are untrusted: unknown options fall back to the defaults.
  const subs = useMemo(() => subsParam.map(lower), [subsParam]);
  const price = PRICE_RANGES.some((r) => r.value === priceParam) ? priceParam : "any";
  const sort = SORTS.some((o) => o.value === sortParam) ? sortParam : "relevance";

  const activeCategory = categories.find((c) => lower(c?.name) === lower(category));
  const subOptions = (activeCategory?.subcategories ?? []).map(lower).filter(Boolean);

  const sellerCounts = useMemo(() => {
    const counts = new Map();
    base.forEach((p) => {
      const name = sellerOf(p);
      if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [base]);

  const visible = useMemo(() => {
    const range = PRICE_RANGES.find((r) => r.value === price) ?? PRICE_RANGES[0];
    const list = base.filter(
      (p) =>
        range.test(Number(p.price)) &&
        (!inStock || Number(p.stock) > 0) &&
        (sellers.length === 0 || sellers.includes(sellerOf(p))) &&
        (subs.length === 0 || subcategoriesOf(p).some((s) => subs.includes(s)))
    );
    if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [base, price, inStock, sellers, subs, sort]);

  const filtered = subs.length > 0 || price !== "any" || inStock || sellers.length > 0;
  const clearUrl = useClearUrlState();
  const clearFilters = () => clearUrl(FILTER_KEYS);
  const toggleIn = (setter, value) => (checked) =>
    setter((prev) => (checked ? [...new Set([...prev, value])] : prev.filter((v) => v !== value)));

  const title = q ? `Results for “${q}”` : category ? capitalize(category) : "All products";
  const countText = loading || error
    ? undefined
    : filtered
      ? `${visible.length} of ${base.length} products`
      : `${base.length} ${base.length === 1 ? "product" : "products"}`;

  let results;
  if (loading) {
    results = <ProductGridSkeleton columns="rail" count={10} />;
  } else if (error) {
    results = <LoadError title="Could not load products" message={error} onRetry={reload} />;
  } else if (base.length === 0) {
    results = (
      <EmptyState
        illustration="results"
        title={q ? `Nothing matches “${q}”` : `Nothing in ${capitalize(category) || "the shop"} yet`}
        body={q ? "Check the spelling, or try a broader word such as a category name." : "Sellers have not listed products here yet."}
        action={
          <Button asChild variant="outline">
            <Link to={q || category ? "/categories" : "/"}>{q || category ? "Browse all products" : "Back to the shop"}</Link>
          </Button>
        }
      />
    );
  } else if (visible.length === 0) {
    results = (
      <EmptyState
        illustration="results"
        title="Nothing matches these filters"
        body="Remove a filter to see more products."
        action={<Button variant="outline" onClick={clearFilters}>Clear filters</Button>}
      />
    );
  } else {
    results = <ProductGrid label="Products" columns="rail" products={visible} onAdd={addToCart} likes={likes} />;
  }

  return (
    <div className="mt-3 grid grid-cols-[232px_minmax(0,1fr)] items-start gap-6 xl:grid-cols-[248px_minmax(0,1fr)] xl:gap-7">
      <aside aria-label="Filters" className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-md border border-line-soft bg-surface">
        <div className="flex min-h-12 items-center justify-between gap-2 px-4 py-2">
          <p className="text-[15px] font-semibold">Filters</p>
          {filtered && (
            <Button variant="link" size="sm" className="text-[13px]" onClick={clearFilters}>
              Clear all
            </Button>
          )}
        </div>

        <RailSection title="Category">
          <ul className="-mx-2 flex flex-col">
            {[{ name: "" }, ...categories].map((c) => {
              const name = c?.name ?? "";
              const current = lower(name) === lower(category);
              return (
                <li key={name || "all"}>
                  <button
                    type="button"
                    aria-current={current ? "true" : undefined}
                    onClick={() => setParam("category", name)}
                    className={cn(
                      "flex h-8 w-full items-center justify-between gap-2 rounded-md px-2 text-left text-[14px] font-medium text-ink-2 transition-colors duration-150",
                      "hover:bg-paper-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      current && "bg-paper-2 font-semibold text-ink"
                    )}
                  >
                    <span className="truncate">{name ? capitalize(name) : "All categories"}</span>
                    {current && <span aria-hidden="true" className="size-1.5 shrink-0 rounded-[1px] bg-ink" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </RailSection>

        {subOptions.length > 0 && (
          <RailSection title="Subcategory">
            {subOptions.map((sub) => (
              <CheckRow key={sub} label={capitalize(sub)} checked={subs.includes(sub)} onCheckedChange={toggleIn(setSubs, sub)} />
            ))}
          </RailSection>
        )}

        <RailSection title="Price">
          <RadioGroup value={price} onValueChange={setPrice} aria-label="Price" className="gap-0">
            {PRICE_RANGES.map((range) => (
              <div key={range.value} className="flex min-h-8 items-center gap-2.5">
                <RadioGroupItem value={range.value} id={`price-${range.value}`} />
                <Label htmlFor={`price-${range.value}`} className="cursor-pointer text-[14px] font-medium tabular">
                  {range.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </RailSection>

        <RailSection title="Availability">
          <CheckRow label="In stock only" checked={inStock} onCheckedChange={setInStock} />
        </RailSection>

        {sellerCounts.length > 0 && (
          <RailSection title="Seller">
            {sellerCounts.map(([name, count]) => (
              <CheckRow
                key={name}
                label={name}
                count={count}
                checked={sellers.includes(name)}
                onCheckedChange={toggleIn(setSellers, name)}
              />
            ))}
          </RailSection>
        )}
      </aside>

      <section aria-labelledby="listing-title" className="min-w-0">
        <PageHeader
          title={<span id="listing-title">{title}</span>}
          count={countText}
          className="mb-4 items-center"
          actions={
            <div className="inline-flex items-center gap-2 text-[13.5px] text-muted-foreground">
              <span id="listing-sort">Sort</span>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger size="sm" aria-labelledby="listing-sort" className="min-w-[176px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="end">
                  {SORTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {q && s.value === "relevance" ? "Best match" : s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />
        {results}
      </section>
    </div>
  );
}

const Categories = () => {
  const { categories = [] } = useOutletContext() ?? {};
  const [searchParams, setSearchParams] = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim();
  const category = (searchParams.get("category") ?? "").trim();

  // A new category or search is a new listing: its own history entry, opened at the top, without the old filters.
  const setParam = (key, value) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key === "category" || key === "q") FILTER_KEYS.forEach((k) => next.delete(k));
      return next;
    });

  const crumbs = [{ label: "Home", to: "/" }];
  if (q || category) crumbs.push({ label: "All products", to: "/categories" });
  if (category) crumbs.push({ label: capitalize(category), to: q ? `/categories?category=${encodeURIComponent(category)}` : undefined });
  if (q) crumbs.push({ label: `Search: ${q}` });
  if (!q && !category) crumbs.push({ label: "All products" });

  return (
    <Container className="pt-4 pb-10">
      <Breadcrumbs items={crumbs} />
      <Listing key={`${q}|${category}`} q={q} category={category} categories={categories} setParam={setParam} />
    </Container>
  );
};

export default Categories;
