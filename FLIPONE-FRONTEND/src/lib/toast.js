/*
 * App toasts. `<Toaster />` (src/components/ui/sonner.jsx) is mounted once in main.jsx.
 *
 *   import { toast } from "@/lib/toast";
 *   toast.success("Added to cart", { action: { label: "View cart", onClick } });
 *   toast.error("Could not add to cart", { description: message });
 *   toast.info("Please log in to add items to your cart");
 *
 * Errors stay up longer (6s) than the 4s default, since there is no close button.
 */
import { toast as sonner } from "sonner";

const ERROR_DURATION = 6000;

export const toast = Object.assign((...args) => sonner(...args), sonner, {
  error: (message, options) => sonner.error(message, { duration: ERROR_DURATION, ...options }),
});
