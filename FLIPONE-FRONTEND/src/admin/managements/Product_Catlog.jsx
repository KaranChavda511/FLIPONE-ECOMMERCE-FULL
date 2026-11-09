import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useApiGet } from "../../hooks/useApiGet";
import { useUrlState } from "../../hooks/useUrlState";
import { imageUrl } from "../../utils/imageUrl";
import { capitalize, formatDate, formatInr, formatNumber } from "@/lib/format";
import {
  CellSub,
  CellText,
  DataTable,
  DataTableFooter,
  DataTableMessage,
  EmptyState,
  PortalShell,
  Stamp,
} from "@/components/flipone";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Pager, { RangeText } from "../components/Pager";
import { AnimatedRow, ErrorRow, SkeletonRows } from "../components/TableBits";

const ITEMS_PER_PAGE = 10;
const LOW_STOCK_AT = 5;
const COLUMNS = 6;

const categoryLabel = (product) => {
  const category = typeof product.category === "string" ? product.category : product.category?.name;
  const sub = product.subcategories?.[0];
  return [category, sub].filter(Boolean).map(capitalize).join(" · ");
};

const StockCell = ({ stock }) => {
  const n = Number(stock) || 0;
  if (n <= 0) return <Stamp variant="outOfStock" />;
  return (
    <span className="inline-flex items-center gap-2">
      {n <= LOW_STOCK_AT && <Stamp variant="lowStock" count={n} />}
      {n > LOW_STOCK_AT && <span className="tabular">{formatNumber(n)}</span>}
    </span>
  );
};

const Product_Catalog = () => {
  // ?page= keeps the page across Back/Forward, reloads and shared links.
  const [pageParam, setCurrentPage] = useUrlState("page", 1, "number");
  const currentPage = Math.max(1, Math.floor(pageParam));
  // Live products (active, from active sellers), paginated server-side: { products, total, totalPages }.
  const { data, loading, error, reload } = useApiGet("/api/admin/product-list", {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });
  const products = data?.products ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(data?.totalPages ?? 1, 1);

  // A link to a page past the end (fewer products now) moves to the last page instead of an empty table.
  useEffect(() => {
    if (data && !loading && !error && currentPage > totalPages) setCurrentPage(totalPages);
  }, [data, loading, error, currentPage, totalPages, setCurrentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <PortalShell
      variant="admin"
      title="Products"
      subtitle="Every live product from active sellers, newest first."
    >
      <DataTable
        label="Products"
        footer={
          !loading &&
          !error &&
          total > 0 && (
            <DataTableFooter>
              <RangeText page={currentPage} perPage={ITEMS_PER_PAGE} total={total} noun="products" />
              <Pager page={currentPage} totalPages={totalPages} onChange={handlePageChange} label="Product pages" />
            </DataTableFooter>
          )
        }
      >
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead className="text-right">MRP</TableHead>
            <TableHead>Stock</TableHead>
            {/* listing date from xl: below that the table must fit without a sideways scroll */}
            <TableHead className="hidden xl:table-cell">Listed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <SkeletonRows rows={8} cols={COLUMNS} />
          ) : error ? (
            <ErrorRow colSpan={COLUMNS} title="Could not load products" message={error} onRetry={reload} />
          ) : products.length === 0 ? (
            <DataTableMessage colSpan={COLUMNS}>
              <EmptyState
                variant="plain"
                illustration="products"
                headingLevel="h3"
                title="No live products"
                body="Products appear here once active sellers list them."
              />
            </DataTableMessage>
          ) : (
            products.map((product, index) => {
              const category = categoryLabel(product);
              return (
                <AnimatedRow key={product._id} index={index}>
                  <TableCell className="py-1.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={imageUrl(product.images)}
                        alt=""
                        loading="lazy"
                        className="h-[45px] w-9 shrink-0 rounded-[3px] bg-paper-2 object-cover"
                      />
                      <Link
                        to={`/product/${product._id}`}
                        className="block max-w-[32ch] truncate font-semibold text-ink underline-offset-[3px] hover:underline"
                        title={product.name}
                      >
                        {product.name}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    {category ? <Stamp variant="category">{category}</Stamp> : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <CellText max="22ch">{product.seller?.name || "Unknown seller"}</CellText>
                    {product.seller?.licenseID && (
                      <CellSub className="font-display tracking-[0.06em] tabular">{product.seller.licenseID}</CellSub>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular">{formatInr(product.price)}</TableCell>
                  <TableCell>
                    <StockCell stock={product.stock} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground tabular xl:table-cell">{formatDate(product.createdAt)}</TableCell>
                </AnimatedRow>
              );
            })
          )}
        </TableBody>
      </DataTable>
    </PortalShell>
  );
};

export default Product_Catalog;
