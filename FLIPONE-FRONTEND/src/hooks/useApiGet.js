import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient, { apiErrorMessage, roleForUrl, selectToken } from "../config/apiClient";

/**
 * GET `url` (with `params`) through the shared TanStack Query cache (src/lib/queryClient.js).
 * Pass `url = null` to skip the request.
 *
 * Coming back to a page shows the cached answer immediately and refreshes it in the background, so lists do
 * not flash back to skeletons and scroll restoration has the full page to return to. Identical requests made
 * at the same time (StrictMode, several components) share one network call.
 *
 * The cache key includes the session the request is sent with, so one account never sees another account's
 * cached answers after a logout and login.
 *
 * Returns { data, loading, error, reload, setData } (same shape as before the cache):
 *  data     the response body, or null
 *  loading  true only while there is nothing to show yet
 *  error    a readable message, or null
 *  reload() fetch again
 *  setData(next | prev => next)  update the cached answer locally (optimistic edits)
 */
export const useApiGet = (url, params) => {
  const paramsKey = JSON.stringify(params ?? null);
  const session = useSelector((state) => (url ? selectToken(state, roleForUrl(url)) : null));
  const queryKey = useMemo(() => ["api", url, paramsKey, session], [url, paramsKey, session]);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => apiClient.get(url, { params: JSON.parse(paramsKey), signal }).then((res) => res.data),
    enabled: Boolean(url),
    // While new params load (e.g. 7 → 30 days), keep showing the last answer for the same URL and session
    // instead of dropping to a skeleton. Never carried across URLs or accounts.
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[1] === url && previousQuery?.queryKey[3] === session ? previous : undefined,
  });

  const { refetch } = query;
  const reload = useCallback(() => {
    refetch();
  }, [refetch]);

  const setData = useCallback(
    (updater) =>
      queryClient.setQueryData(queryKey, (prev) => (typeof updater === "function" ? updater(prev ?? null) : updater)),
    [queryClient, queryKey]
  );

  return {
    data: query.data ?? null,
    loading: Boolean(url) && query.isPending,
    error: query.error ? apiErrorMessage(query.error, "Failed to load data") : null,
    reload,
    setData,
  };
};
