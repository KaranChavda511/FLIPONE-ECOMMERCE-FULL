import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Route guard for one of the three sessions. Pick the role with a flag; with no flag it guards a
 * shopper (user) route. This only hides pages: the API still enforces every permission.
 */
const PrivateRouter = ({ children, adminOnly = false, sellerOnly = false }) => {
  const userToken = useSelector((state) => state.auth.token);
  const sellerToken = useSelector((state) => state.seller.sellerInfo?.token);
  const adminToken = useSelector((state) => state.admin.adminInfo?.token);
  const location = useLocation();

  if (adminOnly) return adminToken ? children : <Navigate to="/admin_login" replace />;
  if (sellerOnly) return sellerToken ? children : <Navigate to="/selar_login" replace />;
  // Shoppers log in in a modal over the shop, then come back to the page they asked for.
  return userToken ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

export default PrivateRouter;
