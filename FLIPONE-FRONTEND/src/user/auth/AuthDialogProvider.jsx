import { useCallback, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { Logo } from "@/components/flipone";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { AuthDialogContext } from "./authDialogContext";
import { LoginForm, SignupForm, VerifyEmailForm } from "./AuthForms";

const EASE = [0.22, 1, 0.36, 1];

const MODES = {
  login: {
    tab: "Log in",
    title: "Log in to FlipOne",
    body: "Your cart, saved products and orders, on any device.",
    art: "/illustrations/auth-cart.svg",
  },
  signup: {
    tab: "Create account",
    title: "Create your account",
    body: "One account for every shop on FlipOne.",
    art: "/illustrations/auth-window.svg",
  },
};

const VERIFY_ART = "/illustrations/auth-envelope.svg";

const linkClass =
  "font-semibold text-ink underline decoration-line-mid decoration-[1.5px] underline-offset-[3px] transition-colors hover:decoration-ink";

/** Two-option switch (Radix Tabs) with an ink-on-white thumb that slides between the options. */
function ModeSwitch({ mode }) {
  return (
    <TabsPrimitive.List aria-label="Log in or create an account" className="grid w-full grid-cols-2 rounded-md bg-paper-2 p-1">
      {Object.entries(MODES).map(([key, { tab }]) => (
        <TabsPrimitive.Trigger
          key={key}
          value={key}
          className="relative h-9 rounded-[5px] px-4 text-[14px] font-semibold whitespace-nowrap text-muted-foreground transition-colors duration-200 hover:text-ink focus-visible:outline-offset-0 data-[state=active]:text-ink"
        >
          {mode === key && (
            <motion.span
              layoutId="auth-mode-thumb"
              aria-hidden="true"
              className="absolute inset-0 rounded-[5px] bg-surface shadow-xs"
              transition={{ type: "spring", stiffness: 520, damping: 40 }}
            />
          )}
          <span className="relative">{tab}</span>
        </TabsPrimitive.Trigger>
      ))}
    </TabsPrimitive.List>
  );
}

function FormPane({ children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: EASE }}>
      {children}
    </motion.div>
  );
}

/**
 * Shopper log in / sign up, as a modal over whatever page asked for it (header, Add to cart, Save, and via
 * AuthRedirect the /login and /registration URLs that PrivateRouter sends guests to). Provides useAuthDialog().
 *
 * Steps: log in | create account (tabs) -> "Check your email" (6-digit code) for a new account, or for a login
 * whose email was never confirmed. The code step signs the shopper in and then runs onSuccess.
 */
export default function AuthDialogProvider({ children }) {
  const [{ open: isOpen, mode, reason, verify, draft }, setState] = useState({
    open: false,
    mode: "login",
    reason: null,
    verify: null, // { email, resendIn, from: "signup" | "login" } while the code step is shown
    draft: undefined, // sign-up fields (never the password) to refill "Use a different email"
  });
  const onSuccessRef = useRef(null);

  const open = useCallback((nextMode = "login", { reason: why = null, onSuccess } = {}) => {
    onSuccessRef.current = onSuccess ?? null;
    setState({ open: true, mode: MODES[nextMode] ? nextMode : "login", reason: why, verify: null, draft: undefined });
  }, []);

  const close = useCallback(() => {
    onSuccessRef.current = null;
    setState((s) => ({ ...s, open: false }));
  }, []);

  const done = useCallback(() => {
    const next = onSuccessRef.current;
    onSuccessRef.current = null;
    setState((s) => ({ ...s, open: false }));
    next?.();
  }, []);

  const value = useMemo(() => ({ open, close }), [open, close]);
  const copy = MODES[mode];
  const startVerify = (from) => ({ email, resendIn, draft: typed }) =>
    setState((s) => ({
      ...s,
      verify: { email, resendIn, from },
      draft: typed ? { name: typed.name, email: typed.email, mobile: typed.mobile } : s.draft,
    }));
  // "Use a different email": back to the form it came from, sign-up keeps what was typed.
  const leaveVerify = () => setState((s) => ({ ...s, mode: s.verify?.from ?? "login", verify: null }));
  const art = verify ? VERIFY_ART : copy.art;
  const artKey = verify ? "verify" : mode;

  return (
    <AuthDialogContext.Provider value={value}>
      {children}
      <Dialog open={isOpen} onOpenChange={(next) => !next && close()}>
        <DialogContent
          className="grid max-h-[calc(100dvh-2rem)] w-[min(980px,calc(100vw-2rem))] max-w-none grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-0 overflow-hidden rounded-[10px] border-line-soft p-0 sm:max-w-none"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            event.currentTarget.querySelector("form input")?.focus();
          }}
        >
          {/* Illustration panel */}
          <div className="relative flex min-h-0 flex-col bg-kraft/30 px-8 pt-7 pb-8" aria-hidden="true">
            <Logo to={null} size="sm" />
            <div className="grid flex-1 place-items-center py-6">
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={artKey}
                  src={art}
                  alt=""
                  draggable={false}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.32, ease: EASE }}
                  className="aspect-[4/3] w-full max-w-[400px] object-contain select-none"
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Form panel */}
          <section className="flex min-h-[540px] min-w-0 flex-col overflow-y-auto px-10 pt-8 pb-7">
            {verify ? (
              <FormPane key="verify">
                <DialogTitle className="text-[28px] leading-tight font-semibold tracking-[-0.02em]">Check your email</DialogTitle>
                <DialogDescription className="mt-1.5 text-[14.5px] text-muted-foreground">
                  We sent a 6-digit code to
                  <span className="block truncate font-semibold text-ink" title={verify.email}>
                    {verify.email}
                  </span>
                  It expires in 10 minutes.
                </DialogDescription>
                <div className="mt-7">
                  <VerifyEmailForm email={verify.email} resendIn={verify.resendIn} onDone={done} />
                </div>
                <p className="mt-4 text-[14px] text-muted-foreground">
                  Wrong address?{" "}
                  <button type="button" onClick={leaveVerify} className={linkClass}>
                    Use a different email
                  </button>
                </p>
              </FormPane>
            ) : (
              <TabsPrimitive.Root value={mode} onValueChange={(next) => setState((s) => ({ ...s, mode: next }))}>
                <ModeSwitch mode={mode} />
                <DialogTitle className="mt-7 text-[28px] leading-tight font-semibold tracking-[-0.02em]">{copy.title}</DialogTitle>
                <DialogDescription className="mt-1.5 text-[14.5px] text-muted-foreground">{reason ?? copy.body}</DialogDescription>
                <TabsPrimitive.Content value="login" className="mt-6 focus-visible:outline-none">
                  <FormPane>
                    <LoginForm onDone={done} onVerify={startVerify("login")} />
                    <p className="mt-5 text-center text-[14px] text-muted-foreground">
                      New to FlipOne?{" "}
                      <button
                        type="button"
                        onClick={() => setState((s) => ({ ...s, mode: "signup" }))}
                        className={linkClass}
                      >
                        Create an account
                      </button>
                    </p>
                  </FormPane>
                </TabsPrimitive.Content>
                <TabsPrimitive.Content value="signup" className="mt-6 focus-visible:outline-none">
                  <FormPane>
                    <SignupForm initialValues={draft} onVerify={startVerify("signup")} />
                  </FormPane>
                </TabsPrimitive.Content>
              </TabsPrimitive.Root>
            )}
            <p className="mt-auto pt-6 text-[13.5px] text-muted-foreground">
              Selling on FlipOne?{" "}
              <Link to="/selar_login" onClick={close} className={linkClass}>
                Seller login
              </Link>
            </p>
          </section>
        </DialogContent>
      </Dialog>
    </AuthDialogContext.Provider>
  );
}
