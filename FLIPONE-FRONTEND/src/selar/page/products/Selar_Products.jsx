import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Formik, Form } from "formik";
import { motion } from "motion/react";
import { EyeOff, Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CellSub,
  CellText,
  DataTable,
  DataTableFooter,
  DataTableMessage,
  DataTableToolbar,
  EmptyState,
  Mrp,
  PortalShell,
  Stamp,
} from "@/components/flipone";
import { formatNumber } from "@/lib/format";
import { imageUrl } from "@/utils/imageUrl";
import apiClient, { apiErrorMessage } from "../../../config/apiClient";
import { useApiGet } from "../../../hooks/useApiGet";
import { useUrlState } from "../../../hooks/useUrlState";
import FilterTabs from "../../components/FilterTabs";
import ImagePicker from "../../components/ImagePicker";
import { PanelError } from "../../components/Panel";
import ProductFields from "../../components/ProductFields";
import SearchBox from "../../components/SearchBox";
import StockCell from "../../components/StockCell";
import {
  categoryLabel,
  categoryList,
  emptyProduct,
  LOW_STOCK_AT,
  MAX_IMAGES,
  productFormData,
  productSchema,
  staggerDelay,
  stockLevel,
} from "../../lib/seller";

const COLS = 6;
const MotionRow = motion.create(TableRow);
const ADD_FORM_ID = "add-product-form";
const STOCK_FILTERS = ["all", "low", "out"];

/** The "Add product" form inside the sheet. Mounted only while the sheet is open, so closing it clears the draft. */
function AddProductForm({ categoriesReq, onAdded }) {
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState(null);
  const categories = categoryList(categoriesReq.data);

  const handleCreate = async (values, { resetForm, setSubmitting }) => {
    if (images.length === 0) {
      setImageError("Add at least one photo");
      toast.error("Please select at least one image");
      setSubmitting(false);
      return;
    }
    try {
      await apiClient.post("/api/seller/add-product", productFormData(values, images));
      toast.success("Product added successfully!");
      resetForm();
      setImages([]);
      onAdded();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to add product"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik initialValues={emptyProduct} validationSchema={productSchema} onSubmit={handleCreate}>
      {({ isSubmitting }) => (
        <>
          <Form id={ADD_FORM_ID} noValidate className="grid min-h-0 flex-1 content-start gap-5 overflow-y-auto px-6 pt-1 pb-6">
            <ImagePicker
              files={images}
              onChange={(next) => {
                setImages(next);
                if (next.length) setImageError(null);
              }}
              max={MAX_IMAGES}
              required
              error={imageError}
              disabled={isSubmitting}
            />
            <ProductFields
              categories={categories}
              categoriesLoading={categoriesReq.loading}
              categoriesError={categoriesReq.error}
            />
          </Form>
          <SheetFooter className="flex-row items-center justify-end gap-2 border-t border-line-soft px-6 py-3.5">
            <SheetClose asChild>
              <Button variant="ghost" disabled={isSubmitting}>
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" form={ADD_FORM_ID} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}
              {isSubmitting ? "Adding…" : "Add product"}
            </Button>
          </SheetFooter>
        </>
      )}
    </Formik>
  );
}

const Selar_Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, loading, error, reload } = useApiGet("/api/seller/products");
  const categoriesReq = useApiGet("/api/product/categories");
  const products = useMemo(() => data?.products ?? [], [data]);

  // The dashboard links here with ?add=1 to open the sheet straight away.
  const [sheetOpen, setSheetOpen] = useState(() => searchParams.get("add") === "1");
  // View state lives in the URL (?stock=&q=) so Back/Forward, reloads and shared links keep it.
  const [stockParam, setFilter] = useUrlState("stock", "all");
  const [q, setQ] = useUrlState("q", "");
  const filter = STOCK_FILTERS.includes(stockParam) ? stockParam : "all";
  const [toDeactivate, setToDeactivate] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  // The box keeps its own copy so typing never waits on the router (it updates the URL in a transition);
  // a URL change from elsewhere (Back/Forward, Show all products) is copied back in.
  const [query, setQueryText] = useState(q);
  const [shownQ, setShownQ] = useState(q);
  if (q !== shownQ) {
    setShownQ(q);
    setQueryText(q);
  }
  const setQuery = (value) => {
    setQueryText(value);
    setQ(value);
  };
  // One URL update: separate setters in one handler would each start from the same URL and undo each other.
  const showAll = () => {
    setQueryText("");
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        ["stock", "q"].forEach((key) => next.delete(key));
        return next;
      },
      { replace: true, preventScrollReset: true }
    );
  };

  const setSheet = (open) => {
    setSheetOpen(open);
    if (!open && searchParams.has("add")) {
      const next = new URLSearchParams(searchParams);
      next.delete("add");
      // Keeps ?stock= and ?q=; preventScrollReset so closing the sheet does not jump the list to the top.
      setSearchParams(next, { replace: true, preventScrollReset: true });
    }
  };

  const counts = useMemo(() => {
    const c = { all: products.length, low: 0, out: 0 };
    products.forEach((p) => {
      const level = stockLevel(p.stock);
      if (level === "low") c.low += 1;
      if (level === "out") c.out += 1;
    });
    return c;
  }, [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (filter !== "all" && stockLevel(p.stock) !== filter) return false;
      if (!q) return true;
      return [p.name, p.category, ...(p.subcategories ?? [])].some((v) => String(v ?? "").toLowerCase().includes(q));
    });
  }, [products, filter, query]);

  const handleDeactivate = async () => {
    const product = toDeactivate;
    if (!product) return;
    setDeactivating(true);
    try {
      await apiClient.delete(`/api/seller/products/${product.productId}`);
      toast.success("Product removed");
      setToDeactivate(null);
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to remove product"));
    } finally {
      setDeactivating(false);
    }
  };

  const filtering = filter !== "all" || query.trim() !== "";

  return (
    <PortalShell
      variant="seller"
      title="Products"
      titleAddon={
        !loading && !error ? (
          <span className="text-[15px] font-medium text-muted-foreground tabular">
            {formatNumber(products.length)} listed
          </span>
        ) : null
      }
      actions={
        <Button onClick={() => setSheet(true)}>
          <Plus aria-hidden="true" />
          Add product
        </Button>
      }
    >
      <DataTable
        label="Your products"
        maxHeight="calc(100vh - 210px)"
        toolbar={
          <DataTableToolbar>
            <h2 className="sr-only">Your products</h2>
            <FilterTabs
              label="Filter by stock"
              value={filter}
              onChange={setFilter}
              items={[
                { value: "all", label: "All", count: counts.all },
                { value: "low", label: `Low (1 to ${LOW_STOCK_AT})`, count: counts.low },
                { value: "out", label: "Out of stock", count: counts.out },
              ]}
            />
            <div className="ml-auto">
              <SearchBox value={query} onChange={setQuery} label="Search your products" placeholder="Search products" />
            </div>
          </DataTableToolbar>
        }
        footer={
          !loading && !error && products.length > 0 ? (
            <DataTableFooter>
              <span>Removed products are hidden from the shop; existing orders keep them.</span>
              <span className="tabular">
                {visible.length === products.length
                  ? `${formatNumber(products.length)} products`
                  : `${formatNumber(visible.length)} of ${formatNumber(products.length)} products`}
              </span>
            </DataTableFooter>
          ) : null
        }
      >
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>MRP</TableHead>
            <TableHead>Stock</TableHead>
            {/* Photos and descriptions only from xl: below that the table must fit without a sideways scroll. */}
            <TableHead className="hidden text-right xl:table-cell">Photos</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 6 }, (_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-[60px] w-12" />
                    <div className="grid gap-1.5">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </TableCell>
                {Array.from({ length: COLS - 1 }, (__, j) => (
                  // j === 3 is the Photos column, shown from xl only
                  <TableCell key={j} className={j === 3 ? "hidden xl:table-cell" : undefined}>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : error ? (
            <DataTableMessage colSpan={COLS} className="py-0">
              <PanelError title="Could not load your products" message={error} onRetry={reload} />
            </DataTableMessage>
          ) : products.length === 0 ? (
            <DataTableMessage colSpan={COLS} className="py-2">
              <EmptyState
                variant="plain"
                illustration="products"
                title="No products yet"
                body="Add your first product with its MRP, stock, category and up to 5 photos. It goes live in the shop straight away."
                action={
                  <Button variant="ink" onClick={() => setSheet(true)}>
                    <Plus aria-hidden="true" />
                    Add product
                  </Button>
                }
              />
            </DataTableMessage>
          ) : visible.length === 0 ? (
            <DataTableMessage colSpan={COLS} className="py-2">
              <EmptyState
                variant="plain"
                illustration="results"
                title="No products match"
                body={filtering ? "Try another filter or search term." : undefined}
                action={
                  <Button variant="outline" size="sm" onClick={showAll}>
                    Show all products
                  </Button>
                }
              />
            </DataTableMessage>
          ) : (
            visible.map((product, index) => {
              const images = product.images ?? [];
              return (
                <MotionRow
                  key={product.productId}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: staggerDelay(index), ease: [0.22, 1, 0.36, 1] }}
                >
                  <TableCell className="py-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={imageUrl(images)}
                        alt=""
                        className="h-[60px] w-12 shrink-0 rounded-[3px] bg-paper-2 object-cover"
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/updateproduct/${product.productId}`}
                          className="block max-w-[32ch] truncate rounded-sm text-[14.5px] font-semibold text-ink hover:underline hover:underline-offset-[3px]"
                          title={product.name}
                        >
                          {product.name}
                        </Link>
                        <CellSub className="hidden xl:block">
                          <CellText max="44ch">{product.description || "No description"}</CellText>
                        </CellSub>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.category ? (
                      <Stamp variant="category">{categoryLabel(product.category, product.subcategories)}</Stamp>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                    {product.subcategories?.length > 1 && (
                      <CellSub className="mt-1">+{product.subcategories.length - 1} more</CellSub>
                    )}
                  </TableCell>
                  <TableCell>
                    <Mrp value={product.price} size="sm" showNote={false} />
                  </TableCell>
                  <TableCell>
                    <StockCell stock={product.stock} />
                  </TableCell>
                  <TableCell className="hidden text-right text-muted-foreground tabular xl:table-cell">
                    {images.length}/{MAX_IMAGES}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button asChild variant="outline" size="xs">
                        <Link to={`/updateproduct/${product.productId}`} aria-label={`Edit ${product.name}`}>
                          <Pencil aria-hidden="true" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="remove"
                        size="xs"
                        onClick={() => setToDeactivate(product)}
                        aria-label={`Remove ${product.name} from the shop`}
                      >
                        <EyeOff aria-hidden="true" />
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </MotionRow>
              );
            })
          )}
        </TableBody>
      </DataTable>

      {/* Add product */}
      <Sheet open={sheetOpen} onOpenChange={setSheet}>
        <SheetContent side="right" className="w-full gap-0 sm:max-w-[560px]">
          <SheetHeader className="border-b border-line-soft px-6 pt-5 pb-4">
            <SheetTitle className="text-[22px] leading-tight tracking-[-0.01em]">Add product</SheetTitle>
            <SheetDescription>
              It goes live in the shop as soon as you add it, with your shop&rsquo;s name on the tag.
            </SheetDescription>
          </SheetHeader>
          {sheetOpen && (
            <AddProductForm
              categoriesReq={categoriesReq}
              onAdded={() => {
                setSheet(false);
                reload();
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Remove (deactivate) confirmation */}
      <Dialog open={Boolean(toDeactivate)} onOpenChange={(open) => !open && !deactivating && setToDeactivate(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove this product from the shop?</DialogTitle>
            <DialogDescription>
              &ldquo;{toDeactivate?.name}&rdquo; stops showing to shoppers and drops off this list. Orders already placed
              are not affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={deactivating}>
                Keep it
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeactivate} disabled={deactivating}>
              {deactivating && <Loader2 className="animate-spin" aria-hidden="true" />}
              Remove product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalShell>
  );
};

export default Selar_Products;
