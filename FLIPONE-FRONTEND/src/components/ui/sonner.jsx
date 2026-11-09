import { CircleAlert, CircleCheck, Info, LoaderCircle, TriangleAlert } from "lucide-react";
import { Toaster as Sonner } from "sonner";

/*
 * App-wide toasts (mounted once in main.jsx); call `toast` from "@/lib/toast".
 * One row on an ink surface: a status icon (shape + tone carry the status), the message,
 * an optional quiet action. No floating close button: toasts time out (errors stay longer)
 * and can be swiped away. Styles live in index.css under "sonner toasts".
 */
const ICON = { className: "size-[18px]", strokeWidth: 2, "aria-hidden": true };

const Toaster = (props) => (
  <Sonner
    theme="dark"
    position="bottom-center"
    duration={4000}
    visibleToasts={3}
    gap={8}
    offset={24}
    className="toaster group"
    // sonner sets --width inline (356px); 440px keeps "<product> added to cart" + action on one line.
    style={{ "--width": "440px" }}
    icons={{
      success: <CircleCheck {...ICON} />,
      info: <Info {...ICON} />,
      warning: <TriangleAlert {...ICON} />,
      error: <CircleAlert {...ICON} />,
      loading: <LoaderCircle {...ICON} className="size-[18px] animate-spin" />,
    }}
    toastOptions={{
      classNames: {
        toast: "fo-toast",
        title: "fo-toast-title",
        description: "fo-toast-desc",
        actionButton: "fo-toast-action",
        cancelButton: "fo-toast-cancel",
      },
    }}
    {...props}
  />
);

export { Toaster };
