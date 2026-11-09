import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { StoreLayout } from "@/components/flipone";
import { useApiGet } from "@/hooks/useApiGet";
import RouteFallback from "@/router/RouteFallback";
import AuthDialogProvider from "./auth/AuthDialogProvider";

/**
 * Layout route for every storefront page: one StoreHeader/StoreFooter that stays mounted between pages.
 * Categories (GET /api/product/categories) are loaded once here and shared with the header and with pages
 * through the outlet context: const { categories } = useOutletContext().
 */
export default function StorefrontLayout() {
  const { data } = useApiGet("/api/product/categories");
  const categories = Array.isArray(data) ? data : [];

  // Scroll position (top on a new page, restored on Back) is handled once for the whole app by
  // <ScrollRestoration> in src/router/Router.jsx.

  return (
    <AuthDialogProvider>
      <StoreLayout contained={false} headerProps={{ categories }}>
        {/* Pages are lazy chunks: the header/footer stay put while a page chunk loads. */}
        <Suspense fallback={<RouteFallback />}>
          <Outlet context={{ categories }} />
        </Suspense>
      </StoreLayout>
    </AuthDialogProvider>
  );
}
