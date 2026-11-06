import { log } from "./lib/logger";
import app from "./app";

export default app;

// Servidor Node persistente (VPS / Docker / desarrollo de producción local).
// En Vercel NO se ejecuta: allí la entrada es api/index.js, que importa
// directamente server/app.ts.
if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    log.info(`Server running on http://localhost:${port}/`);
  });
}
