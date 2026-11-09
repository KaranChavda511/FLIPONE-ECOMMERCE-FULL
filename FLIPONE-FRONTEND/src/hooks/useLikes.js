import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "@/lib/toast";
import { useAuthDialog } from "@/user/auth/authDialogContext";
import apiClient, { apiErrorMessage } from "../config/apiClient";
import { useApiGet } from "./useApiGet";

const idOf = (product) => String(product?._id ?? product ?? "");

/**
 * The shopper's saved (liked) products.
 *   GET  /api/user/likes                 -> { products: [...] }
 *   POST /api/user/is-liked/:productId   -> { liked: boolean }   (toggles)
 *
 * Returns { products, isLiked(idOrProduct), toggle(product), loading, error, reload }.
 * Guests get an empty list; toggle() opens the log-in modal (or goes to /login outside the storefront frame).
 * The save is not replayed after login: the endpoint toggles, so replaying could un-save an already saved product.
 * The toggle is optimistic and is reconciled with the server's answer (or rolled back on error).
 */
export const useLikes = () => {
  const navigate = useNavigate();
  const auth = useAuthDialog();
  const isLoggedIn = useSelector((state) => Boolean(state.auth.token));
  const { data, loading, error, reload, setData } = useApiGet(isLoggedIn ? "/api/user/likes" : null);

  const products = useMemo(
    () => (isLoggedIn && Array.isArray(data?.products) ? data.products : []),
    [isLoggedIn, data]
  );
  const likedIds = useMemo(() => new Set(products.map(idOf)), [products]);
  const isLiked = useCallback((product) => likedIds.has(idOf(product)), [likedIds]);

  const toggle = useCallback(
    async (product) => {
      if (!isLoggedIn) {
        if (auth) {
          auth.open("login", { reason: `Log in to save ${product?.name ?? "products"} for later.` });
        } else {
          toast.info("Log in to save products");
          navigate("/login");
        }
        return;
      }
      const id = idOf(product);
      if (!id) return;

      const setLiked = (liked) =>
        setData((prev) => {
          const list = Array.isArray(prev?.products) ? prev.products : [];
          const without = list.filter((item) => idOf(item) !== id);
          return { ...(prev ?? {}), products: liked ? [...without, product] : without };
        });

      const wasLiked = likedIds.has(id);
      setLiked(!wasLiked);
      try {
        const { data: result } = await apiClient.post(`/api/user/is-liked/${encodeURIComponent(id)}`);
        const liked = typeof result?.liked === "boolean" ? result.liked : !wasLiked;
        setLiked(liked);
        toast.success(liked ? `Saved ${product?.name ?? "product"}` : `Removed ${product?.name ?? "product"} from saved`);
      } catch (err) {
        setLiked(wasLiked);
        toast.error(apiErrorMessage(err, "Could not update saved products"));
      }
    },
    [auth, isLoggedIn, likedIds, navigate, setData]
  );

  return { products, isLiked, toggle, loading: isLoggedIn && loading, error: isLoggedIn ? error : null, reload };
};
