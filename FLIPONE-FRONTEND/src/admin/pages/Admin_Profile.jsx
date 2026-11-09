import { useId } from "react";
import { useSelector } from "react-redux";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import apiClient, { apiErrorMessage } from "../../config/apiClient";
import { PASSWORD_HINT, STRONG_PASSWORD } from "../../utils/validation";
import { PortalShell, Stamp } from "@/components/flipone";
import { Button } from "@/components/ui/button";
import PasswordField from "../components/PasswordField";
import { ErrorNotice, Panel } from "../components/Panel";

const EMPTY = { oldPassword: "", newPassword: "", confirmPassword: "" };

// Mirrors the backend rule (Validation.js changePassword): old password filled, a strong new password that
// differs from the old one, and a matching confirmation.
const validationSchema = Yup.object({
  oldPassword: Yup.string().required("Enter your current password"),
  newPassword: Yup.string()
    .required("Enter a new password")
    .matches(STRONG_PASSWORD, PASSWORD_HINT)
    .notOneOf([Yup.ref("oldPassword")], "New password must be different from the old password"),
  confirmPassword: Yup.string()
    .required("Confirm the new password")
    .oneOf([Yup.ref("newPassword")], "New password and confirm password do not match"),
});

const Row = ({ label, children }) => (
  <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 border-line-soft px-[18px] py-3 not-first:border-t">
    <dt className="label-caps text-[12.5px] leading-6 text-muted-foreground">{label}</dt>
    <dd className="min-w-0 text-[15px] leading-6 break-words text-ink">{children}</dd>
  </div>
);

const Admin_Profile = () => {
  const accountId = useId();
  const passwordId = useId();
  const adminInfo = useSelector((state) => state.admin.adminInfo);
  const adminName = adminInfo?.name || "Admin";

  const handleChangePassword = async (values, { resetForm, setStatus }) => {
    setStatus(null);
    try {
      await apiClient.patch("/api/admin/change-password", values);
      toast.success("Password changed");
      resetForm({ values: EMPTY });
    } catch (error) {
      setStatus(apiErrorMessage(error, "Password change failed."));
    }
  };

  return (
    <PortalShell variant="admin" title="Profile" subtitle="Your admin account and password.">
      <div className="grid max-w-[1080px] items-start gap-[18px] xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Panel title="Account" titleId={accountId}>
          <dl>
            <Row label="Name">{adminName}</Row>
            {adminInfo?.email && <Row label="Email">{adminInfo.email}</Row>}
            <Row label="Role">
              <Stamp variant="neutral">Admin</Stamp>
            </Row>
          </dl>
        </Panel>

        <Panel title="Change password" titleId={passwordId} bodyClassName="px-[18px] pt-4 pb-5">
          <Formik initialValues={EMPTY} validationSchema={validationSchema} onSubmit={handleChangePassword}>
            {({ isSubmitting, status }) => (
              <Form noValidate className="grid gap-4">
                {status && <ErrorNotice title="Password not changed" message={status} />}
                <PasswordField
                  name="oldPassword"
                  label="Current password"
                  autoComplete="current-password"
                  required
                />
                <PasswordField
                  name="newPassword"
                  label="New password"
                  autoComplete="new-password"
                  hint={`${PASSWORD_HINT}.`}
                  required
                />
                <PasswordField
                  name="confirmPassword"
                  label="Confirm new password"
                  autoComplete="new-password"
                  required
                />
                <div className="pt-1">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="animate-spin" aria-hidden="true" />}
                    {isSubmitting ? "Saving…" : "Change password"}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Panel>
      </div>
    </PortalShell>
  );
};

export default Admin_Profile;
