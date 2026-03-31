import { defineConfig } from "vite";

export default defineConfig({
  base: "/Zombite/",
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: false
  },
  preview: {
    host: "127.0.0.1",
    port: 4173
  },
  build: {
    // Phaser minified is ~1.5 MB — accepted and documented. Warn above 2 MB.
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/phaser")) {
            return "phaser-vendor";
          }
        }
      }
    }
  }
});
