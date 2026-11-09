import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tailwindSourcesFallback from "./vite.tailwind-sources.js";

export default defineConfig({
  // tailwindSourcesFallback must come before tailwindcss(): see vite.tailwind-sources.js
  plugins: [tailwindSourcesFallback(), react(), tailwindcss()],
  resolve: {
    // "@/components/ui/button" -> src/components/ui/button.jsx (shadcn/ui convention, mirrored in jsconfig.json)
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: {
    // The only chunk over 500 kB is ECharts (tree-shaken core + SVG renderer, ~565 kB / ~193 kB gzip),
    // lazy-loaded on the admin and seller dashboards only (src/components/charts/LazyChart.jsx).
    // 600 keeps that one quiet while still flagging any other chunk that grows past it.
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        // Pages are already lazy chunks (src/router/Router.jsx). Split the shared vendor code into stable,
        // separately cached chunks so no single file crosses the 500 kB warning.
        codeSplitting: {
          groups: [
            { name: "react", test: /node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/ },
            { name: "motion", test: /node_modules[\\/](motion|motion-dom|motion-utils|framer-motion)[\\/]/ },
            { name: "data", test: /node_modules[\\/](axios|@reduxjs|redux|redux-persist|react-redux|immer|reselect|redux-thunk)[\\/]/ },
          ],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{js,jsx}"],
  },
});
