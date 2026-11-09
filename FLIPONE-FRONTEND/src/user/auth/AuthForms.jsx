import { useEffect, useId, useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { toast } from "@/lib/toast";
import { FormField } from "@/components/flipone";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import apiClient, { apiErrorMessage } from "@/config/apiClient";
import { loginUser, signupUser, verifyEmail } from "@/redux/authSlice";
import { emailSchema, PASSWORD_HINT, strongPasswordSchema } from "@/utils/validation";
import PasswordField from "../components/PasswordField";

// Login only checks that both fields are filled; password strength is enforced at signup.
const loginSchema = Yup.object({
  email: Yup.string().trim().email("Enter a valid email").required("Enter your email"),
  password: Yup.string().required("Enter your password"),
});

// No delivery address here: checkout asks for it with each order.
const signupSchema = Yup.object({
  name: Yup.string().trim().min(3, "At least 3 characters").max(35).required("Enter your name"),
  email: emailSchema,
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, "Enter a valid 10-digit number")
    .required("Enter your mobile number"),
  password: strongPasswordSchema,
});

const firstName = (user) => String(user?.name ?? "").trim().split(/\s+/)[0];

/**
 * Email + password. onDone() runs after a successful login. An account whose email is not confirmed yet gets
 * onVerify({ email, resendIn }) instead: the API has just emailed it a code.
 */
export function LoginForm({ initialEmail = "", onDone, onVerify }) {
  const dispatch = useDispatch();

  const submit = async (values, { setSubmitting }) => {
    const result = await dispatch(loginUser(values));
    setSubmitting(false);
    if (loginUser.fulfilled.match(result)) {
      const name = firstName(result.payload.user);
      toast.success(name ? `Welcome back, ${name}` : "You are logged in");
      onDone?.();
    } else if (result.meta?.code === "EMAIL_NOT_VERIFIED" && onVerify) {
      onVerify({ email: result.meta.email ?? values.email, resendIn: result.meta.resendIn });
    } else {
      toast.error(result.payload || "Login failed");
    }
  };

  return (
    <Formik
      initialValues={{ email: initialEmail, password: "" }}
      validationSchema={loginSchema}
      onSubmit={submit}
      enableReinitialize
    >
      {({ isSubmitting }) => (
        <Form noValidate className="flex flex-col gap-4">
          <FormField name="email" label="Email" type="email" autoComplete="email" required />
          <PasswordField name="password" label="Password" autoComplete="current-password" required />
          <Button type="submit" size="lg" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging in…" : "Log in"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}

/** New shopper account. On success the API emails a code: onVerify({ email, resendIn }) opens that step. */
export function SignupForm({ initialValues, onVerify }) {
  const dispatch = useDispatch();

  const submit = async (values, { setSubmitting }) => {
    const result = await dispatch(signupUser(values));
    setSubmitting(false);
    if (signupUser.fulfilled.match(result)) {
      onVerify?.({ ...result.payload, name: values.name, draft: values });
    } else {
      toast.error(result.payload || "Could not create your account");
    }
  };

  return (
    <Formik
      initialValues={{ name: "", email: "", mobile: "", password: "", ...initialValues }}
      validationSchema={signupSchema}
      onSubmit={submit}
    >
      {({ isSubmitting }) => (
        <Form noValidate className="grid grid-cols-2 gap-x-4 gap-y-3.5">
          <FormField name="name" label="Full name" autoComplete="name" required className="col-span-full" />
          <FormField name="email" label="Email" type="email" autoComplete="email" required />
          <FormField
            name="mobile"
            label="Mobile"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            autoComplete="tel-national"
            required
          />
          <PasswordField
            name="password"
            label="Password"
            autoComplete="new-password"
            hint={PASSWORD_HINT}
            required
            className="col-span-full"
          />
          <Button type="submit" size="lg" className="col-span-full mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}

/**
 * The 6-digit code from the confirmation email. Submits by itself on the 6th digit (typed, pasted or autofilled
 * from the email by the OS), counts down to "Send a new code", and shows the API's reason when a code is wrong,
 * expired or locked. onDone() runs once the shopper is signed in.
 */
export function VerifyEmailForm({ email, resendIn = 60, onDone }) {
  const dispatch = useDispatch();
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(resendIn);
  const [sending, setSending] = useState(false);
  const errorId = useId();

  useEffect(() => {
    if (wait <= 0) return undefined;
    const timer = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const submit = async (value = code) => {
    if (value.length !== 6 || busy) return;
    setBusy(true);
    setError(null);
    const result = await dispatch(verifyEmail({ email, code: value }));
    setBusy(false);
    if (verifyEmail.fulfilled.match(result)) {
      const name = firstName(result.payload.user);
      toast.success(name ? `Email confirmed. Welcome to FlipOne, ${name}` : "Email confirmed. Welcome to FlipOne");
      onDone?.();
    } else {
      setError(result.payload || "That code is not right.");
      setCode("");
    }
  };

  const resend = async () => {
    setSending(true);
    try {
      const { data } = await apiClient.post("/api/user/resend-code", { email });
      setWait(data.resendIn ?? 60);
      setError(null);
      setCode("");
      toast.success("A new code is on its way. Check your inbox.");
    } catch (err) {
      const retry = err?.response?.data?.retryAfter;
      if (retry) setWait(retry);
      toast.error(apiErrorMessage(err, "Could not send a new code"));
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <InputOTP
          maxLength={6}
          value={code}
          onChange={(value) => {
            setCode(value);
            if (error) setError(null);
          }}
          onComplete={submit}
          pattern={REGEXP_ONLY_DIGITS}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          disabled={busy}
          aria-label="6-digit code from the email"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        >
          <InputOTPGroup>
            {Array.from({ length: 6 }, (_, index) => (
              <InputOTPSlot key={index} index={index} aria-invalid={error ? true : undefined} />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <p id={errorId} role="alert" className="mt-2 text-[13.5px] text-danger empty:hidden">
          {error}
        </p>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={code.length !== 6 || busy}>
        {busy ? "Checking…" : "Confirm email"}
      </Button>

      <p className="text-[14px] text-muted-foreground">
        Didn&rsquo;t get it? Check spam, or{" "}
        {wait > 0 ? (
          <span className="tabular">send a new code in {wait}s</span>
        ) : (
          <button
            type="button"
            onClick={resend}
            disabled={sending}
            className="font-semibold text-ink underline decoration-line-mid decoration-[1.5px] underline-offset-[3px] transition-colors hover:decoration-ink disabled:opacity-60"
          >
            {sending ? "sending…" : "send a new code"}
          </button>
        )}
        .
      </p>
    </form>
  );
}
