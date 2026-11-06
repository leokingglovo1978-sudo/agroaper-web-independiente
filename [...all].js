import { handle } from "@hono/node-server/vercel";
import app from "../dist-server/app.js";

// Función serverless CATCH-ALL de Vercel.
// El nombre del archivo ([...all].js) hace que TODAS las rutas /api/*
// (/api/trpc/*, /api/log, /api/webhooks/relevance) lleguen a la app Hono
// con su URL original intacta.
//
// Sin este archivo, Vercel solo enviaba la ruta "/api" exacta a la función
// y el resto (/api/trpc/...) caía en el rewrite de la SPA (index.html):
// la web pedía datos a la API y recibía HTML -> "0 resultados".
export default handle(app);
