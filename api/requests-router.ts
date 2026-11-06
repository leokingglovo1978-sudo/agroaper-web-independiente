import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { requests } from "@db/schema";
import { storage } from "./lib/storage";
import { rateLimit } from "./lib/ratelimit";

const requestInput = z.object({
  nombre: z.string().trim().min(2).max(200),
  telefono: z.string().trim().min(6).max(40),
  email: z.string().trim().email().max(320),
  localidad: z.string().trim().max(160).optional(),
  provincia: z.string().trim().max(160).optional(),
  empresa: z.string().trim().max(200).optional(),
  productId: z.number().int().positive().optional(),
  productName: z.string().trim().max(200).optional(),
  tractorMarca: z.string().trim().max(120).optional(),
  tractorModelo: z.string().trim().max(120).optional(),
  potencia: z.string().trim().max(60).optional(),
  tipoEnganche: z.string().trim().max(120).optional(),
  trabajo: z.string().trim().max(300).optional(),
  descripcion: z.string().trim().max(4000).optional(),
  attachmentKey: z.string().max(512).optional(),
  consentPrivacy: z.literal(true),
  consentMarketing: z.boolean().default(false),
  // Honeypot anti-spam: debe llegar vacío
  website: z.string().max(0).optional(),
});

const ALLOWED_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["application/pdf", "pdf"],
]);
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;

function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon"
  );
}

export const requestsRouter = createRouter({
  /**
   * Subida de archivo adjunto opcional (fotografía del tractor, plano, etc.).
   * Público por diseño (buzón anónimo de solicitudes), con límite de tamaño,
   * tipos restringidos y rate limit. No existe endpoint de borrado público.
   */
  uploadAttachment: publicQuery
    .input(
      z.object({
        name: z.string().trim().min(1).max(200),
        contentBase64: z.string().max(12 * 1024 * 1024), // ~8MB en base64
        contentType: z.string().max(100),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!rateLimit(`upload:${clientIp(ctx.req)}`, 10, 10 * 60 * 1000)) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Demasiados archivos seguidos. Inténtalo de nuevo más tarde.",
        });
      }
      const ext = ALLOWED_TYPES.get(input.contentType);
      if (!ext) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tipo de archivo no permitido. Admite JPG, PNG, WebP o PDF.",
        });
      }
      const bytes = Uint8Array.from(Buffer.from(input.contentBase64, "base64"));
      if (bytes.length > MAX_ATTACHMENT_BYTES) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El archivo supera el máximo de 8 MB.",
        });
      }
      const safeName = input.name.replace(/[^\w.\-áéíóúñü ]/gi, "_").slice(0, 120);
      const saved = await storage.uploadFile({
        fileContent: bytes,
        fileName: `adjuntos/${Date.now()}-${safeName}`,
        contentType: input.contentType,
      });
      return { key: saved.key, size: saved.size };
    }),

  /** Crea una solicitud de presupuesto desde el formulario web. */
  create: publicQuery.input(requestInput).mutation(async ({ ctx, input }) => {
    if (input.website) {
      // Honeypot relleno: bot. Respondemos como si fuera bien sin guardar.
      return { ok: true as const, id: 0 };
    }
    if (!rateLimit(`req:${clientIp(ctx.req)}`, 6, 10 * 60 * 1000)) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Has enviado varias solicitudes seguidas. Inténtalo más tarde.",
      });
    }
    const { website: _ignored, ...data } = input;
    const [row] = await getDb()
      .insert(requests)
      .values({ ...data, source: "form" })
      .returning({ id: requests.id });
    return { ok: true as const, id: row.id };
  }),
});
