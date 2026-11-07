import { handle } from "@hono/node-server/vercel";
import app from "../dist-server/app.js";

// Función serverless de Vercel: toda la API (/api/trpc/*, /api/log,
// /api/webhooks/relevance) pasa por la app Hono.
//
// OJO: en Vercel esta función SOLO recibe la ruta "/api" exacta. Las
// subrutas (/api/trpc/...) se redirigen aquí mediante el rewrite de
// vercel.json, pero pierden el prefijo /api — por eso reconstruimos la
// URL completa (con host) antes de entregar la petición a Hono.
//
// El backend TypeScript se empaqueta en dist-server/app.js durante el build
// (script "vercel-build" de package.json), así que este archivo es JS plano:
// Vercel no lo somete a su type-check de TypeScript.
const handler = handle(app);

export default function (request) {
  const host = request.headers.get("host") || "localhost";
  // request.url puede venir completa (https://...) o solo con la ruta (/trpc/...)
  const url = new URL(request.url, `https://${host}`);
  if (!url.pathname.startsWith("/api/")) {
    url.pathname = `/api${url.pathname}`;
    request = new Request(url, request);
  }
  return handler(request);
}
