import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // This section configures your existing Vitest setup
  // to work with React components and browser APIs
  test: {
    // We switch this to 'jsdom' so we can test React components
    environment: "jsdom",
    globals: true,
    // Updated to include .tsx files for your React tests
    include: ["src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "coverage",
    },
  },

  // Ensures your build output aligns with your package.json versioning
  build: {
    outDir: "dist",
    sourcemap: true,
  },

  server: {
    port: 3000,
    open: true, // Automatically opens the browser on start
  },
});
