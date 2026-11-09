import { useId, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Banknote, ChevronDown, Heart, LogOut, Package, Search, ShoppingBag, User, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { capitalize } from "@/lib/format";
import { useApiGet } from "@/hooks/useApiGet";
import { logout } from "@/redux/authSlice";
import { useAuthDialog } from "@/user/auth/authDialogContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Container from "./Container";
import Logo from "./Logo";

const actionClass =
  "inline-flex h-10 items-center gap-[7px] rounded-md px-2.5 text-[14px] font-medium whitespace-nowrap text-ink transition-colors duration-150 hover:bg-paper-2 data-[state=open]:bg-paper-2 [&_svg]:size-5 [&_svg]:shrink-0";

/** Sum of item quantities in the redux cart (same rule the old Navbar used). */
const useCartCount = () =>
  useSelector((state) => {
    const items = state.cart?.items;
    return Array.isArray(items) ? items.reduce((sum, item) => sum + (item?.requestedQuantity || 0), 0) : 0;
  });

function SearchForm({ onSearch }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const inputRef = useRef(null);
  const inputId = useId();

  const submit = (event) => {
    event.preventDefault();
    const q = query.trim();
    if (!q) {
      inputRef.current?.focus();
      return;
    }
    if (onSearch) onSearch(q);
    else navigate(`/categories?q=${encodeURIComponent(q)}`);
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      className={cn(
        "flex h-11 max-w-[760px] min-w-0 flex-1 items-center rounded-md border-[1.5px] border-ink bg-surface pl-3",
        "transition-shadow duration-150 hover:shadow-[0_0_0_2px_rgb(23_21_15/0.08)]",
        "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ring"
      )}
    >
      <Search className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
      <label htmlFor={inputId} className="sr-only">
        Search products, sellers and categories
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search shirts, dresses, sellers…"
        autoComplete="off"
        className="h-full min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[15px] outline-none focus-visible:outline-none"
      />
      <button
        type="submit"
        className="h-full rounded-r-[4px] bg-ink px-[18px] text-[15px] font-semibold text-paper transition-colors duration-150 hover:bg-ink-hover focus-visible:outline-offset-[-4px] focus-visible:outline-paper"
      >
        Search
      </button>
    </form>
  );
}

function AccountMenu() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const auth = useAuthDialog();

  if (!user) {
    // In the storefront frame the modal opens in place; elsewhere (tests, previews) it is a plain link.
    return auth ? (
      <button type="button" onClick={() => auth.open("login")} className={actionClass}>
        <User strokeWidth={1.75} aria-hidden="true" />
        Log in
      </button>
    ) : (
      <Link to="/login" className={actionClass}>
        <User strokeWidth={1.75} aria-hidden="true" />
        Log in
      </Link>
    );
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={actionClass}>
        <User strokeWidth={1.75} aria-hidden="true" />
        Account
        <ChevronDown className="!size-4 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block text-[12.5px] text-muted-foreground">Signed in as</span>
          <span className="block truncate text-[14px] font-semibold text-ink">{user.name || user.email || "Shopper"}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => navigate("/updateprofile")}>
          <UserRound aria-hidden="true" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate("/order-history")}>
          <Package aria-hidden="true" />
          My orders
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout}>
          <LogOut aria-hidden="true" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CategoryRow({ categories: categoriesProp }) {
  const [params] = useSearchParams();
  const { data } = useApiGet(categoriesProp ? null : "/api/product/categories");
  const list = (categoriesProp ?? (Array.isArray(data) ? data : []))
    .map((c) => (typeof c === "string" ? c : c?.name))
    .filter(Boolean);
  const active = (params.get("category") ?? "").toLowerCase();

  return (
    <div className="border-t border-line-soft">
      <Container className="flex h-11 items-center gap-5 xl:gap-[26px]">
        <nav aria-label="Categories" className="flex min-w-0 items-center gap-5 overflow-x-auto xl:gap-[26px]">
          {list.map((name) => {
            const current = active === name.toLowerCase();
            return (
              <Link
                key={name}
                to={`/categories?category=${encodeURIComponent(name)}`}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "border-b-2 border-transparent py-3 text-[14px] font-medium whitespace-nowrap transition-colors duration-150 hover:border-red focus-visible:outline-offset-[-2px]",
                  current && "border-ink font-semibold"
                )}
              >
                {capitalize(name)}
              </Link>
            );
          })}
        </nav>
        <p className="ml-auto hidden items-center gap-[7px] text-[13px] whitespace-nowrap text-muted-foreground xl:inline-flex">
          <Banknote className="size-4" strokeWidth={1.75} aria-hidden="true" />
          Cash on delivery on every order
        </p>
      </Container>
    </div>
  );
}

/**
 * Storefront header (mock-up `.sh`): wordmark, wide search, Account menu, Saved, Cart with count,
 * then the category row with the cash-on-delivery note.
 *
 * Props:
 *  onSearch(q)  optional; default navigates to /categories?q=<q>
 *  categories   optional array of names or {name}; default loads GET /api/product/categories
 *  savedTo      link for "Saved" (default "/saved"); pass null to hide it
 *  showCategories  default true
 *  sticky       pin the header to the top while scrolling (default false)
 */
export default function StoreHeader({
  onSearch,
  categories,
  savedTo = "/saved",
  showCategories = true,
  sticky = false,
  className,
}) {
  const cartCount = useCartCount();

  return (
    <header className={cn("border-b border-line-soft bg-surface", sticky && "sticky top-0 z-40", className)}>
      <Container className="flex items-center gap-6 py-3 xl:gap-7">
        <Logo />
        <SearchForm onSearch={onSearch} />
        <nav aria-label="Account" className="ml-auto flex items-center gap-1.5">
          <AccountMenu />
          {savedTo && (
            <NavLink to={savedTo} className={actionClass}>
              <Heart strokeWidth={1.75} aria-hidden="true" />
              Saved
            </NavLink>
          )}
          <NavLink to="/addtocart" className={actionClass}>
            <ShoppingBag strokeWidth={1.75} aria-hidden="true" />
            Cart
            {cartCount > 0 && (
              <>
                {/* keyed on the count, so the badge bumps whenever the cart changes (reduced motion: no scale) */}
                <motion.span
                  key={cartCount}
                  aria-hidden="true"
                  initial={{ scale: 0.7 }}
                  animate={{ scale: [0.7, 1.18, 1] }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="h-5 min-w-5 rounded-full bg-red px-1.5 text-center font-display text-[13px] leading-5 font-semibold text-white tabular"
                >
                  {cartCount}
                </motion.span>
                <span className="sr-only">
                  , {cartCount} {cartCount === 1 ? "item" : "items"}
                </span>
              </>
            )}
          </NavLink>
        </nav>
      </Container>
      {showCategories && <CategoryRow categories={categories} />}
    </header>
  );
}
