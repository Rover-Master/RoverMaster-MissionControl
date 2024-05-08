import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { fileURLToPath } from "url";
const webRoot = resolve(
  fileURLToPath(import.meta.url),
  "..",
  "..",
  "dist",
  "web-static"
);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: webRoot,
  },
});
