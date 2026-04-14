import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Ensures your build output aligns with your package.json versioning
  build: {
    outDir: "dist",
    sourcemap: true,
  },

  server: {
    port: 3000,
    open: false,
  },
});
