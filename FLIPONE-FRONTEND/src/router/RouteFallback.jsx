/**
 * Shown while a lazily loaded page chunk downloads (usually a few ms). Deliberately quiet: it holds the
 * page height on the paper ground so the footer does not jump, and announces the wait to screen readers.
 */
export default function RouteFallback() {
  return (
    <div role="status" aria-live="polite" className="min-h-[60vh] bg-paper">
      <span className="sr-only">Loading page</span>
    </div>
  );
}
