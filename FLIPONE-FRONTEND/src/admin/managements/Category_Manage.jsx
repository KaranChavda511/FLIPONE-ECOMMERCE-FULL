import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import apiClient, { apiErrorMessage } from "../../config/apiClient";
import { useApiGet } from "../../hooks/useApiGet";
import { formatNumber } from "@/lib/format";
import {
  DataTable,
  DataTableFooter,
  DataTableMessage,
  EmptyState,
  PortalShell,
  Stamp,
} from "@/components/flipone";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import CategorySheet from "../components/CategorySheet";
import { AnimatedRow, ErrorRow, SkeletonRows } from "../components/TableBits";

const COLUMNS = 4;
const byName = (a, b) => a.name.localeCompare(b.name, "en-IN", { sensitivity: "base" });

/**
 * Live product count per category name: GET /api/admin/product-list?category=<name>&limit=1 reads `total`
 * (active products from active sellers). One small request per category; the previous counts stay on screen
 * while a changed list reloads. A failed request leaves that count unknown (null).
 */
function useLiveProductCounts(names) {
  const key = JSON.stringify(names);
  const [state, setState] = useState({ key: null, counts: {} });

  useEffect(() => {
    const list = JSON.parse(key);
    if (list.length === 0) return undefined;
    let active = true;
    Promise.allSettled(
      list.map((category) => apiClient.get("/api/admin/product-list", { params: { category, limit: 1 } }))
    ).then((results) => {
      if (!active) return;
      const counts = {};
      results.forEach((result, i) => {
        counts[list[i]] = result.status === "fulfilled" ? Number(result.value.data?.total) || 0 : null;
      });
      setState({ key, counts });
    });
    return () => {
      active = false;
    };
  }, [key]);

  return { counts: state.counts, loading: names.length > 0 && state.key !== key };
}

const plural = (n, one, many) => `${formatNumber(n)} ${n === 1 ? one : many}`;

const Category_Manage = () => {
  // GET /api/product/categories → [{ _id, name, subcategories }] sorted by name.
  const { data, loading, error, reload, setData } = useApiGet("/api/product/categories");
  const categories = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const names = useMemo(() => categories.map((c) => c.name), [categories]);
  const live = useLiveProductCounts(names);

  const [sheet, setSheet] = useState({ open: false, category: null, n: 0 });
  const [removal, setRemoval] = useState({ open: false, category: null, error: "", pending: false });
  const returnFocus = useRef(null);
  const addButton = useRef(null);

  const openSheet = (category, event) => {
    returnFocus.current = event?.currentTarget ?? null;
    setSheet((s) => ({ open: true, category, n: s.n + 1 }));
  };

  const openRemoval = (category, event) => {
    returnFocus.current = event?.currentTarget ?? null;
    setRemoval({ open: true, category, error: "", pending: false });
  };

  /* Focus goes back to the button that opened the sheet or dialog, or to "Add category" if its row is gone. */
  const restoreFocus = (event) => {
    event.preventDefault();
    const target = returnFocus.current;
    (target?.isConnected ? target : addButton.current)?.focus();
  };

  const saved = (category, { created }) => {
    setData((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const next = created ? [...list, category] : list.map((c) => (c._id === category._id ? { ...c, ...category } : c));
      return [...next].sort(byName);
    });
  };

  const confirmRemoval = async () => {
    const category = removal.category;
    if (!category) return;
    setRemoval((r) => ({ ...r, pending: true, error: "" }));
    try {
      await apiClient.delete(`/api/admin/categories/${category._id}`);
      setData((prev) => (Array.isArray(prev) ? prev.filter((c) => c._id !== category._id) : prev));
      setRemoval((r) => ({ ...r, open: false, pending: false }));
      toast.success("Category deleted", { description: category.name });
    } catch (err) {
      // e.g. 400 "Category cannot be deleted as it has associated products": shown in the dialog.
      setRemoval((r) => ({ ...r, pending: false, error: apiErrorMessage(err, "Could not delete the category") }));
    }
  };

  const removalCount = removal.category ? live.counts[removal.category.name] : null;
  const takenNames = names.filter((n) => n !== sheet.category?.name);

  return (
    <PortalShell
      variant="admin"
      title="Categories"
      subtitle="The shop's category list. Sellers file each product under one category and its subcategories."
      actions={
        <Button ref={addButton} size="sm" onClick={(event) => openSheet(null, event)}>
          <Plus aria-hidden="true" />
          Add category
        </Button>
      }
    >
      <DataTable
        label="Categories"
        footer={
          !loading &&
          !error &&
          categories.length > 0 && (
            <DataTableFooter>
              <span className="tabular">{plural(categories.length, "category", "categories")}</span>
              <span>Live products: active products from active sellers. Hidden ones are not counted.</span>
            </DataTableFooter>
          )
        }
      >
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Subcategories</TableHead>
            <TableHead className="text-right">Live products</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <SkeletonRows rows={6} cols={COLUMNS} />
          ) : error ? (
            <ErrorRow colSpan={COLUMNS} title="Could not load categories" message={error} onRetry={reload} />
          ) : categories.length === 0 ? (
            <DataTableMessage colSpan={COLUMNS}>
              <EmptyState
                variant="plain"
                illustration="products"
                headingLevel="h2"
                title="No categories yet"
                body="Add the first one with Add category. Sellers need a category before they can list a product."
              />
            </DataTableMessage>
          ) : (
            categories.map((category, index) => {
              const subs = category.subcategories ?? [];
              const count = live.counts[category.name];
              return (
                <AnimatedRow key={category._id} index={index} className="align-top">
                  <TableCell className="py-3 align-top">
                    <span className="font-semibold text-ink">{category.name}</span>
                  </TableCell>
                  <TableCell className="py-2.5 align-top">
                    {subs.length > 0 ? (
                      <ul aria-label={`${category.name} subcategories`} className="flex max-w-[70ch] flex-wrap gap-1.5">
                        {subs.map((sub) => (
                          <li key={sub}>
                            <Stamp variant="category">{sub}</Stamp>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 text-right align-top">
                    {count === undefined && live.loading ? (
                      <Skeleton className="ml-auto h-4 w-8" />
                    ) : count == null ? (
                      <span className="text-muted-foreground" title="Could not count this category's products">
                        —
                      </span>
                    ) : (
                      <span className="font-semibold tabular">{formatNumber(count)}</span>
                    )}
                  </TableCell>
                  <TableCell className="w-px py-2 pr-3 align-top whitespace-nowrap">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Edit ${category.name}`}
                        onClick={(event) => openSheet(category, event)}
                      >
                        <Pencil aria-hidden="true" />
                        Edit
                      </Button>
                      <Button
                        variant="remove"
                        size="sm"
                        aria-label={`Delete ${category.name}`}
                        onClick={(event) => openRemoval(category, event)}
                      >
                        <Trash2 aria-hidden="true" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </AnimatedRow>
              );
            })
          )}
        </TableBody>
      </DataTable>

      <CategorySheet
        key={sheet.n}
        open={sheet.open}
        onOpenChange={(open) => setSheet((s) => ({ ...s, open }))}
        category={sheet.category}
        takenNames={takenNames}
        onSaved={saved}
        onCloseAutoFocus={restoreFocus}
      />

      <Dialog open={removal.open} onOpenChange={(open) => !removal.pending && setRemoval((r) => ({ ...r, open }))}>
        <DialogContent className="sm:max-w-[460px]" onCloseAutoFocus={restoreFocus}>
          <DialogHeader>
            <DialogTitle>Delete {removal.category?.name}?</DialogTitle>
            <DialogDescription>
              It disappears from the shop&apos;s category list and from sellers&apos; product form. A category that
              products still use cannot be deleted.
              {removalCount > 0 && ` ${plural(removalCount, "live product uses", "live products use")} it.`}
            </DialogDescription>
          </DialogHeader>
          {removal.error && (
            <p
              role="alert"
              className="rounded-md border border-danger/35 bg-danger-tint px-3.5 py-2.5 text-[14px] text-ink-2"
            >
              <span className="font-semibold text-danger">Not deleted.</span> {removal.error}
            </p>
          )}
          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button variant="outline" size="sm" disabled={removal.pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant="destructive" size="sm" onClick={confirmRemoval} disabled={removal.pending}>
              {removal.pending && <Loader2 className="animate-spin" aria-hidden="true" />}
              {removal.pending ? "Deleting…" : "Delete category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalShell>
  );
};

export default Category_Manage;
