/** "Skip to content" link: hidden until focused, then a paper chip over the top-left corner. */
export default function SkipLink({ href = "#main" }) {
  return (
    <a
      href={href}
      className="sr-only rounded-md bg-ink px-4 py-2.5 text-[14px] font-semibold text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100]"
    >
      Skip to content
    </a>
  );
}
