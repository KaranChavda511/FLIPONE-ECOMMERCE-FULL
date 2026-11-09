import { useState } from "react";
import { useField } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { FieldShell } from "@/components/flipone/FormField";
import { Input } from "@/components/ui/input";

/**
 * Formik password field with a show/hide toggle, laid out like FormField (label, 44px control, hint/error).
 * Must be inside <Formik>.
 */
export default function PasswordField({ name, label, hint, required, autoComplete, className, ...controlProps }) {
  const [field, meta] = useField(name);
  const [visible, setVisible] = useState(false);
  const error = meta.touched && meta.error ? meta.error : undefined;

  return (
    <FieldShell label={label} hint={hint} error={error} required={required} className={className}>
      {(control) => (
        <div className="relative">
          <Input
            {...field}
            value={field.value ?? ""}
            {...control}
            {...controlProps}
            type={visible ? "text" : "password"}
            autoComplete={autoComplete}
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            aria-label="Show password"
            aria-pressed={visible}
            aria-controls={control.id}
            className="absolute inset-y-0 right-1 my-auto grid size-9 place-items-center rounded-md text-muted-foreground transition-colors duration-150 ease-(--ease-out-quint) hover:bg-paper-2 hover:text-ink"
          >
            {visible ? (
              <EyeOff className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Eye className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
        </div>
      )}
    </FieldShell>
  );
}
