import { cn } from "@/lib/utils";
import Container from "./Container";
import SkipLink from "./SkipLink";
import StoreFooter from "./StoreFooter";
import StoreHeader from "./StoreHeader";

/**
 * Storefront page frame: StoreHeader + <main> + StoreFooter on the paper ground.
 *
 * Props:
 *  contained (default true): wrap children in <Container> (max 1600px, 24-28px gutters).
 *            Pass false when the page has full-bleed bands (CategoryBand) and wraps its own sections in <Container>.
 *  headerProps: forwarded to StoreHeader (onSearch, categories, savedTo, showCategories, sticky).
 *  mainClassName: extra classes on <main>.
 */
export default function StoreLayout({ children, contained = true, headerProps, mainClassName, className }) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-paper text-ink", className)}>
      <SkipLink />
      <StoreHeader {...headerProps} />
      <main id="main" tabIndex={-1} className={cn("flex-1 focus:outline-none", mainClassName)}>
        {contained ? <Container className="py-5">{children}</Container> : children}
      </main>
      <StoreFooter />
    </div>
  );
}
