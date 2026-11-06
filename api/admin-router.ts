import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { asc, desc, eq, like, or, and, sql } from "drizzle-orm";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { requests, requestNotes, conversations, messages } from "@db/schema";
import { storage } from "./lib/storage";

const STATUS_VALUES = [
  "nuevo",
  "en_revision",
  "pendiente_contactar",
  "contactado",
  "presupuesto_enviado",
  "finalizado",
] as const;

export const adminRouter = createRouter({
  stats: adminQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .select({ status: requests.status, count: sql<number>`count(*)` })
      .from(requests)
      .groupBy(requests.status);
    const byStatus: Record<string, number> = {};
    let total = 0;
    for (const r of rows) {
      byStatus[r.status] = Number(r.count);
      total += Number(r.count);
    }
    return { total, byStatus };
  }),

  list: adminQuery
    .input(
      z.object({
        status: z.enum(STATUS_VALUES).optional(),
        search: z.string().max(120).optional(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(5).max(100).default(15),
      }),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.status) conditions.push(eq(requests.status, input.status));
      if (input.search) {
        const term = `%${input.search}%`;
        conditions.push(
          or(
            like(requests.nombre, term),
            like(requests.email, term),
            like(requests.telefono, term),
            like(requests.localidad, term),
            like(requests.provincia, term),
            like(requests.empresa, term),
            like(requests.productName, term),
          ),
        );
      }
      const where = conditions.length ? and(...conditions) : undefined;
      const [items, [{ count }]] = await Promise.all([
        db.query.requests.findMany({
          where,
          orderBy: [desc(requests.createdAt)],
          limit: input.pageSize,
          offset: (input.page - 1) * input.pageSize,
        }),
        db.select({ count: sql<number>`count(*)` }).from(requests).where(where),
      ]);
      return { items, total: Number(count) };
    }),

  detail: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = getDb();
      const request = await db.query.requests.findFirst({
        where: eq(requests.id, input.id),
        with: { product: true, notes: { orderBy: [asc(requestNotes.createdAt)] } },
      });
      if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Solicitud no encontrada." });

      // Conversación del asistente vinculada (si la hay)
      let conversationMessages: Array<{ role: string; content: string; createdAt: Date }> = [];
      const conv = await db.query.conversations.findFirst({
        where: eq(conversations.requestId, request.id),
      });
      if (conv) {
        const msgs = await db.query.messages.findMany({
          where: eq(messages.conversationId, conv.id),
          orderBy: [asc(messages.createdAt), asc(messages.id)],
        });
        conversationMessages = msgs.map((m) => ({
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
        }));
      }

      // URL temporal del adjunto (si existe)
      let attachmentUrl: string | null = null;
      if (request.attachmentKey) {
        try {
          attachmentUrl = (await storage.getPresignedUrl({ key: request.attachmentKey })).url;
        } catch {
          attachmentUrl = null;
        }
      }

      return { request, conversationMessages, attachmentUrl };
    }),

  updateStatus: adminQuery
    .input(z.object({ id: z.number().int().positive(), status: z.enum(STATUS_VALUES) }))
    .mutation(async ({ input }) => {
      await getDb()
        .update(requests)
        .set({ status: input.status })
        .where(eq(requests.id, input.id));
      return { ok: true };
    }),

  addNote: adminQuery
    .input(
      z.object({
        requestId: z.number().int().positive(),
        content: z.string().trim().min(1).max(4000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const exists = await db.query.requests.findFirst({
        where: eq(requests.id, input.requestId),
      });
      if (!exists) throw new TRPCError({ code: "NOT_FOUND", message: "Solicitud no encontrada." });
      await db.insert(requestNotes).values({
        requestId: input.requestId,
        authorId: ctx.user.id,
        authorName: ctx.user.name ?? ctx.user.email ?? "Equipo AGROAPER",
        content: input.content,
      });
      return { ok: true };
    }),

  exportCsv: adminQuery
    .input(
      z.object({
        status: z.enum(STATUS_VALUES).optional(),
        search: z.string().max(120).optional(),
      }),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.status) conditions.push(eq(requests.status, input.status));
      if (input.search) {
        const term = `%${input.search}%`;
        conditions.push(
          or(
            like(requests.nombre, term),
            like(requests.email, term),
            like(requests.telefono, term),
            like(requests.localidad, term),
            like(requests.provincia, term),
            like(requests.empresa, term),
          ),
        );
      }
      const rows = await db.query.requests.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        orderBy: [desc(requests.createdAt)],
        limit: 5000,
      });

      const headers = [
        "ID", "Fecha", "Estado", "Origen", "Nombre", "Teléfono", "Email",
        "Localidad", "Provincia", "Empresa", "Producto", "Marca tractor",
        "Modelo tractor", "Potencia", "Tipo enganche", "Trabajo", "Descripción",
      ];
      const esc = (v: unknown) => {
        const s = v == null ? "" : String(v);
        return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const lines = rows.map((r) =>
        [
          r.id,
          r.createdAt.toISOString(),
          r.status,
          r.source === "chat" ? "Asistente IA" : "Formulario",
          r.nombre, r.telefono, r.email, r.localidad, r.provincia, r.empresa,
          r.productName, r.tractorMarca, r.tractorModelo, r.potencia,
          r.tipoEnganche, r.trabajo, r.descripcion,
        ]
          .map(esc)
          .join(";"),
      );
      return { csv: "﻿" + headers.join(";") + "\n" + lines.join("\n") };
    }),
});
