import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { motion } from "motion/react";
import { CircleAlert, Loader2 } from "lucide-react";
import { loginAdmin } from "../../redux/adminSlice";
import { emailSchema } from "../../utils/validation";
import { FormField, Logo, Stamp } from "@/components/flipone";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import PasswordField from "../components/PasswordField";

// Login only checks that both fields are filled; strength rules belong to password creation.
const validationSchema = Yup.object({
  email: emailSchema,
  password: Yup.string().required("Password is required"),
});

const YEAR = new Date().getFullYear();

const BARS = [38, 54, 46, 70, 62, 84, 58, 76, 92, 68, 80, 100];

/** Decorative sketch of the admin dashboard in HTML/CSS: three stat blocks over a bar chart. */
function DashboardSketch() {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="mt-10 rounded-lg border border-paper/12 bg-paper/[0.04] p-4"
    >
      <div className="grid grid-cols-3 gap-2.5">
        {["w-3/5", "w-2/5", "w-1/2"].map((w, i) => (
          <div key={w} className="rounded-md bg-paper/[0.06] px-3 py-2.5">
            <div className="h-1.5 w-1/2 rounded-full bg-paper/20" />
            <div className={cn("mt-2 h-3.5 rounded-sm", i === 0 ? "bg-kraft" : "bg-paper/45", w)} />
          </div>
        ))}
      </div>
      <div className="mt-3 flex h-24 items-end gap-1.5 rounded-md bg-paper/[0.06] px-3 pt-3 pb-2">
        {BARS.map((h, i) => (
          <motion.span
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.03, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: `${h}%`, transformOrigin: "bottom" }}
            className={cn("flex-1 rounded-t-[2px]", i === BARS.length - 1 ? "bg-kraft" : "bg-paper/25")}
          />
        ))}
      </div>
    </motion.div>
  );
}

const Admin_Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.admin);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="grid min-h-screen grid-cols-[minmax(0,5fr)_minmax(0,7fr)] bg-paper text-ink">
      {/* Ink panel: who this page is for */}
      <aside className="flex flex-col bg-ink px-10 py-9 text-[#E9E5DC] xl:px-14 xl:py-11">
        <Logo tone="paper" size="lg" />
        <div className="my-auto max-w-[440px] py-12">
          <Stamp variant="kraft" size="lg">
            Admin
          </Stamp>
          <p className="mt-6 font-display text-[56px] leading-[0.92] font-bold tracking-[-0.005em] text-paper uppercase xl:text-[72px]">
            Run the marketplace.
          </p>
          <DashboardSketch />
        </div>
        <p className="text-[13px] text-[#B9B3A6]">© {YEAR} FlipOne</p>
      </aside>

      {/* Form side */}
      <main id="main" className="flex items-center justify-center px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[420px] rounded-md border border-line-soft bg-surface px-8 pt-8 pb-7"
        >
          <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em]">Admin log in</h1>
          <p className="mt-1.5 text-[14.5px] text-muted-foreground">Use the email and password of your admin account.</p>

          {error && (
            <p
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-md border border-danger/35 bg-danger-tint px-3 py-2.5 text-[14px] text-danger"
            >
              <CircleAlert className="mt-px size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              dispatch(loginAdmin(values));
            }}
          >
            <Form noValidate className="mt-6 grid gap-4">
              <FormField name="email" label="Email" type="email" autoComplete="email" inputMode="email" required />
              <PasswordField name="password" label="Password" autoComplete="current-password" required />
              <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
                {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
                {loading ? "Logging in…" : "Log in"}
              </Button>
            </Form>
          </Formik>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-line-mid pt-4 text-[14px]">
            <span className="text-muted-foreground">
              Selling on FlipOne?{" "}
              <Button asChild variant="link" className="text-[14px]">
                <Link to="/selar_login">Seller log in</Link>
              </Button>
            </span>
            <Button asChild variant="link" className="text-[14px]">
              <Link to="/">Back to the shop</Link>
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Admin_Login;
