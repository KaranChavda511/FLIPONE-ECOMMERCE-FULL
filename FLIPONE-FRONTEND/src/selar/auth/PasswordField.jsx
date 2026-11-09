import { useState } from "react";
import { useField } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FieldShell } from "@/components/flipone";

/** Formik password field with a show/hide toggle inside the control (FieldShell layout). */
export default function PasswordField({ name = "password", label = "Password", hint, autoComplete, className }) {
  const [field, meta] = useField(name);
  const [visible, setVisible] = useState(false);
  const error = meta.touched && meta.error ? meta.error : undefined;

  return (
    <FieldShell label={label} hint={hint} error={error} required className={className}>
      {(control) => (
        <div className="relative">
          <Input
            {...field}
            {...control}
            value={field.value ?? ""}
            type={visible ? "text" : "password"}
            autoComplete={autoComplete}
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground transition-colors duration-150 hover:bg-paper-2 hover:text-ink"
          >
            {visible ? (
              <EyeOff className="size-4.5" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Eye className="size-4.5" strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
        </div>
      )}
    </FieldShell>
  );
}
