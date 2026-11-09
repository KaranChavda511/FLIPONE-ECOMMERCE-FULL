import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Logo, SkipLink, Stamp } from "@/components/flipone";
import { Separator } from "@/components/ui/separator";

/** The swing tag on the kraft panel: a real sample photo from /public, hung from its hole. */
function SampleTag() {
  return (
    <motion.figure
      initial={{ rotate: -7, y: -10, opacity: 0 }}
      animate={{ rotate: -2.5, y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 140, damping: 14, mass: 0.9 }}
      style={{ transformOrigin: "50% 0%" }}
      className="relative w-full rounded-md bg-surface p-3 pt-7 text-ink shadow-tag"
    >
      <span
        aria-hidden="true"
        className="absolute top-2.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-kraft ring-[3px] ring-kraft-deep/60"
      />
      <img
        src="/sec2-image1.jpeg"
        alt="Sample product photo: a red floral cotton dress"
        className="aspect-3/4 w-full rounded-sm bg-paper-2 object-cover object-top"
      />
      <Separator variant="dashed" className="my-3" />
      <figcaption className="flex items-center justify-between gap-2">
        <span className="min-w-0">
          <span className="block label-caps text-[12px] text-muted-foreground">Sold by</span>
          <span className="block truncate text-[15px] font-semibold">Your shop</span>
        </span>
        <Stamp variant="category">Women · Dresses</Stamp>
      </figcaption>
    </motion.figure>
  );
}

/**
 * Seller log in / sign up frame: the form on paper at the left, a kraft "Sell on FlipOne" panel at the right
 * with a short, true pitch, the order flow stamps and a sample tag photo.
 */
export default function SellerAuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen grid-cols-2 bg-paper text-ink xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <SkipLink />
      <div className="flex min-w-0 flex-col px-8 py-6 xl:px-14">
        <header className="flex items-center justify-between gap-4">
          <Logo />
          <Link
            to="/"
            className="rounded-sm text-[14px] font-medium text-ink-2 underline decoration-line-mid decoration-[1.5px] underline-offset-[3px] transition-colors hover:text-ink hover:decoration-ink"
          >
            Back to the shop
          </Link>
        </header>

        <main id="main" tabIndex={-1} className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10 focus:outline-none">
          <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em] text-balance">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[15px] leading-normal text-muted-foreground">{subtitle}</p>}
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 border-t border-line-soft pt-5 text-[14px] text-ink-2">{footer}</div>}
        </main>
      </div>

      <aside
        aria-labelledby="sell-on-flipone"
        className="relative flex min-w-0 flex-col justify-center gap-8 overflow-hidden bg-kraft px-8 py-10 text-ink xl:flex-row xl:items-center xl:justify-center xl:gap-12 xl:px-12 2xl:gap-16 2xl:px-16"
      >
        <div className="min-w-0">
          <h2 id="sell-on-flipone" className="font-display text-[44px] leading-none font-bold tracking-[0.005em] xl:text-[56px]">
            Sell on FlipOne
          </h2>
          <p className="mt-3 max-w-[32ch] text-[16px] leading-snug text-kraft-ink">Your shop&rsquo;s name on every tag.</p>
        </div>

        {/* the picture does the explaining: a real tag with your shop on it */}
        <div className="flex w-[min(260px,70%)] shrink-0 xl:w-[260px] xl:justify-center 2xl:w-[300px]">
          <SampleTag />
        </div>
      </aside>
    </div>
  );
}
