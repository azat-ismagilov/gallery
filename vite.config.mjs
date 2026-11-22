import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));
const dataFolder = process.env.VITE_DATA_FOLDER || "data";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@data": path.resolve(rootDir, dataFolder),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
    emptyOutDir: true,
    outDir: process.env.PUBLIC_URL || "dist",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("react")) {
            return "r";
          }
        },
      },
    },
  },
});
