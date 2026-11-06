import { handle } from "@hono/node-server/vercel";
import app from "../dist-server/app.js";

// Función serverless de Vercel: toda la API (/api/trpc/*, /api/log,
// /api/webhooks/relevance) pasa por la app Hono.
// El backend TypeScript se empaqueta en dist-server/app.js durante el build
// (script "vercel-build" de package.json), así que este archivo es JS plano:
// Vercel no lo somete a su type-check de TypeScript.
export default handle(app);
