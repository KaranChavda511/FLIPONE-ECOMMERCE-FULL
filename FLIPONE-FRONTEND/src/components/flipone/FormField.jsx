import { useId } from "react";
import { useField } from "formik";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** Error line under a control: danger colour, alert icon, announced politely. */
export function FieldError({ id, children, className }) {
  if (!children) return null;
  return (
    <p id={id} className={cn("mt-[5px] flex items-start gap-[5px] text-[12.5px] leading-snug text-danger", className)}>
      <CircleAlert className="mt-px size-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

/** Muted help line under a control. */
export function FieldHint({ id, children, className }) {
  if (!children) return null;
  return (
    <p id={id} className={cn("mt-[5px] text-[12.5px] leading-snug text-muted-foreground", className)}>
      {children}
    </p>
  );
}

/**
 * Label + control + hint/error wiring for any control (mock-up `.fld`).
 * `children` is a render function that receives the props to spread on the control:
 *   { id, "aria-invalid", "aria-describedby" }
 *
 *   <FieldShell label="City" error={err} hint="As on your address proof">
 *     {(control) => <Input {...control} value={city} onChange={...} />}
 *   </FieldShell>
 */
export function FieldShell({ label, hint, error, required = false, id: idProp, className, labelClassName, children }) {
  const autoId = useId();
  const id = idProp ?? `f${autoId}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const control = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": [errorId, hintId].filter(Boolean).join(" ") || undefined,
    "aria-required": required || undefined,
  };

  return (
    <div className={cn("flex min-w-0 flex-col", className)} data-invalid={error ? "" : undefined}>
      {label && (
        <Label htmlFor={id} className={cn("mb-1.5", labelClassName)}>
          {label}
          {required && (
            <span aria-hidden="true" className="text-danger">
              *
            </span>
          )}
        </Label>
      )}
      {children(control)}
      <FieldError id={errorId}>{error}</FieldError>
      {!error && <FieldHint id={hintId}>{hint}</FieldHint>}
    </div>
  );
}

/**
 * Formik text field: <FormField name="email" label="Email" type="email" />.
 * Must be inside <Formik>. Shows the error once the field is touched (or after submit).
 * `as="textarea"` renders a Textarea. Extra props go to the control.
 */
export function FormField({ name, label, hint, required, as = "input", className, ...controlProps }) {
  const [field, meta] = useField(name);
  const error = meta.touched && meta.error ? meta.error : undefined;
  const Control = as === "textarea" ? Textarea : Input;

  return (
    <FieldShell label={label} hint={hint} error={error} required={required} className={className}>
      {(control) => <Control {...field} value={field.value ?? ""} {...control} {...controlProps} />}
    </FieldShell>
  );
}

/**
 * Formik select built on shadcn Select: <FormSelectField name="category" label="Category" options={[{value,label}]} />.
 * Options may also be plain strings. `onValueChange(value)` runs after Formik is updated (e.g. to reset a dependent field).
 */
export function FormSelectField({
  name,
  label,
  hint,
  required,
  options = [],
  placeholder = "Select…",
  disabled,
  onValueChange,
  className,
  triggerClassName,
}) {
  const [field, meta, helpers] = useField(name);
  const error = meta.touched && meta.error ? meta.error : undefined;
  const items = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));

  return (
    <FieldShell label={label} hint={hint} error={error} required={required} className={className}>
      {(control) => (
        <Select
          name={name}
          value={field.value ? String(field.value) : ""}
          disabled={disabled}
          onValueChange={(value) => {
            helpers.setValue(value);
            onValueChange?.(value);
          }}
          onOpenChange={(open) => {
            if (!open) helpers.setTouched(true, false);
          }}
        >
          <SelectTrigger {...control} className={cn("w-full", triggerClassName)}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent position="popper">
            {items.map((item) => (
              <SelectItem key={item.value} value={String(item.value)}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FieldShell>
  );
}
