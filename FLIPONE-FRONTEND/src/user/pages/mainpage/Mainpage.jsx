import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigationType, useOutletContext } from "react-router-dom";
import { ArrowRight, Store } from "lucide-react";
import { CategoryBand, Container, EmptyState, PageHeader } from "@/components/flipone";
import { usesBandPhoto } from "@/components/flipone/categoryImages";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useApiGet } from "../../../hooks/useApiGet";
import { useAddToCart } from "../../../hooks/useAddToCart";
import { useLikes } from "../../../hooks/useLikes";
import { useClearUrlState, useUrlState } from "../../../hooks/useUrlState";
import { ProductGrid, ProductGridSkeleton } from "../../components/ProductGrid";
import { Chip, LoadError } from "../../components/StoreBits";

const PRICE_CAP = 1500;
// The API pages at 50 by default; the home grid shows the whole (small) catalogue. Stable object for useApiGet.
const HOME_QUERY = { limit: 200 };
const MAX_SELLER_CHIPS = 5;

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const sellerOf = (product) => product?.seller?.name ?? "";
const categoryOf = (product) =>
  String(typeof product?.category === "string" ? product.category : product?.category?.name ?? "").toLowerCase();

/**
 * "Featured": one product from each category in turn (newest first within each), Men and Women leading, so the
 * first rows show the whole shop instead of whichever seller listed most recently. Within a category, in-stock
 * products come first (the first screen is things you can buy), and products that show the same photo as a
 * category-band tile go after the others, so the band and the first row never repeat a picture.
 */
const mixCategories = (products) => {
  const groups = new Map();
  products.forEach((p) => {
    const key = categoryOf(p);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  });
  const lead = ["men", "women"].filter((k) => groups.has(k));
  const order = [...lead, ...[...groups.keys()].filter((k) => !lead.includes(k))];
  const queues = order.map((k) => {
    const list = groups.get(k);
    const repeat = (p) => usesBandPhoto(Array.isArray(p.images) ? p.images[0] : "");
    // What can be bought comes first; within that, photos already shown in the band go last.
    const rank = (p) => (Number(p.stock) > 0 ? 0 : 2) + (repeat(p) ? 1 : 0);
    return [...list].sort((a, b) => rank(a) - rank(b));
  });
  const out = [];
  while (out.length < products.length) {
    queues.forEach((q) => {
      if (q.length) out.push(q.shift());
    });
  }
  return out;
};

/** The sellers with the most products, for the chip row. */
const topSellers = (products) => {
  const counts = new Map();
  products.forEach((p) => {
    const name = sellerOf(p);
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, MAX_SELLER_CHIPS)
    .map(([name]) => name);
};

/** Columns of the home grid from xl (ProductGrid GRID_COLUMNS.home); below xl the sell tile is hidden. */
const XL_COLS = 6;
const XL_SPAN = {
  1: "xl:col-span-1",
  2: "xl:col-span-2",
  3: "xl:col-span-3",
  4: "xl:col-span-4",
  5: "xl:col-span-5",
  6: "xl:col-span-full",
};

/**
 * Where the sell tile sits in the 6-column grid, so it never ends a row alone and the last row is full.
 * It goes in at the start of row 3 (after the products that fill rows 1-2) and takes exactly the cells the
 * catalogue leaves over in the last row: 1 or 2 like a tag, or a full-row band when the rows already come out even.
 * A catalogue too small to reach row 3 gets the band after the last product.
 */
function sellTilePlacement(count, feature, cols = XL_COLS) {
  const cells = feature ? count + 3 : count; // the feature tag covers 2x2 cells
  const firstTwoRows = feature ? 2 * cols - 3 : 2 * cols;
  if (count <= firstTwoRows) return { at: count, span: cols };
  const left = (cols - (cells % cols)) % cols;
  return { at: firstTwoRows, span: left || cols };
}

/** Kraft "Sell on FlipOne" tile in the grid flow (wide screens only): a headline and one button. */
function SellTile({ span }) {
  const band = span === XL_COLS;
  return (
    <li className={cn("@container hidden min-w-0 rounded-md bg-kraft xl:block", XL_SPAN[span])}>
      <div
        className={cn(
          "flex h-full gap-4 px-5 py-5 @sm:px-6",
          band ? "flex-row items-center justify-between" : "flex-col justify-between"
        )}
      >
        <h3 className="font-display text-[30px] leading-[0.95] font-bold text-ink @sm:text-[34px]">
          Have a shop?
          <br />
          Sell on FlipOne.
        </h3>
        <Button asChild variant="ink" className={cn("w-full @sm:w-auto", band && "shrink-0")}>
          <Link to="/selar_registrastion">
            Start selling
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </li>
  );
}

const Mainpage = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const { categories = [] } = useOutletContext() ?? {};
  const handleAddToCart = useAddToCart();
  const likes = useLikes();

  const { data, loading, error, reload } = useApiGet("/api/product", HOME_QUERY);
  const products = useMemo(() => (Array.isArray(data?.products) ? data.products : []), [data]);

  // Filters and sort live in the URL (/?stock=1&under=1&seller=Acme%20Store&sort=price-asc): Back, reload and
  // shared links keep them.
  const [inStockOnly, setInStockOnly] = useUrlState("stock", false, "bool");
  const [underCap, setUnderCap] = useUrlState("under", false, "bool");
  const [sellers, setSellers] = useUrlState("seller", [], "list");
  const [sortParam, setSort] = useUrlState("sort", "featured");
  const sort = SORTS.some((s) => s.value === sortParam) ? sortParam : "featured";

  const sellerChips = useMemo(() => topSellers(products), [products]);

  const visible = useMemo(() => {
    const list = products.filter(
      (p) =>
        (!inStockOnly || Number(p.stock) > 0) &&
        (!underCap || Number(p.price) < PRICE_CAP) &&
        (sellers.length === 0 || sellers.includes(sellerOf(p)))
    );
    if (sort === "price-asc") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...list].sort((a, b) => b.price - a.price);
    if (sort === "featured") return mixCategories(list);
    return list;
  }, [products, inStockOnly, underCap, sellers, sort]);

  // The 2x feature tag carries the big red Add to cart, so it is the first in-stock product in the current
  // order, moved to the front. No in-stock product: no feature tag.
  const { ordered, hasFeature } = useMemo(() => {
    const index = visible.findIndex((p) => Number(p.stock) > 0);
    if (index <= 0) return { ordered: visible, hasFeature: index === 0 };
    return { ordered: [visible[index], ...visible.slice(0, index), ...visible.slice(index + 1)], hasFeature: true };
  }, [visible]);

  const filtered = inStockOnly || underCap || sellers.length > 0;
  const clearUrl = useClearUrlState();
  const clearFilters = () => clearUrl(["stock", "under", "seller"]);
  const toggleSeller = (name) =>
    setSellers((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]));

  // "/#shop" (e.g. from the empty cart) lands on the grid once it has rendered. Not on Back/Forward: there
  // ScrollRestoration puts the page back where the shopper left it.
  useEffect(() => {
    if (location.hash && navigationType !== "POP") {
      const element = document.getElementById(location.hash.replace("#", ""));
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }
  }, [location, loading, navigationType]);

  let body;
  if (loading) {
    body = <ProductGridSkeleton feature count={13} />;
  } else if (error) {
    body = <LoadError title="Could not load products" message={error} onRetry={reload} />;
  } else if (products.length === 0) {
    body = (
      <EmptyState
        illustration="products"
        title="No products yet"
        body="Sellers have not listed anything yet. Check back soon."
        action={
          <Button asChild variant="outline">
            <Link to="/selar_registrastion">Sell on FlipOne</Link>
          </Button>
        }
      />
    );
  } else if (visible.length === 0) {
    body = (
      <EmptyState
        illustration="results"
        title="Nothing matches these filters"
        body="Try removing a filter to see more products."
        action={<Button variant="outline" onClick={clearFilters}>Clear filters</Button>}
      />
    );
  } else {
    const tile = filtered ? null : sellTilePlacement(ordered.length, hasFeature);
    body = (
      <ProductGrid
        label="Products"
        products={ordered}
        feature={hasFeature}
        onAdd={handleAddToCart}
        likes={likes}
        insert={tile ? { at: tile.at, node: <SellTile key="sell-tile" span={tile.span} /> } : undefined}
      />
    );
  }

  return (
    <>
      <CategoryBand categories={categories} />

      <Container as="section" id="shop" aria-labelledby="shop-title" className="scroll-mt-4 pt-3.5 pb-8">
        {/* Reading order: section title (and count) with Sort on the same line, then the filter row. Same layout at
            every width, so Sort never ends up alone on a wrapped line. */}
        <PageHeader
          as="h2"
          size="md"
          title={<span id="shop-title">Shop all</span>}
          count={!loading && !error ? `${visible.length} ${visible.length === 1 ? "product" : "products"}` : undefined}
          className="mb-3 items-center"
          actions={
            <div className="inline-flex items-center gap-2 text-[13.5px] text-muted-foreground">
              <span id="home-sort">Sort</span>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger size="sm" aria-labelledby="home-sort" className="min-w-[176px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="end">
                  {SORTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />
        <div role="group" aria-label="Filter products" className="mb-4 flex flex-wrap items-center gap-2.5">
          <Chip pressed={inStockOnly} onClick={() => setInStockOnly((v) => !v)}>
            In stock
          </Chip>
          <Chip pressed={underCap} onClick={() => setUnderCap((v) => !v)}>
            Under {formatInr(PRICE_CAP)}
          </Chip>
          {sellerChips.length > 0 && <span aria-hidden="true" className="mx-1 h-5 w-px bg-line-mid" />}
          {sellerChips.map((name, index) => (
            <Chip
              key={name}
              icon={index === 0 ? Store : undefined}
              pressed={sellers.includes(name)}
              onClick={() => toggleSeller(name)}
              aria-label={`Seller: ${name}`}
            >
              {name}
            </Chip>
          ))}
          {filtered && (
            <Button variant="link" size="sm" className="ml-1 text-[13.5px]" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>

        {body}
      </Container>
    </>
  );
};

export default Mainpage;
