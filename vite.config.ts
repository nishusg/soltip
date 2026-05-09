// ============================================================================
// Vite Configuration — vite.config.ts
// ============================================================================
//
// Configuration for the Superchat frontend:
//
//   1. React plugin for JSX/TSX support
//   2. Node.js polyfills for Solana libraries
//      - @solana/web3.js depends on Buffer, crypto, stream, etc.
//      - vite-plugin-node-polyfills provides browser-compatible shims
//   3. Dev server on port 5173 (default)
// ============================================================================

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    react(),
    // Polyfill Node.js built-ins for Solana libraries
    nodePolyfills({
      include: ["buffer", "crypto", "stream", "util", "process", "events"],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  // Suppress Solana library source map warnings
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "SOURCEMAP_ERROR") return;
        warn(warning);
      },
    },
  },
});
