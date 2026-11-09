import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/flipone";
import { loginSeller } from "../../../redux/sellarSlice";
import { emailSchema } from "../../../utils/validation";
import SellerAuthLayout from "../SellerAuthLayout";
import PasswordField from "../PasswordField";

// Login only checks that both fields are filled; password strength is enforced at signup.
const validationSchema = Yup.object({
  email: emailSchema,
  password: Yup.string().required("Enter your Password"),
});

const Selar_Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.seller);

  const handleSubmit = async (values, { setSubmitting }) => {
    const resultAction = await dispatch(loginSeller(values));
    setSubmitting(false);
    if (loginSeller.fulfilled.match(resultAction)) {
      toast.success("Login successful!");
      navigate("/selar_dashboard");
    } else {
      toast.error(resultAction.payload || "Login failed");
    }
  };

  return (
    <SellerAuthLayout
      title="Seller log in"
      subtitle="Manage your products, stock and order items."
      footer={
        <p>
          New to selling on FlipOne?{" "}
          <Link
            to="/selar_registrastion"
            className="rounded-sm font-semibold text-ink underline decoration-line-mid decoration-[1.5px] underline-offset-[3px] hover:decoration-ink"
          >
            Open a seller account
          </Link>
        </p>
      }
    >
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnBlur={false}
        validateOnChange={false}
      >
        <Form noValidate className="grid gap-4">
          <FormField name="email" label="Email" type="email" autoComplete="email" required />
          <PasswordField name="password" label="Password" autoComplete="current-password" />
          <Button type="submit" size="lg" disabled={loading} className="mt-2 w-full">
            {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
            {loading ? "Logging in…" : "Log in"}
          </Button>
        </Form>
      </Formik>
    </SellerAuthLayout>
  );
};

export default Selar_Login;
