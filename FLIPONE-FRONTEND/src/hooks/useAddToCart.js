import { useCallback } from "react";
import { useDispatch, useStore } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "@/lib/toast";
import { useAuthDialog } from "@/user/auth/authDialogContext";
import cartService from "../config/cartService";
import { apiErrorMessage } from "../config/apiClient";
import { addToCartAsync, fetchCartItems } from "../redux/cartSlice";

/**
 * Returns addToCart(product, quantity = 1): adds the units and reports the result with a toast. Resolves to true
 * when the item was added.
 *
 * Guests get the log-in modal; once they are signed in, the same add runs by itself, so nobody has to find
 * the product again. (Outside the storefront frame there is no modal, so guests go to /login.)
 *
 * One unit goes through the existing addToCartAsync thunk. More than one unit (product page stepper) uses the
 * same cart endpoint with a quantity (POST /api/cart/addIn accepts it) and then refreshes the cart from the
 * server, so the redux cart stays the single source of truth.
 */
export const useAddToCart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const store = useStore();
  const auth = useAuthDialog();

  // The add itself, for a signed-in shopper.
  const addSignedIn = useCallback(
    async (product, quantity = 1) => {
      const units = Math.max(1, Math.floor(Number(quantity) || 1));
      const label = units > 1 ? `${units} × ${product.name}` : product.name;
      const viewCart = { action: { label: "View cart", onClick: () => navigate("/addtocart") } };

      if (units === 1) {
        const result = await dispatch(addToCartAsync(product));
        if (addToCartAsync.fulfilled.match(result)) {
          toast.success(`${label} added to cart`, viewCart);
          return true;
        }
        toast.error(result.payload || "Could not add to cart");
        return false;
      }

      try {
        await cartService.addToCart(product._id, units);
        await dispatch(fetchCartItems());
        toast.success(`${label} added to cart`, viewCart);
        return true;
      } catch (error) {
        toast.error(apiErrorMessage(error, "Could not add to cart"));
        return false;
      }
    },
    [dispatch, navigate]
  );

  return useCallback(
    async (product, quantity = 1) => {
      // Read the session at call time, not from a render-time snapshot.
      if (store.getState().auth.token) return addSignedIn(product, quantity);
      if (auth) {
        auth.open("login", {
          reason: `Log in to add ${product?.name ?? "this"} to your cart.`,
          onSuccess: () => addSignedIn(product, quantity),
        });
      } else {
        toast.info("Please log in to add items to your cart");
        navigate("/login");
      }
      return false;
    },
    [addSignedIn, auth, navigate, store]
  );
};
