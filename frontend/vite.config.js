import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const proxyTarget = process.env.VITE_API_PROXY_TARGET || "http://127.0.0.1:5000";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist"
  },
  server: {
    proxy: {
      "^/(api|export-pdf|save-audio|get-lang|set-language|translate-batch|submit-case|health|static)": {
        target: proxyTarget,
        changeOrigin: true
      }
    }
  }
});
