import { useEffect, useRef, useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { ImageUp, KeyRound } from "lucide-react";
import { toast } from "@/lib/toast";
import { Container, FieldHint, FormField, PageHeader } from "@/components/flipone";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient, { apiErrorMessage } from "../../../config/apiClient";
import { useApiGet } from "../../../hooks/useApiGet";
import { imageUrl } from "../../../utils/imageUrl";
import { PASSWORD_HINT, strongPasswordSchema } from "../../../utils/validation";
import PasswordField from "../../components/PasswordField";
import { LoadError, Panel } from "../../components/StoreBits";

// Email is shown read-only (the backend treats it as immutable), so it is not validated here.
const validationSchema = Yup.object({
  name: Yup.string().trim().min(3, "At least 3 characters").max(35, "Must be 35 characters or less").required("Enter your name"),
  mobile: Yup.string().matches(/^[0-9]{10}$/, "Enter a valid 10-digit number").required("Enter your Mobile Number"),
  // Optional: checkout asks for the delivery address of each order.
  address: Yup.string().trim().max(500, "Keep it under 500 characters"),
});

// Mirrors the backend's changePassword schema (old password, strong new password, matching confirmation).
const passwordSchema = Yup.object({
  oldPassword: Yup.string().required("Enter your current password"),
  newPassword: strongPasswordSchema
    .required("Enter a new password")
    .notOneOf([Yup.ref("oldPassword")], "New password must be different from the old password"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords do not match")
    .required("Confirm the new password"),
});

// Same limits as the backend upload (multer: JPEG/PNG/WEBP, 5 MB).
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";

/** Profile picture: current photo, choose a file (checked against the server's limits), preview, upload. */
function PhotoPanel({ user, onUploaded }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const choose = (event) => {
    const picked = event.target.files?.[0];
    if (!picked) return;
    if (!PHOTO_TYPES.includes(picked.type)) {
      toast.error("Choose a JPEG, PNG or WEBP image.");
      reset();
      return;
    }
    if (picked.size > PHOTO_MAX_BYTES) {
      toast.error("That image is larger than 5 MB.");
      reset();
      return;
    }
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const upload = async () => {
    if (!file) return;
    const body = new FormData();
    body.append("profileImage", file);
    setUploading(true);
    try {
      const { data } = await apiClient.patch("/api/user/profile/picture", body);
      onUploaded(data?.imageUrl);
      toast.success("Profile picture updated");
      reset();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not upload the picture"));
    } finally {
      setUploading(false);
    }
  };

  const current = preview ?? (user?.profilePic ? imageUrl(user.profilePic) : undefined);

  return (
    <Panel title="Photo" bodyClassName="flex flex-col items-center gap-4 px-[18px] py-5">
      <Avatar className="size-32 border border-line-soft">
        {current && <AvatarImage src={current} alt={preview ? "New photo preview" : "Your profile photo"} className="object-cover" />}
        <AvatarFallback className="text-[40px]">{initials(user?.name)}</AvatarFallback>
      </Avatar>
      <div className="text-center">
        <p className="text-[15px] font-semibold">{user?.name}</p>
        <p className="text-[13px] text-muted-foreground">{user?.email}</p>
      </div>
      <input
        ref={inputRef}
        id="profile-photo"
        type="file"
        accept={PHOTO_TYPES.join(",")}
        onChange={choose}
        className="sr-only"
        tabIndex={-1}
        aria-label="Profile photo file"
        aria-describedby="profile-photo-hint"
      />
      <div className="flex w-full flex-col gap-2">
        {file ? (
          <>
            <Button variant="ink" onClick={upload} disabled={uploading}>
              <ImageUp aria-hidden="true" />
              {uploading ? "Uploading…" : "Upload photo"}
            </Button>
            <Button variant="ghost" onClick={reset} disabled={uploading}>
              Cancel
            </Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => inputRef.current?.click()}>
            <ImageUp aria-hidden="true" />
            Choose a photo
          </Button>
        )}
        <FieldHint id="profile-photo-hint" className="text-center">
          {file ? file.name : "JPEG, PNG or WEBP, up to 5 MB."}
        </FieldHint>
      </div>
    </Panel>
  );
}

function ProfileSkeleton() {
  return (
    <div role="status" aria-live="polite" className="grid grid-cols-[280px_minmax(0,1fr)] gap-6">
      <span className="sr-only">Loading profile…</span>
      <Skeleton aria-hidden="true" className="h-80" />
      <div aria-hidden="true" className="flex flex-col gap-4">
        <Skeleton className="h-72" />
        <Skeleton className="h-56" />
      </div>
    </div>
  );
}

const UpdateProfile = () => {
  const navigate = useNavigate();
  const { data, loading, error, reload, setData } = useApiGet("/api/user/profile");
  const userDetails = data?.user;

  const handleSubmit = async ({ name, mobile, address }, { setSubmitting }) => {
    try {
      await apiClient.patch("/api/user/profile", { name, mobile, address });
      toast.success("Profile updated successfully!");
      navigate("/mainpage");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Update failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePassword = async (values, { setSubmitting, resetForm }) => {
    try {
      await apiClient.patch("/api/user/profile/password", values);
      toast.success("Password changed");
      resetForm();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not change the password"));
    } finally {
      setSubmitting(false);
    }
  };

  const setProfilePic = (url) => {
    if (url) setData((prev) => ({ ...(prev ?? {}), user: { ...(prev?.user ?? {}), profilePic: url } }));
  };

  let body;
  if (loading) body = <ProfileSkeleton />;
  else if (error) body = <LoadError title="Could not load your profile" message={error} onRetry={reload} />;
  else
    body = (
      <div className="grid grid-cols-[260px_minmax(0,1fr)] items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <PhotoPanel user={userDetails} onUploaded={setProfilePic} />

        <div className="flex min-w-0 flex-col gap-5">
          <Panel title="Details" description="Used on your orders">
            <Formik
              initialValues={{
                name: userDetails?.name ?? "",
                email: userDetails?.email ?? "",
                mobile: userDetails?.mobile ?? "",
                address: userDetails?.address ?? "",
              }}
              enableReinitialize
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              validateOnBlur={false}
              validateOnChange={false}
            >
              {({ isSubmitting }) => (
                <Form noValidate className="grid grid-cols-2 gap-x-4 gap-y-3.5 px-[18px] pt-4 pb-[18px]">
                  <FormField name="name" label="Full name" autoComplete="name" required />
                  <FormField name="email" label="Email" type="email" disabled hint="Your email can't be changed." />
                  <FormField
                    name="mobile"
                    label="Mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="tel-national"
                    className="[&_input]:tabular"
                    required
                  />
                  <FormField name="address" label="Address (optional)" autoComplete="street-address" className="col-span-full" />
                  <div className="col-span-full flex justify-end pt-1">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving…" : "Save changes"}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </Panel>

          <Panel title="Password" description="You stay logged in after changing it">
            <Formik
              initialValues={{ oldPassword: "", newPassword: "", confirmPassword: "" }}
              validationSchema={passwordSchema}
              onSubmit={handlePassword}
            >
              {({ isSubmitting }) => (
                <Form noValidate className="grid grid-cols-2 gap-x-4 gap-y-3.5 px-[18px] pt-4 pb-[18px]">
                  <PasswordField name="oldPassword" label="Current password" autoComplete="current-password" required className="col-span-full max-w-[calc(50%-0.5rem)]" />
                  <PasswordField name="newPassword" label="New password" autoComplete="new-password" hint={PASSWORD_HINT} required />
                  <PasswordField name="confirmPassword" label="Confirm new password" autoComplete="new-password" required />
                  <div className="col-span-full flex justify-end pt-1">
                    <Button type="submit" variant="ink" disabled={isSubmitting}>
                      <KeyRound aria-hidden="true" />
                      {isSubmitting ? "Changing…" : "Change password"}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </Panel>
        </div>
      </div>
    );

  return (
    <Container className="pt-5 pb-10">
      <div className="mx-auto max-w-[1120px]">
        <PageHeader title="Your profile" className="mb-4" />
        {body}
      </div>
    </Container>
  );
};

export default UpdateProfile;
