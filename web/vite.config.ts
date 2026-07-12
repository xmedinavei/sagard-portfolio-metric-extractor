/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" makes the built index.html reference its hashed assets with RELATIVE
// URLs (./assets/...), so Flask can serve the bundle from web/dist same-origin with
// no CORS and no assumption about the mount path. See 00-foundations.md §0.3a.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
  },
  // Dev-only convenience: `npm run dev` proxies /api to the local Flask server.
  // The DEMO never uses this — it serves the pre-built bundle (plan §8 de-risk).
  server: {
    proxy: {
      "/api": "http://127.0.0.1:5000",
    },
  },
  // Vitest reads this same file. Phase 1 uses logic-only unit tests over ../lib/grid,
  // so the default "node" environment is enough (no jsdom). Vite ignores this key.
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
