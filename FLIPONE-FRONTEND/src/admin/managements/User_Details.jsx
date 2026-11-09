import { useId } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, RotateCw } from "lucide-react";
import { toast } from "@/lib/toast";
import apiClient, { apiErrorMessage } from "../../config/apiClient";
import { useApiGet } from "../../hooks/useApiGet";
import { imageUrl } from "../../utils/imageUrl";
import { capitalize, formatDate } from "@/lib/format";
import { EmptyState, PortalShell, Stamp } from "@/components/flipone";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StatusSwitch from "../components/StatusSwitch";
import { Panel } from "../components/Panel";

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

const AccountStamp = ({ active }) =>
  active ? (
    <Stamp variant="neutral" className="bg-success-tint text-success">
      Active
    </Stamp>
  ) : (
    <Stamp variant="outOfStock">Inactive</Stamp>
  );

const Row = ({ label, children }) => (
  <div className="grid grid-cols-[140px_minmax(0,1fr)] gap-4 border-line-soft px-[18px] py-3 not-first:border-t">
    <dt className="label-caps text-[12.5px] leading-6 text-muted-foreground">{label}</dt>
    <dd className="min-w-0 text-[15px] leading-6 break-words text-ink">{children}</dd>
  </div>
);

const User_Details = () => {
  const { id } = useParams();
  const profileId = useId();
  const accountId = useId();
  const { data, loading, error, reload, setData } = useApiGet(`/api/admin/users/${encodeURIComponent(id)}`);
  const user = data?.user;

  const handleStatusToggle = async () => {
    if (!user) return;
    const action = user.isActive ? "deactivate" : "activate";
    try {
      await apiClient.patch(`/api/admin/users/${encodeURIComponent(id)}/toggle-status`);
      setData((prev) => ({ ...prev, user: { ...prev.user, isActive: !prev.user.isActive } }));
      toast.success(`User ${action}d`, { description: user.name });
    } catch (err) {
      toast.error(apiErrorMessage(err, "Error updating user status"));
    }
  };

  const backLink = (
    <Button asChild variant="outline" size="sm">
      <Link to="/user_manage">
        <ArrowLeft aria-hidden="true" />
        All users
      </Link>
    </Button>
  );

  return (
    <PortalShell
      variant="admin"
      title={user?.name ?? "User details"}
      titleAddon={user && <AccountStamp active={user.isActive} />}
      subtitle={user ? `Shopper since ${formatDate(user.createdAt)}` : undefined}
      actions={backLink}
    >
      {loading ? (
        <div className="grid items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_340px]" aria-busy="true">
          <div className="rounded-md border border-line-soft bg-surface p-[18px]">
            <Skeleton className="size-14 rounded-full" />
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="mt-4 h-5 w-full max-w-[420px]" />
            ))}
          </div>
          <Skeleton className="h-[180px] w-full" />
        </div>
      ) : !user ? (
        <div role="alert">
          <EmptyState
            illustration="results"
            title={error === "User not found" ? "This user does not exist" : "Could not load this user"}
            body={error || "User not found"}
            action={
              <>
                {error !== "User not found" && (
                  <Button variant="outline" size="sm" onClick={reload}>
                    <RotateCw aria-hidden="true" />
                    Try again
                  </Button>
                )}
                <Button asChild variant="ink" size="sm">
                  <Link to="/user_manage">Back to users</Link>
                </Button>
              </>
            }
          />
        </div>
      ) : (
        <div className="grid items-start gap-[18px] xl:grid-cols-[minmax(0,1fr)_340px]">
          <Panel title="Profile" titleId={profileId}>
            <div className="flex items-center gap-4 border-b border-line-soft px-[18px] py-4">
              {user.profilePic ? (
                <img
                  src={imageUrl(user.profilePic)}
                  alt=""
                  className="size-14 shrink-0 rounded-full border border-line-soft bg-paper-2 object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="grid size-14 shrink-0 place-items-center rounded-full bg-kraft font-display text-[22px] leading-none font-bold text-ink"
                >
                  {initials(user.name)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-[17px] font-semibold">{user.name}</p>
                <p className="truncate text-[14px] text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <dl>
              <Row label="Mobile">
                {user.mobile ? <span className="tabular">{user.mobile}</span> : <span className="text-muted-foreground">Not given</span>}
              </Row>
              <Row label="Address">
                {user.address ? user.address : <span className="text-muted-foreground">Not given</span>}
              </Row>
              <Row label="Role">{capitalize(user.role ?? "user")}</Row>
              <Row label="Joined">
                <span className="tabular">{formatDate(user.createdAt)}</span>
              </Row>
            </dl>
          </Panel>

          <Panel title="Account" titleId={accountId} bodyClassName="px-[18px] py-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[14.5px] font-medium">Can log in and order</span>
              <StatusSwitch kind="user" name={user.name} active={user.isActive} onConfirm={handleStatusToggle} />
            </div>
            <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
              {user.isActive
                ? "Turning the account off stops this shopper from logging in or using their account."
                : "This account is turned off. The shopper cannot log in until you turn it back on."}
            </p>
          </Panel>
        </div>
      )}
    </PortalShell>
  );
};

export default User_Details;
