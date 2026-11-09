import { Boxes, LayoutGrid, Package, ReceiptText, Store, Tags, UserRound, Users } from "lucide-react";

/**
 * Default sidebar items for <PortalShell variant="seller">. Routes match src/router/Router.jsx.
 * Item shape: { to, label, icon (lucide component), end? (exact match), also? (extra path prefixes that mark it active) }
 */
export const SELLER_NAV = [
  { to: "/selar_dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/selar_Products", label: "Products", icon: Package, also: ["/updateproduct"] },
  { to: "/orders", label: "Orders", icon: ReceiptText },
];

/** Default sidebar items for <PortalShell variant="admin">. */
export const ADMIN_NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/user_manage", label: "Users", icon: Users, also: ["/admin/allUsers"] },
  { to: "/seller_manage", label: "Sellers", icon: Store },
  { to: "/product_catlog", label: "Products", icon: Boxes },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/order_manage", label: "Orders", icon: ReceiptText },
  { to: "/admin_profile", label: "Profile", icon: UserRound },
];
