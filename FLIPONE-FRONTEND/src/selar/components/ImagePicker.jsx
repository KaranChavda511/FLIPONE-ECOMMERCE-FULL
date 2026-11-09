import { useEffect, useId, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ImagePlus, X } from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { imageUrl } from "@/utils/imageUrl";
import { FieldError, FieldHint } from "@/components/flipone";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGES } from "../lib/seller";

const MAX_BYTES = 5 * 1024 * 1024; // backend multer limit
const fileKey = (file) => `${file.name}-${file.size}-${file.lastModified}`;

/**
 * Product photo picker: saved photos (read-only), new photos with previews and a remove button, and a dashed
 * "Add photos" tile while there is room. Thumbnails are 3:4 like the storefront tag.
 *
 * Props:
 *  files: File[] (new photos, controlled), onChange(files)
 *  existing: saved image paths from the API (count towards the limit)
 *  max: total photos allowed (default 5)
 *  label, error, required, disabled, className
 */
export default function ImagePicker({
  files,
  onChange,
  existing = [],
  max = MAX_IMAGES,
  label = "Photos",
  error,
  required = false,
  disabled = false,
  className,
}) {
  const id = useId();
  const inputId = `${id}-input`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const total = existing.length + files.length;
  const slotsLeft = Math.max(max - total, 0);

  // Object URLs keep the file in memory until revoked, so revoke the old set whenever the files change.
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const handleFiles = (event) => {
    const picked = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = ""; // let the same file be picked again after removing it
    const tooBig = picked.filter((file) => file.size > MAX_BYTES);
    if (tooBig.length) toast.error(`${tooBig.map((f) => f.name).join(", ")} is over 5MB`);
    const known = new Set(files.map(fileKey));
    const ok = picked.filter((file) => file.size <= MAX_BYTES && !known.has(fileKey(file)));
    if (ok.length > slotsLeft) toast.info(`Only ${slotsLeft} more photo${slotsLeft === 1 ? "" : "s"} fit; the rest were left out`);
    if (ok.length && slotsLeft) onChange([...files, ...ok.slice(0, slotsLeft)]);
  };

  const removeAt = (index) => onChange(files.filter((_, i) => i !== index));

  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span id={`${id}-label`} className="text-[13.5px] leading-tight font-semibold text-ink">
          {label}
          {required && (
            <span aria-hidden="true" className="text-danger">
              *
            </span>
          )}
        </span>
        <span className="text-[12.5px] text-muted-foreground tabular">
          {total} of {max}
        </span>
      </div>

      <ul className="grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-2.5" aria-labelledby={`${id}-label`}>
        {existing.map((src, index) => (
          <li key={`saved-${src}`} className="aspect-3/4 overflow-hidden rounded-md border border-line-soft bg-paper-2">
            <img src={imageUrl(src)} alt={`Saved photo ${index + 1}`} className="size-full object-cover" />
          </li>
        ))}
        <AnimatePresence initial={false}>
          {previews.map((src, index) => (
            <motion.li
              key={files[index] ? fileKey(files[index]) : src}
              layout
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-3/4 overflow-hidden rounded-md border-[1.5px] border-ink bg-paper-2"
            >
              <img src={src} alt={`New photo ${index + 1}: ${files[index]?.name ?? ""}`} className="size-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(index)}
                disabled={disabled}
                aria-label={`Remove ${files[index]?.name ?? `photo ${index + 1}`}`}
                className="absolute top-1 right-1 grid size-7 place-items-center rounded-sm bg-surface text-ink transition-colors duration-150 hover:bg-danger-tint hover:text-danger"
              >
                <X className="size-4" strokeWidth={2} aria-hidden="true" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
        {slotsLeft > 0 && (
          <li className="aspect-3/4">
            <label
              htmlFor={inputId}
              className={cn(
                "flex size-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border-[1.5px] border-dashed bg-surface px-1 text-center text-[12.5px] font-medium text-ink-2 transition-colors duration-150",
                "hover:border-ink hover:bg-paper-2 hover:text-ink",
                "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ring",
                error ? "border-danger" : "border-line",
                disabled && "pointer-events-none opacity-60"
              )}
            >
              <ImagePlus className="size-5" strokeWidth={1.75} aria-hidden="true" />
              Add photos
              <input
                id={inputId}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                multiple
                disabled={disabled}
                onChange={handleFiles}
                aria-describedby={error ? errorId : hintId}
                aria-invalid={error ? true : undefined}
                className="sr-only"
              />
            </label>
          </li>
        )}
      </ul>

      {error ? (
        <FieldError id={errorId}>{error}</FieldError>
      ) : (
        <FieldHint id={hintId}>
          {slotsLeft > 0
            ? `JPEG, PNG or WEBP, up to 5MB each. ${slotsLeft} more ${slotsLeft === 1 ? "fits" : "fit"}.`
            : `This product has the maximum of ${max} photos.`}
        </FieldHint>
      )}
    </div>
  );
}
