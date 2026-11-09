import { createContext, useContext } from "react";

/**
 * Shopper log in / sign up modal (AuthDialogProvider, mounted by StorefrontLayout).
 *
 *   const auth = useAuthDialog();
 *   auth?.open("login" | "signup", { reason, onSuccess })
 *
 * reason: one line shown under the title ("Log in to add this to your cart.").
 * onSuccess(): runs once the shopper is signed in (e.g. finish the add-to-cart that asked for it).
 * Returns null outside the storefront frame, so callers fall back to navigating to /login.
 */
export const AuthDialogContext = createContext(null);

export const useAuthDialog = () => useContext(AuthDialogContext);
