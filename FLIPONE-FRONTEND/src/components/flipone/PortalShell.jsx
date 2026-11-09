import { useDispatch, useSelector } from "react-redux";
import { NavLink, matchPath, useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAdmin } from "@/redux/adminSlice";
import { logoutSeller } from "@/redux/sellarSlice";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Logo from "./Logo";
import SkipLink from "./SkipLink";
import Stamp from "./Stamp";
import { ADMIN_NAV, SELLER_NAV } from "./portalNav";

const ROLE = {
  seller: { label: "Seller", account: "Seller account", nav: SELLER_NAV, loginPath: "/selar_login" },
  admin: { label: "Admin", account: "Signed in", nav: ADMIN_NAV, loginPath: "/admin_login" },
};

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "F";

/** The signed-in seller/admin name from redux (sellerInfo / adminInfo). */
const usePortalName = (variant) =>
  useSelector((state) =>
    variant === "admin" ? state.admin?.adminInfo?.name ?? "Admin" : state.seller?.sellerInfo?.name ?? "Seller"
  );

function SideNavItem({ item }) {
  const { pathname } = useLocation();
  const Icon = item.icon;
  // Active state is computed here, not with NavLink's className function: TooltipTrigger asChild (Radix Slot)
  // merges className as a string, which stringified the function and marked every item active.
  const active =
    Boolean(matchPath({ path: item.to, end: item.end ?? false, caseSensitive: false }, pathname)) ||
    (item.also ?? []).some((prefix) => pathname.toLowerCase().startsWith(prefix.toLowerCase()));

  return (
    <li>
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            to={item.to}
            end={item.end}
            aria-current={active ? "page" : undefined}
            // Active: paper-tinted fill + semibold white + aria-current. No red marker or coloured bar: tag red
            // is reserved for actions and MRP.
            className={cn(
              "relative flex h-10 items-center justify-center gap-3 rounded-md text-[14.5px] font-medium text-[#D9D4C9] xl:justify-start xl:px-2.5",
              "transition-colors duration-150 hover:bg-paper/8 hover:text-white focus-visible:outline-paper",
              active && "bg-paper/14 font-semibold text-white hover:bg-paper/14"
            )}
          >
            {Icon && <Icon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden="true" />}
            <span className="sr-only xl:not-sr-only">{item.label}</span>
          </NavLink>
        </TooltipTrigger>
        <TooltipContent side="right" className="xl:hidden">
          {item.label}
        </TooltipContent>
      </Tooltip>
    </li>
  );
}

/**
 * Seller/admin app frame (mock-up `.app` / `.side` / `.main` / `.topbar`).
 * Ink sidebar 240px (68px icon rail below 1280px) with wordmark, role stamp, nav and logout;
 * top bar with the page title, an optional title addon and right-aligned actions; then the content column.
 *
 * Props:
 *  variant: 'seller' | 'admin' (picks default nav, role stamp, account name and logout target)
 *  title: page title (rendered as the page's h1); titleAddon: node after the title (e.g. a Stamp)
 *  subtitle: optional muted line under the title
 *  actions: node(s) on the right of the top bar (search, filters, primary button)
 *  nav: [{ to, label, icon, end?, also? }] to override the default items
 *  onLogout: override; default dispatches logoutSeller/logoutAdmin and goes to the matching login page
 *  roleNote: text beside the role stamp (default: the account name)
 */
export default function PortalShell({
  variant = "seller",
  title,
  titleAddon,
  subtitle,
  actions,
  nav,
  onLogout,
  roleNote,
  children,
  className,
  contentClassName,
}) {
  const role = ROLE[variant] ?? ROLE.seller;
  const items = nav ?? role.nav;
  const name = usePortalName(variant);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) return onLogout();
    dispatch(variant === "admin" ? logoutAdmin() : logoutSeller());
    navigate(role.loginPath);
  };

  return (
    <div
      className={cn(
        "grid min-h-screen grid-cols-[68px_minmax(0,1fr)] bg-paper text-ink xl:grid-cols-[240px_minmax(0,1fr)]",
        className
      )}
    >
      <SkipLink />
      <aside className="sticky top-0 flex h-screen flex-col bg-ink px-2 py-4 text-[#E9E5DC] xl:px-3 xl:py-[18px]">
        <div className="flex justify-center xl:justify-start xl:px-2.5">
          <Logo tone="paper" size="md" className="hidden xl:inline-flex" />
          <Logo tone="paper" compact className="xl:hidden" />
        </div>
        <div className="mt-2 mb-3 flex items-center justify-center gap-2 border-b border-paper/12 pt-1.5 pb-3.5 xl:justify-start xl:px-2.5 xl:pb-[18px]">
          <Stamp variant="kraft" className="h-[22px] text-[12px]">
            {role.label}
          </Stamp>
          <span className="hidden truncate text-[13px] text-[#B9B3A6] xl:inline">{roleNote ?? name}</span>
        </div>
        <nav aria-label={`${role.label} navigation`} className="min-h-0 flex-1 overflow-y-auto">
          <ul className="flex flex-col gap-0.5">
            {items.map((item) => (
              <SideNavItem key={item.to} item={item} />
            ))}
          </ul>
        </nav>
        <div className="mt-auto flex flex-col items-center gap-2.5 border-t border-paper/12 pt-3 text-[13.5px] xl:flex-row xl:px-2.5">
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-full bg-kraft font-display text-[15px] leading-none font-bold text-ink"
          >
            {initials(name)}
          </span>
          <div className="hidden min-w-0 xl:block">
            <span className="block truncate font-medium text-paper">{name}</span>
            <small className="block text-[12px] text-[#B9B3A6]">{role.account}</small>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className="grid size-8 place-items-center rounded-md text-[#D9D4C9] transition-colors duration-150 hover:bg-paper/8 hover:text-white focus-visible:outline-paper xl:ml-auto"
          >
            <LogOut className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <main
          id="main"
          tabIndex={-1}
          className={cn(
            "mx-auto flex w-full max-w-[1600px] min-w-0 flex-1 flex-col gap-[18px] px-6 pt-5 pb-7 focus:outline-none xl:px-7",
            contentClassName
          )}
        >
          {(title || actions) && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  {title && <h1 className="mr-1 text-[26px] leading-tight font-semibold tracking-[-0.02em]">{title}</h1>}
                  {titleAddon}
                </div>
                {subtitle && <p className="mt-1 text-[14px] text-muted-foreground">{subtitle}</p>}
              </div>
              {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
