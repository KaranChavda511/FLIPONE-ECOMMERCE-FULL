import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { MotionConfig } from "motion/react";
import { QueryClientProvider } from "@tanstack/react-query";

// Self-hosted type: Work Sans (body) + Barlow Condensed (wordmark, stamps, MRP numerals). No Google Fonts link.
import "@fontsource/work-sans/400.css";
import "@fontsource/work-sans/500.css";
import "@fontsource/work-sans/600.css";
import "@fontsource/work-sans/700.css";
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { store, persistor } from "./redux/Store.js";
import Router from "./router/Router.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <PersistGate loading={null} persistor={persistor}>
          {/* reducedMotion="user": every Motion animation honours prefers-reduced-motion. */}
          <MotionConfig reducedMotion="user">
            <TooltipProvider>
              <Router />
              {/* App-wide toasts: call toast from "@/lib/toast" (sonner). */}
              <Toaster />
            </TooltipProvider>
          </MotionConfig>
        </PersistGate>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
