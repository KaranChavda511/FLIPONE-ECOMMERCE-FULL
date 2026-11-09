import { useId } from "react";
import { useField } from "formik";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError, FieldHint } from "@/components/flipone";
import { capitalize } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MAX_SUBCATEGORIES } from "../lib/seller";

/**
 * Formik checkbox group for `subcategories` (an array of lower-case names).
 * Options are the chosen category's subcategories; without a category it shows a hint instead.
 */
export default function SubcategoryField({ name = "subcategories", options, category, className }) {
  const [field, meta, helpers] = useField(name);
  const id = useId();
  const selected = Array.isArray(field.value) ? field.value : [];
  const error = meta.touched && meta.error ? meta.error : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const hintId = `${id}-hint`;
  const full = selected.length >= MAX_SUBCATEGORIES;

  const toggle = (value, checked) => {
    const next = checked ? [...selected, value] : selected.filter((v) => v !== value);
    helpers.setValue(next);
    helpers.setTouched(true, false);
  };

  return (
    <fieldset
      className={cn("min-w-0", className)}
      aria-describedby={errorId ?? hintId}
      aria-invalid={error ? true : undefined}
    >
      <legend className="mb-1.5 text-[13.5px] leading-tight font-semibold text-ink">
        Subcategories<span aria-hidden="true" className="text-danger">*</span>
      </legend>

      {!category ? (
        <p className="flex h-11 items-center rounded-md border-[1.5px] border-dashed border-line-mid px-3 text-[14px] text-muted-foreground">
          Pick a category first
        </p>
      ) : options.length === 0 ? (
        <p className="flex h-11 items-center rounded-md border-[1.5px] border-dashed border-line-mid px-3 text-[14px] text-muted-foreground">
          This category has no subcategories yet
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {options.map((sub) => {
            const checked = selected.includes(sub);
            const boxId = `${id}-${sub}`;
            return (
              <li key={sub}>
                <label
                  htmlFor={boxId}
                  className={cn(
                    "flex h-9 cursor-pointer items-center gap-2 rounded-md border-[1.5px] px-3 text-[14px] transition-colors duration-150",
                    checked ? "border-ink bg-surface font-medium text-ink" : "border-line-mid bg-surface text-ink-2 hover:border-ink-2",
                    !checked && full && "cursor-not-allowed opacity-60 hover:border-line-mid"
                  )}
                >
                  <Checkbox
                    id={boxId}
                    checked={checked}
                    disabled={!checked && full}
                    onCheckedChange={(value) => toggle(sub, value === true)}
                  />
                  {capitalize(sub)}
                </label>
              </li>
            );
          })}
        </ul>
      )}

      <FieldError id={errorId}>{error}</FieldError>
      {!error && (
        <FieldHint id={hintId}>
          Up to {MAX_SUBCATEGORIES}. The first one is printed on the tag.
        </FieldHint>
      )}
    </fieldset>
  );
}
