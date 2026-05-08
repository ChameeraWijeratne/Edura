import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const apiProxy = {
  "/api": {
    // Use IPv4 loopback — on some Windows setups `localhost` resolves inconsistently for the proxy.
    target: "http://127.0.0.1:4000",
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@internships/catalog": path.join(repoRoot, "server", "data", "internships.json"),
    },
  },
  server: {
    port: 8080,
    fs: {
      // Restrict dev-server file access to only what the client actually needs.
      // Avoids accidentally serving server secrets / data files from the repo root.
      allow: [
        path.join(repoRoot, "client"),
        path.join(repoRoot, "server", "data", "internships.json"),
      ],
    },
    proxy: apiProxy,
  },
  preview: {
    port: 8080,
    proxy: apiProxy,
  },
});
