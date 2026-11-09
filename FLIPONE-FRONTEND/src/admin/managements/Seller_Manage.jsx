import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import apiClient, { apiErrorMessage } from "../../config/apiClient";
import { useApiGet } from "../../hooks/useApiGet";
import { useUrlState } from "../../hooks/useUrlState";
import { formatDate } from "@/lib/format";
import {
  CellText,
  DataTable,
  DataTableFooter,
  DataTableMessage,
  EmptyState,
  PortalShell,
} from "@/components/flipone";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import SearchBox from "../components/SearchBox";
import StatusSwitch from "../components/StatusSwitch";
import Pager, { RangeText } from "../components/Pager";
import { AnimatedRow, ErrorRow, SkeletonRows } from "../components/TableBits";
import { useDebouncedValue } from "../components/useDebouncedValue";

const ITEMS_PER_PAGE = 10;
const COLUMNS = 5;

const Seller_Manage = () => {
  // View state lives in the URL (?q=&page=) so Back/Forward, reloads and shared links keep it.
  const [pageParam, setCurrentPage] = useUrlState("page", 1, "number");
  const [q, setQ] = useUrlState("q", "", "string", { resets: ["page"] });
  const currentPage = Math.max(1, Math.floor(pageParam));

  // The box keeps its own copy so typing never waits on the router (it updates the URL in a transition);
  // a URL change from elsewhere (Back/Forward, Clear search) is copied back in.
  const [query, setQuery] = useState(q);
  const [shownQ, setShownQ] = useState(q);
  if (q !== shownQ) {
    setShownQ(q);
    setQuery(q);
  }
  const search = useDebouncedValue(query.trim(), 300);

  // Server-side pagination (page/limit -> sellers + total); ?search= matches name, email and license ID.
  const { data, loading, error, reload, setData } = useApiGet("/api/admin/allSellers", {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    ...(search ? { search } : {}),
  });
  const sellers = data?.sellers ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(Math.ceil(total / ITEMS_PER_PAGE), 1);

  // A link to a page past the end (fewer sellers now) moves to the last page instead of an empty table.
  useEffect(() => {
    if (data && !loading && !error && currentPage > totalPages) setCurrentPage(totalPages);
  }, [data, loading, error, currentPage, totalPages, setCurrentPage]);

  const toggleSellerStatus = async (seller) => {
    const action = seller.isActive ? "deactivate" : "activate";
    try {
      await apiClient.patch(`/api/admin/sellers/${seller._id}/toggle-status`);
      setData((prev) => ({
        ...prev,
        sellers: prev.sellers.map((s) => (s._id === seller._id ? { ...s, isActive: !s.isActive } : s)),
      }));
      toast.success(`Seller ${action}d`, {
        description: seller.isActive ? `${seller.name}'s products are now hidden from the store.` : seller.name,
      });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update seller status"));
    }
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  const changeQuery = (value) => {
    setQuery(value);
    setQ(value);
  };

  return (
    <PortalShell
      variant="admin"
      title="Sellers"
      subtitle="Turning a seller off blocks their log in and hides all of their products."
      actions={
        <SearchBox value={query} onChange={changeQuery} placeholder="Name, email or license ID" label="Search sellers" />
      }
    >
      <DataTable
        label="Sellers"
        footer={
          !loading &&
          !error &&
          total > 0 && (
            <DataTableFooter>
              <RangeText page={currentPage} perPage={ITEMS_PER_PAGE} total={total} noun="sellers" />
              <Pager page={currentPage} totalPages={totalPages} onChange={handlePageChange} label="Seller pages" />
            </DataTableFooter>
          )
        }
      >
        <TableHeader>
          <TableRow>
            <TableHead>Seller</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>License ID</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Account</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <SkeletonRows rows={8} cols={COLUMNS} />
          ) : error ? (
            <ErrorRow colSpan={COLUMNS} title="Could not load sellers" message={error} onRetry={reload} />
          ) : sellers.length === 0 ? (
            <DataTableMessage colSpan={COLUMNS}>
              <EmptyState
                variant="plain"
                illustration={search ? "results" : "products"}
                headingLevel="h3"
                title={search ? "No sellers match" : "No sellers yet"}
                body={
                  search
                    ? `Nothing matches “${search}”. Try a name, email or license ID.`
                    : "Seller accounts appear here once shops register."
                }
                action={
                  search && (
                    <Button variant="outline" size="sm" onClick={() => changeQuery("")}>
                      Clear search
                    </Button>
                  )
                }
              />
            </DataTableMessage>
          ) : (
            sellers.map((seller, index) => (
              <AnimatedRow key={seller._id} index={index}>
                <TableCell>
                  <CellText strong max="24ch">
                    {seller.name || "Unnamed seller"}
                  </CellText>
                </TableCell>
                <TableCell>
                  <CellText max="30ch" className="text-ink-2">
                    {seller.email || "—"}
                  </CellText>
                </TableCell>
                <TableCell className="font-display text-[14px] font-semibold tracking-[0.06em] tabular">
                  {seller.licenseID || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground tabular">{formatDate(seller.createdAt)}</TableCell>
                <TableCell>
                  <StatusSwitch
                    kind="seller"
                    name={seller.name}
                    active={seller.isActive}
                    onConfirm={() => toggleSellerStatus(seller)}
                  />
                </TableCell>
              </AnimatedRow>
            ))
          )}
        </TableBody>
      </DataTable>
    </PortalShell>
  );
};

export default Seller_Manage;
