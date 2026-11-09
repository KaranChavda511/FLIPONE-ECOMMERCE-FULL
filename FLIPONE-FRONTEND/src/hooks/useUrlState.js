import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

const encoders = {
  string: { read: (raw, fallback) => raw ?? fallback, write: (value) => value },
  bool: { read: (raw, fallback) => (raw == null ? fallback : raw === "1"), write: (value) => (value ? "1" : "") },
  number: {
    read: (raw, fallback) => {
      const n = Number(raw);
      return raw != null && raw !== "" && Number.isFinite(n) ? n : fallback;
    },
    write: (value) => String(value),
  },
  list: {
    read: (raw, fallback) => (raw ? raw.split(",").map(decodeURIComponent).filter(Boolean) : fallback),
    write: (value) => (Array.isArray(value) ? value.map(encodeURIComponent).join(",") : ""),
  },
};

const sameValue = (a, b) => (Array.isArray(a) || Array.isArray(b) ? JSON.stringify(a) === JSON.stringify(b) : a === b);

/**
 * useState that lives in the URL query (?key=value), so filters, sort, tabs and pages survive Back/Forward,
 * reloads and shared links.
 *
 *   const [sort, setSort] = useUrlState("sort", "newest");
 *   const [inStock, setInStock] = useUrlState("stock", false, "bool");      // ?stock=1
 *   const [sellers, setSellers] = useUrlState("seller", [], "list");        // ?seller=a,b
 *   const [page, setPage] = useUrlState("page", 1, "number");
 *
 * The default value is left out of the URL. Updates replace the history entry (no Back step per keystroke or
 * click) and keep the scroll position. `resets` lists other keys to clear on change (e.g. page on a new search).
 *
 * Two limits of React Router's setSearchParams to keep in mind:
 *  - Each setter starts from the URL of the last render, so calling two setters in one handler keeps only the
 *    last change. To clear several filters at once use useClearUrlState() (one update).
 *  - Router updates render in a transition, so a text input must not use the URL value as its `value` directly;
 *    keep a local draft and copy it to the URL (see the portal search boxes).
 */
export function useUrlState(key, defaultValue, type = "string", { resets = [] } = {}) {
  const [params, setParams] = useSearchParams();
  const codec = encoders[type] ?? encoders.string;
  const value = codec.read(params.get(key), defaultValue);
  // Serialised so callers can pass literals ([] / {}) without making a new setter every render.
  const defaultKey = JSON.stringify(defaultValue ?? null);
  const resetsKey = resets.join(",");

  const setValue = useCallback(
    (next) => {
      setParams(
        (prev) => {
          const fallback = JSON.parse(defaultKey);
          const current = codec.read(prev.get(key), fallback);
          const resolved = typeof next === "function" ? next(current) : next;
          const out = new URLSearchParams(prev);
          const encoded = codec.write(resolved);
          if (sameValue(resolved, fallback) || encoded === "") out.delete(key);
          else out.set(key, encoded);
          if (resetsKey) resetsKey.split(",").forEach((k) => out.delete(k));
          return out;
        },
        { replace: true, preventScrollReset: true }
      );
    },
    [key, setParams, codec, defaultKey, resetsKey]
  );

  return [value, setValue];
}

/**
 * Returns clear(keys): removes several URL-state keys in ONE update (e.g. a "Clear filters" button), keeping
 * the history entry and the scroll position. Use this instead of calling several useUrlState setters in a row.
 */
export function useClearUrlState() {
  const [, setParams] = useSearchParams();
  return useCallback(
    (keys) =>
      setParams(
        (prev) => {
          const out = new URLSearchParams(prev);
          keys.forEach((k) => out.delete(k));
          return out;
        },
        { replace: true, preventScrollReset: true }
      ),
    [setParams]
  );
}
