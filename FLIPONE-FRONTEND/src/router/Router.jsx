import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Registration from "../user/auth/registration/Registration";
import Login from "../user/auth/login/Login";
import Mainpage from "../user/pages/mainpage/Mainpage";
import Navbar from "../user/pages/navbar/Navbar";
import Footer from "../user/pages/footer/Footer";
import Contact from "../user/pages/contact/Contact";
import Categories from "../user/pages/categories/Categories";
import Updateprofile from "../user/pages/UpdateProfile/updateprofile";
import OrderSuccess from "../user/pages/order/OrderSuccess";
import Addtocart from "../user/pages/addtocart/Addtocart";
import ProductPage from "../user/pages/productpage/ProductPage";

import Admin_Login from "../admin/pages/Admin_Login";
import Admin from "../admin/Admin";
import User_Manage from "../admin/managements/User_Manage";
import Seller_Manage from "../admin/managements/Seller_Manage";
import Product_Catalog from "../admin/managements/Product_Catlog";
import User_Details from "../admin/managements/User_Details";
import Admin_Profile from "../admin/pages/Admin_Profile";

import Selar_Registrastion from "../selar/auth/registration/Selar_Registrastion";
import Selar_Login from "../selar/auth/login/Selar_Login";
import Selar_Dashboard from "../selar/page/dashboard/Selar_Dashboard";
import Selar_Navbar from "../selar/page/dashboard/Selar_Navbar";
import Selar_Sidebar from "../selar/page/dashboard/Selar_Sidebar";
import Selar_Products from "../selar/page/products/Selar_Products";
import UpdateProduct from "../selar/page/updateProduct/UpdateProduct";
import restoreUserSession from "../../utils/restoreUser";
import Order from "../selar/page/order/Order";
import PrivateRouter from "./PrivateRouter";
import Order_Manage from "../admin/managements/Order_Manage";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import OrderHistoryPage from "../user/pages/order-history/OrderHistoryPage";

const Router = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    restoreUserSession(dispatch);
  }, [dispatch])
  return (  
    <BrowserRouter>
      <Routes>
        {/* Public User Routes */}
        <Route path="/" element={<Mainpage />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mainpage" element={<Mainpage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/navbar" element={<Navbar />} />
        <Route path="/footer" element={<Footer />} />
        <Route path="/addtocart" element={<Addtocart />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/ordersuccess/:orderId" element={<OrderSuccess />} />
        <Route path="/updateproduct" element={<UpdateProduct />} />
        <Route path="/updateprofile" element={<Updateprofile />} />
        <Route path="/order-history" element={<OrderHistoryPage />} />


        {/* Protected User Routes */}
        {/* <Route
          path="/updateprofile"
          element={
            <PrivateRouter userOnly={true}>
              <Updateprofile />
            </PrivateRouter>
          }
        /> */}

        {/* Seller Routes */}
        <Route path="/selar_registrastion" element={<Selar_Registrastion />} />
        <Route path="/selar_navbar" element={<Selar_Navbar />} />
        <Route path="/selar_sidebar" element={<Selar_Sidebar />} />
        <Route path="/selar_Products" element={<Selar_Products />} />
        <Route path="/selar_login" element={<Selar_Login />} />
        <Route path="/selar_dashboard" element={<Selar_Dashboard />} />
        <Route path="/updateproduct/:productId" element={<UpdateProduct />} />
        <Route path="/orders" element={<Order />} />


        {/* Public Admin Route */}
        <Route path="/admin_login" element={<Admin_Login />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRouter adminOnly={true}>
              <Admin />
            </PrivateRouter>
          }
        />
        <Route
          path="/admin_profile"
          element={
            <PrivateRouter adminOnly={true}>
              <Admin_Profile />
            </PrivateRouter>
          }
        />
        <Route
          path="/order_manage"
          element={
            <PrivateRouter adminOnly={true}>
              <Order_Manage />
            </PrivateRouter>
          }
        />
        <Route
          path="/user_manage"
          element={
            <PrivateRouter adminOnly={true}>
              <User_Manage />
            </PrivateRouter>
          }
        />
        <Route
          path="/seller_manage"
          element={
            <PrivateRouter adminOnly={true}>
              <Seller_Manage />
            </PrivateRouter>
          }
        />
        <Route
          path="/product_catlog"
          element={
            <PrivateRouter adminOnly={true}>
              <Product_Catalog />
            </PrivateRouter>
          }
        />
        <Route
          path="/admin/allUsers/:id"
          element={
            <PrivateRouter adminOnly={true}>
              <User_Details />
            </PrivateRouter>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
