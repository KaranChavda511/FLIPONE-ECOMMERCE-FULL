export const PLACEHOLDER_IMAGE = "/18505047_SL-070720-32260-21.svg";

/**
 * Turns an image value from the API into a URL the browser can load.
 * Product/order images come back as relative "/uploads/x.png" paths (sometimes inside an array);
 * profile pictures come back absolute. Absolute, blob: and data: URLs pass through unchanged.
 */
export const imageUrl = (
  value,
  base = import.meta.env.VITE_BASE_URL ?? "",
  fallback = PLACEHOLDER_IMAGE
) => {
  const path = Array.isArray(value) ? value[0] : value;
  if (!path || typeof path !== "string") return fallback;
  if (/^(https?:|blob:|data:)/i.test(path)) return path;
  const trimmedBase = base.replace(/\/+$/, "");
  return `${trimmedBase}${path.startsWith("/") ? path : `/${path}`}`;
};
