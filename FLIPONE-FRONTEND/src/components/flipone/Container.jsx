import { cn } from "@/lib/utils";

/**
 * Page-width container: max 1600px content, centred, 24px gutters (28px from 1280px, as the mock-up).
 * Use inside full-bleed bands so content lines up with the header.
 */
export default function Container({ as: Comp = "div", className, ...props }) {
  return <Comp className={cn("mx-auto w-full max-w-[1648px] px-6 xl:px-7", className)} {...props} />;
}
