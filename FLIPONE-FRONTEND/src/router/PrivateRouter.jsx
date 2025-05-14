import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PrivateRouter = ({ children, adminOnly = false, sellerOnly = false }) => {
  const userInfo = useSelector((state) => state.user?.user); 
    const sellerInfo = useSelector((state) => state.seller?.sellerInfo);
  const adminInfo = useSelector((state) => state.admin?.adminInfo);

  const isUserLoggedIn = !!userInfo;
    const isSellerLoggedIn = !!sellerInfo?.token;
  const isAdminLoggedIn = !!adminInfo?.token;

  if (adminOnly && !isAdminLoggedIn) {
    return <Navigate to="/admin_login" />;
  }

  if (sellerOnly && !isSellerLoggedIn) {
    return <Navigate to="/selar_login" />;
  }

  if (!adminOnly && !sellerOnly && !isUserLoggedIn) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRouter;
