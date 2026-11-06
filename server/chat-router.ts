import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { generateObject, generateText } from "ai";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { conversations, messages, requests, products } from "@db/schema";
import { chatModel } from "./ai/provider";
import { rateLimit } from "./lib/ratelimit";

export const WELCOME_MESSAGE =
  "¡Hola! Bienvenido a AGROAPER. Somos fabricantes de aperos agrícolas para tractores pequeños y compactos. Estoy aquí para conocer qué necesitas, ayudarte con información básica de nuestros productos y recoger tus datos para que nuestro equipo pueda revisar tu consulta. ¿Qué tipo de trabajo necesitas realizar?";

const SEND_MARKER = "<<<ENVIAR_SOLICITUD>>>";

function buildSystemPrompt(catalog: string): string {
  return `Eres AGROAPER AI, el asistente de recepción de AGROAPER, empresa fabricante de aperos agrícolas para tractores pequeños y compactos, ubicada en Almería (Andalucía, España) y especializada en trabajos bajo invernadero.

TU FUNCIÓN ES EXCLUSIVAMENTE DE RECEPCIÓN: atiendes el primer contacto, entiendes qué necesita el visitante y recoges información para que el equipo humano de AGROAPER gestione después la solicitud. AGROAPER AI recibe; el equipo de AGROAPER gestiona y vende.

CÓMO HABLAR:
- Español de España, tono cercano, profesional y natural. Tutea al visitante.
- Haz preguntas de forma progresiva, una o dos como máximo por mensaje. Nunca muestres una lista de preguntas de golpe.
- Deja que el visitante explique libremente su necesidad; no le obligues a completar datos que no conozca.
- Mensajes breves y claros, como en una conversación de chat.

QUÉ RECOGER (de forma natural, a lo largo de la conversación):
- Datos de contacto: nombre y apellidos, teléfono, correo electrónico, localidad y provincia, empresa o explotación (opcional).
- Tractor: marca, modelo, potencia aproximada y tipo de enganche si lo conoce.
- Necesidad: producto o apero que busca, trabajo a realizar, tipo de explotación, si trabaja dentro de invernadero y observaciones.

CATÁLOGO ACTUAL (productos de demostración del catálogo provisional):
${catalog}

LÍMITES ESTRICTOS — NUNCA:
- Negocies precios, crees ni envíes presupuestos, ofrezcas descuentos.
- Confirmes plazos de fabricación ni fechas de entrega.
- Garantices compatibilidades que no estén documentadas.
- Tomes decisiones técnicas ni comerciales en nombre de AGROAPER.
Si te preguntan por precios, plazos o compatibilidades no documentadas, indica que el equipo de AGROAPER tendrá que revisar esa información con la solicitud.

CUANDO TENGAS SUFICIENTE INFORMACIÓN (al menos nombre, teléfono, email y la necesidad):
1. Presenta un resumen ordenado de los datos recogidos.
2. Pregunta si quiere corregir algo o si desea enviar la solicitud.
3. SOLO cuando el visitante confirme explícitamente que quiere enviarla, responde con un mensaje de despedida breve que termine con la marca exacta ${SEND_MARKER} en una línea aparte. No uses esa marca en ningún otro caso.
4. Si el visitante quiere corregir algo, actualiza el resumen y vuelve a preguntar.`;
}

const extractionSchema = z.object({
  nombre: z.string().describe("Nombre y apellidos del visitante"),
  telefono: z.string().describe("Teléfono de contacto"),
  email: z.string().describe("Correo electrónico"),
  localidad: z.string().optional(),
  provincia: z.string().optional(),
  empresa: z.string().optional(),
  productName: z.string().optional().describe("Apero o producto de interés"),
  tractorMarca: z.string().optional(),
  tractorModelo: z.string().optional(),
  potencia: z.string().optional(),
  tipoEnganche: z.string().optional(),
  trabajo: z.string().optional().describe("Trabajo que necesita realizar"),
  descripcion: z
    .string()
    .describe("Resumen de la necesidad agrícola, tipo de explotación, si trabaja en invernadero y observaciones"),
});

function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon"
  );
}

async function catalogSummary(): Promise<string> {
  const db = getDb();
  const prods = await db.query.products.findMany({
    with: { category: true },
    orderBy: [asc(products.sortOrder)],
  });
  if (!prods.length) return "(catálogo en preparación)";
  return prods
    .map((p) => `- ${p.name} (${p.category?.name ?? "sin categoría"}): ${p.shortDescription}`)
    .join("\n");
}

async function loadHistory(conversationId: number) {
  const rows = await getDb().query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: [asc(messages.createdAt), asc(messages.id)],
    limit: 80,
  });
  return rows;
}

export const chatRouter = createRouter({
  /** Inicia una conversación y devuelve el mensaje de bienvenida. */
  start: publicQuery.mutation(async ({ ctx }) => {
    if (!rateLimit(`chatstart:${clientIp(ctx.req)}`, 10, 10 * 60 * 1000)) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Inténtalo de nuevo más tarde." });
    }
    const db = getDb();
    const [conv] = await db
      .insert(conversations)
      .values({})
      .returning({ id: conversations.id });
    await db.insert(messages).values({
      conversationId: conv.id,
      role: "assistant",
      content: WELCOME_MESSAGE,
    });
    return { conversationId: conv.id, welcome: WELCOME_MESSAGE };
  }),

  /** Envía un mensaje del visitante y devuelve la respuesta del asistente. */
  send: publicQuery
    .input(
      z.object({
        conversationId: z.number().int().positive(),
        message: z.string().trim().min(1).max(2000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!rateLimit(`chat:${clientIp(ctx.req)}`, 30, 10 * 60 * 1000)) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Has enviado muchos mensajes seguidos. Espera un momento, por favor.",
        });
      }
      const db = getDb();
      const conv = await db.query.conversations.findFirst({
        where: eq(conversations.id, input.conversationId),
      });
      if (!conv) throw new TRPCError({ code: "NOT_FOUND", message: "Conversación no encontrada." });
      if (conv.requestId) {
        return {
          reply:
            "Tu solicitud ya está enviada y registrada. El equipo de AGROAPER la revisará. Si necesitas añadir algo más, puedes usar también el formulario de contacto de la web.",
          completed: true,
        };
      }

      await db.insert(messages).values({
        conversationId: input.conversationId,
        role: "visitor",
        content: input.message,
      });

      const history = await loadHistory(input.conversationId);
      const modelMessages = history.map((m) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
        content: m.content,
      }));

      let reply: string;
      try {
        const result = await generateText({
          model: chatModel(),
          system: buildSystemPrompt(await catalogSummary()),
          messages: modelMessages,
          maxOutputTokens: 700,
        });
        reply = result.text.trim();
      } catch (err) {
        console.error("[chat] AI call failed:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No he podido responder ahora mismo. Inténtalo de nuevo en un momento.",
        });
      }

      // ¿El visitante ha confirmado el envío? El asistente marca la respuesta.
      if (reply.includes(SEND_MARKER)) {
        const cleanReply = reply.replace(SEND_MARKER, "").trim();
        const created = await createRequestFromConversation(input.conversationId);
        if (created.ok) {
          const finalReply =
            cleanReply +
            "\n\nSolicitud enviada correctamente. El equipo de AGROAPER revisará tu consulta y estudiará la solución adecuada. ¡Gracias por confiar en nosotros!";
          await db.insert(messages).values({
            conversationId: input.conversationId,
            role: "assistant",
            content: finalReply,
          });
          return { reply: finalReply, completed: true };
        }
        // Faltan datos imprescindibles: pedirlos con naturalidad.
        const askMore =
          "Antes de enviarla me falta algún dato imprescindible: " +
          created.missing.join(", ") +
          ". ¿Me los puedes indicar?";
        await db.insert(messages).values({
          conversationId: input.conversationId,
          role: "assistant",
          content: askMore,
        });
        return { reply: askMore, completed: false };
      }

      await db.insert(messages).values({
        conversationId: input.conversationId,
        role: "assistant",
        content: reply,
      });
      return { reply, completed: false };
    }),

  /** Historial de una conversación (para reabrir el chat en la misma visita). */
  history: publicQuery
    .input(z.object({ conversationId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const rows = await loadHistory(input.conversationId);
      const conv = await getDb().query.conversations.findFirst({
        where: eq(conversations.id, input.conversationId),
      });
      return {
        messages: rows.map((m) => ({ role: m.role, content: m.content })),
        completed: Boolean(conv?.requestId),
      };
    }),
});

/** Extrae los datos de la conversación y crea la solicitud (estado: nuevo). */
async function createRequestFromConversation(
  conversationId: number,
): Promise<{ ok: true } | { ok: false; missing: string[] }> {
  const db = getDb();
  const history = await loadHistory(conversationId);
  const transcript = history
    .map((m) => `${m.role === "assistant" ? "Asistente" : "Visitante"}: ${m.content}`)
    .join("\n");

  let data: z.infer<typeof extractionSchema>;
  try {
    const result = await generateObject({
      model: chatModel(),
      schema: extractionSchema,
      prompt:
        "Extrae de esta conversación los datos de la solicitud del visitante. Si un dato no aparece, déjalo vacío. No inventes ningún dato.\n\n" +
        transcript,
    });
    data = result.object;
  } catch {
    return { ok: false, missing: ["nombre", "teléfono", "correo electrónico"] };
  }

  const missing: string[] = [];
  if (!data.nombre?.trim()) missing.push("nombre y apellidos");
  if (!data.telefono?.trim()) missing.push("teléfono");
  if (!data.email?.trim() || !data.email.includes("@")) missing.push("correo electrónico");
  if (missing.length) return { ok: false, missing };

  const [row] = await db
    .insert(requests)
    .values({
      source: "chat",
      nombre: data.nombre.trim(),
      telefono: data.telefono.trim(),
      email: data.email.trim(),
      localidad: data.localidad || null,
      provincia: data.provincia || null,
      empresa: data.empresa || null,
      productName: data.productName || null,
      tractorMarca: data.tractorMarca || null,
      tractorModelo: data.tractorModelo || null,
      potencia: data.potencia || null,
      tipoEnganche: data.tipoEnganche || null,
      trabajo: data.trabajo || null,
      descripcion: data.descripcion || null,
      consentPrivacy: true,
      consentMarketing: false,
    })
    .returning({ id: requests.id });

  await db
    .update(conversations)
    .set({ requestId: row.id, visitorName: data.nombre.trim() })
    .where(eq(conversations.id, conversationId));

  return { ok: true };
}
