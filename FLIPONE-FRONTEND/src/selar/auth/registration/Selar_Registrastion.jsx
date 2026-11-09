import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/flipone";
import apiClient, { apiErrorMessage } from "../../../config/apiClient";
import { emailSchema, PASSWORD_HINT, strongPasswordSchema } from "../../../utils/validation";
import SellerAuthLayout from "../SellerAuthLayout";
import PasswordField from "../PasswordField";

const validationSchema = Yup.object({
  name: Yup.string().trim().min(3, "At least 3 characters").max(35, "Must be 35 characters or less").required("Enter your name"),
  email: emailSchema,
  password: strongPasswordSchema,
});

const Selar_Registrastion = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await apiClient.post("/api/seller/signup", values);
      toast.success("Registration successful! Please log in.");
      navigate("/selar_login");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SellerAuthLayout
      title="Open a seller account"
      subtitle="Your shop name is printed on every product tag you list."
      footer={
        <p>
          Already selling on FlipOne?{" "}
          <Link
            to="/selar_login"
            className="rounded-sm font-semibold text-ink underline decoration-line-mid decoration-[1.5px] underline-offset-[3px] hover:decoration-ink"
          >
            Log in
          </Link>
        </p>
      }
    >
      <Formik
        initialValues={{ name: "", email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnBlur={false}
        validateOnChange={false}
      >
        {({ isSubmitting }) => (
          <Form noValidate className="grid gap-4">
            <FormField name="name" label="Shop or seller name" autoComplete="organization" required hint="3 to 35 characters" />
            <FormField name="email" label="Email" type="email" autoComplete="email" required />
            <PasswordField name="password" label="Password" autoComplete="new-password" hint={PASSWORD_HINT} />
            <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2 w-full">
              {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
              {isSubmitting ? "Creating account…" : "Create seller account"}
            </Button>
          </Form>
        )}
      </Formik>
    </SellerAuthLayout>
  );
};

export default Selar_Registrastion;
