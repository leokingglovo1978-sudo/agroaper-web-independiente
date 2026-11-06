import devServer from "@hono/vite-dev-server"
import path from "path"
const __dirname = import.meta.dirname
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    devServer({ entry: "api/boot.ts", exclude: [/^\/(?!api\/).*$/] }),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: false, // el manifest vive en public/manifest.webmanifest
      workbox: {
        // Sin navigateFallback: las navegaciones van siempre a red (SPA servida por el backend).
        navigateFallback: null,
        globPatterns: ["assets/*", "icons/*", "images/*"],
      },
    })],
  server: {
    port: 3000,
  },
  ssr: {
    // El driver postgres debe ejecutarse nativamente en Node (sin transformar
    // por el SSR de Vite), si no se corrompe el protocolo en desarrollo.
    external: ["postgres"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./contracts"),
      "@db": path.resolve(__dirname, "./db"),
      "db": path.resolve(__dirname, "./db"),
    },
  },
  envDir: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});
