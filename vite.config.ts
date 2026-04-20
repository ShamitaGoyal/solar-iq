import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Plain Vite SPA (no TanStack Start / SSR). Output matches `vercel.json` → `dist/client`.
export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths({ projects: ["./tsconfig.json"] })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
    /** Geo JSON / permit extracts are legitimately large; avoid noisy Rollup warnings. */
    chunkSizeWarningLimit: 3600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("three")) return "three";
          if (id.includes("echarts") || id.includes("zrender")) return "echarts";
          if (id.includes("gsap")) return "gsap";
          if (id.includes("recharts")) return "recharts";
          if (id.includes("d3-") || id.includes("topojson")) return "geo";
          return undefined;
        },
      },
    },
  },
});
