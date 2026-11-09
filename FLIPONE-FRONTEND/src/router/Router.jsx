import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
  ScrollRestoration,
} from "react-router-dom";

import StorefrontLayout from "../user/StorefrontLayout";
import PrivateRouter from "./PrivateRouter";
import RouteFallback from "./RouteFallback";
import AuthRedirect from "../user/auth/AuthRedirect";

// Every page is its own chunk (React.lazy); StorefrontLayout stays eager so the header/footer frame paints at once.
const Mainpage = lazy(() => import("../user/pages/mainpage/Mainpage"));
const Contact = lazy(() => import("../user/pages/contact/Contact"));
const Categories = lazy(() => import("../user/pages/categories/Categories"));
const Updateprofile = lazy(
  () => import("../user/pages/UpdateProfile/updateprofile"),
);
const OrderSuccess = lazy(() => import("../user/pages/order/OrderSuccess"));
const Addtocart = lazy(() => import("../user/pages/addtocart/Addtocart"));
const ProductPage = lazy(() => import("../user/pages/productpage/ProductPage"));
const OrderHistoryPage = lazy(
  () => import("../user/pages/order-history/OrderHistoryPage"),
);
const SavedPage = lazy(() => import("../user/pages/saved/SavedPage"));

const Admin_Login = lazy(() => import("../admin/pages/Admin_Login"));
const Admin = lazy(() => import("../admin/Admin"));
const User_Manage = lazy(() => import("../admin/managements/User_Manage"));
const Seller_Manage = lazy(() => import("../admin/managements/Seller_Manage"));
const Product_Catalog = lazy(
  () => import("../admin/managements/Product_Catlog"),
);
const Category_Manage = lazy(
  () => import("../admin/managements/Category_Manage"),
);
const User_Details = lazy(() => import("../admin/managements/User_Details"));
const Order_Manage = lazy(() => import("../admin/managements/Order_Manage"));
const Admin_Profile = lazy(() => import("../admin/pages/Admin_Profile"));

const Selar_Registrastion = lazy(
  () => import("../selar/auth/registration/Selar_Registrastion"),
);
const Selar_Login = lazy(() => import("../selar/auth/login/Selar_Login"));
const Selar_Dashboard = lazy(
  () => import("../selar/page/dashboard/Selar_Dashboard"),
);
const Selar_Products = lazy(
  () => import("../selar/page/products/Selar_Products"),
);
const UpdateProduct = lazy(
  () => import("../selar/page/updateProduct/UpdateProduct"),
);
const Order = lazy(() => import("../selar/page/order/Order"));

const user = (element) => <PrivateRouter>{element}</PrivateRouter>;
const seller = (element) => <PrivateRouter sellerOnly>{element}</PrivateRouter>;
const admin = (element) => <PrivateRouter adminOnly>{element}</PrivateRouter>;

/**
 * Root of every route. ScrollRestoration (data router only): a new page opens at the top, Back/Forward return
 * to the exact scroll position you left (kept per history entry in sessionStorage), and #hash links scroll to
 * their target. Pages that only change the query (filters, sort) opt out via preventScrollReset in useUrlState.
 */
function RootLayout() {
  return (
    <>
      <ScrollRestoration />
      <Suspense fallback={<RouteFallback />}>
        <Outlet />
      </Suspense>
    </>
  );
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      {/* Storefront: one StoreHeader/StoreFooter frame (StorefrontLayout) around every shopper page */}
      <Route element={<StorefrontLayout />}>
        {/* Public shop */}
        <Route path="/" element={<Mainpage />} />
        <Route path="/mainpage" element={<Mainpage />} />
        {/* Shopper log in / sign up are a modal (AuthDialogProvider); these URLs open it over the shop */}
        <Route path="/registration" element={<AuthRedirect mode="signup" />} />
        <Route path="/login" element={<AuthRedirect mode="login" />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/product/:id" element={<ProductPage />} />

        {/* Shopper (logged in) */}
        <Route path="/addtocart" element={user(<Addtocart />)} />
        <Route path="/ordersuccess/:orderId" element={user(<OrderSuccess />)} />
        <Route path="/updateprofile" element={user(<Updateprofile />)} />
        <Route path="/order-history" element={user(<OrderHistoryPage />)} />
        <Route path="/saved" element={user(<SavedPage />)} />
      </Route>

      {/* Seller */}
      <Route path="/selar_registrastion" element={<Selar_Registrastion />} />
      <Route path="/selar_login" element={<Selar_Login />} />
      <Route path="/selar_dashboard" element={seller(<Selar_Dashboard />)} />
      <Route path="/selar_Products" element={seller(<Selar_Products />)} />
      <Route
        path="/updateproduct/:productId"
        element={seller(<UpdateProduct />)}
      />
      <Route path="/orders" element={seller(<Order />)} />

      {/* Admin */}
      <Route path="/admin_login" element={<Admin_Login />} />
      <Route path="/admin" element={admin(<Admin />)} />
      <Route path="/admin_profile" element={admin(<Admin_Profile />)} />
      <Route path="/order_manage" element={admin(<Order_Manage />)} />
      <Route path="/user_manage" element={admin(<User_Manage />)} />
      <Route path="/seller_manage" element={admin(<Seller_Manage />)} />
      <Route path="/product_catlog" element={admin(<Product_Catalog />)} />
      <Route path="/admin/categories" element={admin(<Category_Manage />)} />
      <Route path="/admin/allUsers/:id" element={admin(<User_Details />)} />
    </Route>,
  ),
);

const Router = () => <RouterProvider router={router} />;

export default Router;
