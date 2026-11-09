import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuthDialog } from "./authDialogContext";

/**
 * /login and /registration: shopper log in and sign up are a modal now (AuthDialogProvider). These URLs open
 * it over the shop. `state.from` (set by PrivateRouter) is the page the shopper asked for; they land there once
 * signed in.
 */
export default function AuthRedirect({ mode = "login" }) {
  const auth = useAuthDialog();
  const navigate = useNavigate();
  const location = useLocation();
  const signedIn = useSelector((state) => Boolean(state.auth.token));
  const from = location.state?.from ?? null;

  useEffect(() => {
    if (signedIn || !auth) return;
    auth.open(mode, {
      reason: from ? "Log in to continue to that page." : null,
      onSuccess: from ? () => navigate(from, { replace: true }) : undefined,
    });
    // Open once per visit to the URL; later renders must not reopen it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Navigate to={signedIn && from ? from : "/"} replace />;
}
