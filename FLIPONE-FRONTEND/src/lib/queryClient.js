import { QueryClient } from "@tanstack/react-query";

/**
 * One cache for every GET made through useApiGet (TanStack Query).
 *
 * - staleTime 0: a page you come back to renders at once from the cache, then refreshes quietly in the
 *   background. That is what lets Back return to the same list at the same scroll position.
 * - Only a request that never reached the server is retried (once); a 4xx/5xx answer is shown straight away.
 * - No refetch on window focus: lists do not reshuffle under the pointer when you switch tabs.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => !error?.response && failureCount < 1,
    },
  },
});
