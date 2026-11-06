import { handle } from "@hono/node-server/vercel";
import app from "../dist-server/app.js";

// Función serverless de Vercel: toda la API (/api/trpc/*, /api/log,
// /api/webhooks/relevance) pasa por la app Hono.
//
// OJO: en Vercel esta función SOLO recibe la ruta "/api" exacta. Las
// subrutas (/api/trpc/...) caen en el rewrite de la SPA (vercel.json) y
// llegan a /index.html — por eso aquí reescribimos la URL añadiendo el
// prefijo /api antes de entregar la petición a Hono.
//
// El backend TypeScript se empaqueta en dist-server/app.js durante el build
// (script "vercel-build" de package.json), así que este archivo es JS plano:
// Vercel no lo somete a su type-check de TypeScript.
const handler = handle(app);

export default function (request) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/")) {
    const rewritten = new URL(`/api${url.pathname}${url.search}`, url.origin);
    request = new Request(rewritten, request);
  }
  return handler(request);
}
