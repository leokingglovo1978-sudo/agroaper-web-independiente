import type { Context } from "hono";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { getDb } from "../queries/connection";
import { requests } from "@db/schema";
import { env } from "./env";
import { log } from "./logger";

/**
 * Webhook para Relevance AI.
 *
 * El agente de Relevance (configurado con un "tool step" de tipo API call)
 * llama a este endpoint cuando el visitante confirma el envío de su solicitud:
 *
 *   POST /api/webhooks/relevance
 *   Headers:  x-relevance-secret: <RELEVANCE_WEBHOOK_SECRET>
 *   Body:     JSON con los campos de la solicitud (ver esquema abajo)
 *
 * La solicitud se crea en Supabase con source="chat", igual que las del
 * chat integrado, y aparece en el panel de administración.
 */

const payloadSchema = z.object({
  nombre: z.string().trim().min(2).max(200),
  telefono: z.string().trim().min(6).max(40),
  email: z.string().trim().email().max(320),
  localidad: z.string().trim().max(160).optional(),
  provincia: z.string().trim().max(160).optional(),
  empresa: z.string().trim().max(200).optional(),
  productName: z.string().trim().max(200).optional(),
  tractorMarca: z.string().trim().max(120).optional(),
  tractorModelo: z.string().trim().max(120).optional(),
  potencia: z.string().trim().max(60).optional(),
  tipoEnganche: z.string().trim().max(120).optional(),
  trabajo: z.string().trim().max(300).optional(),
  descripcion: z.string().trim().max(4000).optional(),
});

export async function handleRelevanceWebhook(c: Context) {
  // Webhook deshabilitado si no hay secreto configurado.
  if (!env.relevanceWebhookSecret) {
    return c.json({ error: "Not Found" }, 404);
  }
  const secret = c.req.header("x-relevance-secret") ?? "";
  // Comparación en tiempo constante para no filtrar el secreto por timing.
  const a = Buffer.from(secret);
  const b = Buffer.from(env.relevanceWebhookSecret);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    log.warn("relevance webhook: invalid secret", { path: c.req.path });
    return c.json({ error: "Unauthorized" }, 401);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Invalid payload", issues: parsed.error.issues.map((i) => i.path.join(".")) },
      400,
    );
  }

  try {
    const [row] = await getDb()
      .insert(requests)
      .values({
        ...parsed.data,
        source: "chat",
        consentPrivacy: true,
        consentMarketing: false,
      })
      .returning({ id: requests.id });
    log.info("relevance webhook: solicitud creada", { requestId: row.id });
    return c.json({ ok: true, id: row.id });
  } catch (err) {
    log.error("relevance webhook: DB insert failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return c.json({ error: "Internal Server Error" }, 500);
  }
}
