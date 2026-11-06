import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { log } from "./lib/logger";
import { handleClientLog } from "./lib/clientlog";
import { handleRelevanceWebhook } from "./lib/webhook-relevance";
import { REQUEST_ID_HEADER, runWithRequestId } from "./lib/requestcontext";

/**
 * Aplicación Hono pura (sin listen): es la unidad desplegable.
 *  - VPS/Docker: server/boot.ts la sirve con @hono/node-server + estáticos.
 *  - Vercel:     api/index.js la envuelve con @hono/node-server/vercel.
 */

const app = new Hono<{ Bindings: HttpBindings }>();

// Observabilidad: id de correlación por petición + línea de acceso por /api/*.
app.use("*", async (c, next) => {
  const requestId = crypto.randomUUID();
  if (c.req.path === "/api/log") {
    await next();
    return;
  }
  const start = Date.now();
  await runWithRequestId(requestId, async () => {
    await next();
    // El header se pone DESPUÉS de next(): la ruta tRPC entrega una Response
    // cruda con sus propios headers; un c.header() previo se perdería.
    c.res.headers.set(REQUEST_ID_HEADER, requestId);
    if (!c.req.path.startsWith("/api/")) return;
    log.info("request", {
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      durationMs: Date.now() - start,
    });
  });
});

// bodyLimit acotado a la ruta tRPC, NO global: un límite global rompe las
// peticiones sin body en el dev server de Vite.
app.use("/api/trpc/*", bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

// Sink de logs del navegador (ver lib/clientlog.ts). Debe ir antes del
// catch-all 404 de /api/*.
app.post(
  "/api/log",
  bodyLimit({ maxSize: 64 * 1024, onError: (c) => c.body(null, 413) }),
  handleClientLog,
);

// Webhook de Relevance AI: el agente externo llama aquí cuando el visitante
// confirma el envío de su solicitud.
app.post(
  "/api/webhooks/relevance",
  bodyLimit({ maxSize: 256 * 1024, onError: (c) => c.body(null, 413) }),
  handleRelevanceWebhook,
);

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

// Errores no controlados: detalle al log, 500 genérico al cliente.
app.onError((err, c) => {
  log.error("unhandled request error", {
    method: c.req.method,
    path: c.req.path,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
