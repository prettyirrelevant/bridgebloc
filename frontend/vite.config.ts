import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      process: "process/browser",
      util: "util",
      utils: path.resolve(__dirname, "./src/utils"),
      types: path.resolve(__dirname, "./src/types"),
      hooks: path.resolve(__dirname, "./src/hooks"),
      pages: path.resolve(__dirname, "./src/pages"),
      context: path.resolve(__dirname, "./src/context"),
      helpers: path.resolve(__dirname, "./src/helpers"),
      contracts: path.resolve(__dirname, "./src/contracts"),
      constants: path.resolve(__dirname, "./src/constants"),
      components: path.resolve(__dirname, "./src/components"),
    },
  },
  plugins: [react()],
});
