import { useState } from "react";
import { useField } from "formik";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldShell } from "@/components/flipone";

/** Formik password field with a show/hide toggle, laid out like FormField. */
export default function PasswordField({ name, label, hint, required, autoComplete = "current-password", className }) {
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
            type={visible ? "text" : "password"}
            autoComplete={autoComplete}
            className="pr-12"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onClick={() => setVisible((v) => !v)}
            className="absolute top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground hover:text-ink"
          >
            {visible ? <EyeOff className="size-[18px]" aria-hidden="true" /> : <Eye className="size-[18px]" aria-hidden="true" />}
          </Button>
        </div>
      )}
    </FieldShell>
  );
}
