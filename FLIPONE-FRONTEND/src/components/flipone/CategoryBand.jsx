import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { capitalize } from "@/lib/format";
import Container from "./Container";
import { CATEGORY_IMAGES, LEAD_CATEGORIES } from "./categoryImages";

const normalise = (item) => {
  if (typeof item === "string") return { name: item };
  return item && item.name ? item : null;
};

const imageFor = (cat) => {
  const fallback = CATEGORY_IMAGES[cat.name.toLowerCase()];
  return { src: cat.image ?? fallback?.src, position: cat.imagePosition ?? fallback?.position ?? "50% 50%" };
};

const hrefFor = (cat) => `/categories?category=${encodeURIComponent(cat.name)}`;

const tileMotion =
  "transition-[translate,box-shadow,border-color] duration-300 ease-(--ease-out-quint) hover:-translate-y-0.5 hover:shadow-tag";
const imgMotion = "size-full object-cover transition-[scale] duration-700 ease-(--ease-out-quint)";

/** Big department tile: full photo, name in display caps, its subcategories as the only supporting line. */
function LeadTile({ cat }) {
  const { src, position } = imageFor(cat);
  const subs = Array.isArray(cat.subcategories) ? cat.subcategories.slice(0, 3).map(capitalize).join(" · ") : "";
  return (
    <li className="min-w-0">
      <Link
        to={hrefFor(cat)}
        className={cn("group/lead relative block h-full overflow-hidden rounded-md bg-paper-2", tileMotion)}
      >
        {src && (
          <img
            src={src}
            alt=""
            decoding="async"
            fetchPriority="high"
            className={cn(imgMotion, "absolute inset-0 group-hover/lead:scale-[1.04]")}
            style={{ objectPosition: position }}
          />
        )}
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-ink/70 to-transparent" />
        <span className="absolute inset-x-5 bottom-4 flex items-end justify-between gap-3 text-paper">
          <span className="min-w-0">
            <span className="block font-display text-[44px] leading-[0.9] font-bold tracking-[0.01em] uppercase">
              {capitalize(cat.name)}
            </span>
            {subs && <span className="mt-1.5 block truncate text-[13.5px] text-paper/85">{subs}</span>}
          </span>
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-paper text-ink transition-[translate,background-color] duration-300 ease-(--ease-out-quint) group-hover/lead:-translate-y-0.5 group-hover/lead:bg-red group-hover/lead:text-white"
          >
            <ArrowUpRight className="size-5" strokeWidth={1.75} />
          </span>
        </span>
      </Link>
    </li>
  );
}

/** Small category tile: photo with a one-word label strip. */
function SmallTile({ cat }) {
  const { src, position } = imageFor(cat);
  return (
    <li className="min-w-0">
      <Link
        to={hrefFor(cat)}
        className={cn(
          "group/cat flex h-full flex-col overflow-hidden rounded-md border border-kraft-ink/20 bg-surface hover:border-kraft-ink/50",
          tileMotion
        )}
      >
        <span className="relative block min-h-0 flex-1 overflow-hidden bg-paper-2">
          {src && (
            <img
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              className={cn(imgMotion, "absolute inset-0 group-hover/cat:scale-[1.05]")}
              style={{ objectPosition: position }}
            />
          )}
        </span>
        <span className="flex items-center justify-between gap-1 px-2.5 py-2 font-display text-[15px] leading-none font-semibold tracking-[0.07em] text-ink uppercase">
          <span className="truncate">{capitalize(cat.name)}</span>
          <ArrowRight
            className="size-3.5 shrink-0 text-muted-foreground transition-[translate,color] duration-300 group-hover/cat:translate-x-0.5 group-hover/cat:text-ink"
            aria-hidden="true"
          />
        </span>
      </Link>
    </li>
  );
}

/**
 * The shop's opening band (kraft, full-bleed, ~300px): Men and Women as two equal photo tiles, every other
 * category as a small tile beside them, and an "All products" tile. Pictures carry it; no paragraph copy.
 *
 * Props:
 *  categories: array of names or { name, subcategories?, image?, imagePosition? } (GET /api/product/categories)
 *  title: the page's h1, read by screen readers only (default "FlipOne: shop by category")
 *  headingLevel (default 'h1'), max small tiles (default 5).
 * Without a Men/Women category the first two categories lead instead.
 */
export default function CategoryBand({
  categories = [],
  title = "FlipOne: shop by category",
  headingLevel: Heading = "h1",
  max = 5,
  className,
}) {
  const all = categories.map(normalise).filter(Boolean);
  if (all.length === 0) {
    return (
      <section className={cn("bg-kraft", className)} aria-label="Shop by category">
        <Heading className="sr-only">{title}</Heading>
        <Container className="h-[300px] py-4" />
      </section>
    );
  }

  const named = LEAD_CATEGORIES.map((n) => all.find((c) => c.name.toLowerCase() === n)).filter(Boolean);
  const lead = named.length === 2 ? named : all.slice(0, 2);
  const rest = all.filter((c) => !lead.includes(c)).slice(0, max);

  return (
    <section className={cn("bg-kraft", className)} aria-label="Shop by category">
      <Heading className="sr-only">{title}</Heading>
      <Container className="grid h-[300px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.7fr)] gap-3 py-4 2xl:h-[340px]">
        <ul className="contents">
          {lead.map((cat) => (
            <LeadTile key={cat._id ?? cat.name} cat={cat} />
          ))}
        </ul>
        <ul className="grid min-h-0 grid-cols-3 grid-rows-2 gap-3">
          {rest.map((cat) => (
            <SmallTile key={cat._id ?? cat.name} cat={cat} />
          ))}
          <li className="min-w-0">
            <Link
              to="/categories"
              className={cn(
                "group/all flex h-full flex-col justify-between rounded-md bg-ink p-3.5 text-paper hover:bg-ink-hover",
                tileMotion
              )}
            >
              <span className="font-display text-[22px] leading-[0.95] font-bold tracking-[0.02em] uppercase">
                All
                <br />
                products
              </span>
              <ArrowRight
                className="size-5 self-end transition-[translate] duration-300 group-hover/all:translate-x-1"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </Link>
          </li>
        </ul>
      </Container>
    </section>
  );
}
