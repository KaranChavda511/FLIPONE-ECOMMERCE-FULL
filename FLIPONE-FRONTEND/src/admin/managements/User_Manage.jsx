import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
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
  DataTableToolbar,
  EmptyState,
  PortalShell,
} from "@/components/flipone";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import SearchBox from "../components/SearchBox";
import FilterTabs from "../components/FilterTabs";
import StatusSwitch from "../components/StatusSwitch";
import Pager, { RangeText } from "../components/Pager";
import { AnimatedRow, ErrorRow, SkeletonRows } from "../components/TableBits";
import { useDebouncedValue } from "../components/useDebouncedValue";

const USERS_PER_PAGE = 10;
const COLUMNS = 6;
const STATUSES = ["all", "active", "inactive"];

const User_Manage = () => {
  // View state lives in the URL (?q=&status=&page=) so Back/Forward, reloads and shared links keep it.
  const [, setSearchParams] = useSearchParams();
  const [pageParam, setCurrentPage] = useUrlState("page", 1, "number");
  const [q, setQ] = useUrlState("q", "", "string", { resets: ["page"] });
  const [statusParam, setFilter] = useUrlState("status", "all", "string", { resets: ["page"] });
  const currentPage = Math.max(1, Math.floor(pageParam));
  const filter = STATUSES.includes(statusParam) ? statusParam : "all";

  // The box keeps its own copy so typing never waits on the router (it updates the URL in a transition);
  // a URL change from elsewhere (Back/Forward, Clear filters) is copied back in.
  const [query, setQuery] = useState(q);
  const [shownQ, setShownQ] = useState(q);
  if (q !== shownQ) {
    setShownQ(q);
    setQuery(q);
  }
  const search = useDebouncedValue(query.trim(), 300);

  // The backend searches name and email (?search=); the list itself is not paginated server-side.
  const { data, loading, error, reload, setData } = useApiGet("/api/admin/allUsers", search ? { search } : undefined);
  const users = useMemo(() => data?.users ?? [], [data]);

  const activeCount = users.filter((u) => u.isActive).length;
  const filtered = filter === "all" ? users : users.filter((u) => (filter === "active" ? u.isActive : !u.isActive));
  const totalPages = Math.max(Math.ceil(filtered.length / USERS_PER_PAGE), 1);
  const page = Math.min(currentPage, totalPages);
  const currentUsers = filtered.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);

  const toggleUserStatus = async (user) => {
    const action = user.isActive ? "deactivate" : "activate";
    try {
      await apiClient.patch(`/api/admin/users/${user._id}/toggle-status`);
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u._id === user._id ? { ...u, isActive: !u.isActive } : u)),
      }));
      toast.success(`User ${action}d`, { description: user.name });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to update user status"));
    }
  };

  const changeQuery = (value) => {
    setQuery(value);
    setQ(value);
  };
  // One URL update: separate setters in one handler would each start from the same URL and undo each other.
  const clearFilters = () => {
    setQuery("");
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        ["q", "status", "page"].forEach((key) => next.delete(key));
        return next;
      },
      { replace: true, preventScrollReset: true }
    );
  };

  return (
    <PortalShell
      variant="admin"
      title="Users"
      subtitle="Shopper accounts. Turning an account off stops it from logging in."
      actions={<SearchBox value={query} onChange={changeQuery} placeholder="Name or email" label="Search users" />}
    >
      <DataTable
        label="Users"
        toolbar={
          <DataTableToolbar>
            <h2 className="sr-only">Users</h2>
            <FilterTabs
              label="Filter users by status"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "All", count: users.length },
                { value: "active", label: "Active", count: activeCount },
                { value: "inactive", label: "Inactive", count: users.length - activeCount },
              ]}
            />
          </DataTableToolbar>
        }
        footer={
          !loading &&
          !error &&
          filtered.length > 0 && (
            <DataTableFooter>
              <RangeText page={page} perPage={USERS_PER_PAGE} total={filtered.length} noun="users" />
              <Pager page={page} totalPages={totalPages} onChange={setCurrentPage} label="User pages" />
            </DataTableFooter>
          )
        }
      >
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Mobile</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>
              <span className="sr-only">Details</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <SkeletonRows rows={8} cols={COLUMNS} />
          ) : error ? (
            <ErrorRow colSpan={COLUMNS} title="Could not load users" message={error} onRetry={reload} />
          ) : filtered.length === 0 ? (
            <DataTableMessage colSpan={COLUMNS}>
              <EmptyState
                variant="plain"
                illustration="results"
                headingLevel="h3"
                title={users.length === 0 && !search ? "No shoppers yet" : "No users match"}
                body={
                  users.length === 0 && !search
                    ? "Shopper accounts appear here once people sign up."
                    : "Try another name or email, or show all accounts."
                }
                action={
                  (search || filter !== "all") && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  )
                }
              />
            </DataTableMessage>
          ) : (
            currentUsers.map((user, index) => (
              <AnimatedRow key={user._id} index={index}>
                <TableCell>
                  <Link
                    to={`/admin/allUsers/${user._id}`}
                    className="block max-w-[22ch] truncate font-medium text-ink underline-offset-[3px] hover:underline"
                    title={user.name}
                  >
                    {user.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <CellText max="30ch" className="text-ink-2">
                    {user.email}
                  </CellText>
                </TableCell>
                <TableCell className="text-ink-2 tabular">{user.mobile || "—"}</TableCell>
                <TableCell className="text-muted-foreground tabular">{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <StatusSwitch
                    kind="user"
                    name={user.name}
                    active={user.isActive}
                    onConfirm={() => toggleUserStatus(user)}
                  />
                </TableCell>
                <TableCell className="w-10 pr-2">
                  <Link
                    to={`/admin/allUsers/${user._id}`}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="grid size-[30px] place-items-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-paper-2 hover:text-ink"
                  >
                    <ChevronRight className="size-4" strokeWidth={1.75} />
                  </Link>
                </TableCell>
              </AnimatedRow>
            ))
          )}
        </TableBody>
      </DataTable>
    </PortalShell>
  );
};

export default User_Manage;
