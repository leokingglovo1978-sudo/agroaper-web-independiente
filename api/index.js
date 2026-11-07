import { handle } from "@hono/node-server/vercel";
import app from "../dist-server/app.js";

// Función serverless de Vercel: toda la API (/api/trpc/*, /api/log,
// /api/webhooks/relevance) pasa por la app Hono.
//
// Vercel invoca esta función con el formato clásico de Node (req, res),
// que es exactamente lo que espera handle() de @hono/node-server/vercel.
// El rewrite de vercel.json (/api/* -> /api) conserva la ruta original
// en req.url, así que Hono recibe la URL completa sin tocar nada.
//
// Único caso defensivo: si alguna petición llegara sin el prefijo /api,
// se lo volvemos a poner antes de entregarla a Hono.
const handler = handle(app);

export default function (req, res) {
  if (req.url && req.url.startsWith("/") && !req.url.startsWith("/api")) {
    req.url = `/api${req.url}`;
  }
  return handler(req, res);
}
