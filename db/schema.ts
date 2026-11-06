import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

// ---------- Usuarios del panel (login propio, sin servicios externos) ----------

export const userRoleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  passwordHash: text("passwordHash").notNull(),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ---------- Catálogo ----------

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  sortOrder: integer("sortOrder").default(0).notNull(),
});

export type Category = typeof categories.$inferSelect;

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  name: varchar("name", { length: 200 }).notNull(),
  categoryId: integer("categoryId")
    .notNull()
    .references(() => categories.id),
  shortDescription: varchar("shortDescription", { length: 400 }).notNull(),
  description: text("description").notNull(),
  applications: text("applications"), // lista separada por saltos de línea
  specs: text("specs"), // JSON: [{ label, value }]
  image: varchar("image", { length: 512 }).notNull(), // ruta en /images
  gallery: text("gallery"), // JSON: string[] rutas
  isDemo: boolean("isDemo").default(true).notNull(), // contenido provisional
  featured: boolean("featured").default(false).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;

// ---------- Solicitudes de presupuesto ----------

export const requestStatusEnum = pgEnum("request_status", [
  "nuevo",
  "en_revision",
  "pendiente_contactar",
  "contactado",
  "presupuesto_enviado",
  "finalizado",
]);

export const requestSourceEnum = pgEnum("request_source", ["form", "chat"]);

export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  source: requestSourceEnum("source").notNull(),
  status: requestStatusEnum("status").default("nuevo").notNull(),
  nombre: varchar("nombre", { length: 200 }).notNull(),
  telefono: varchar("telefono", { length: 40 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  localidad: varchar("localidad", { length: 160 }),
  provincia: varchar("provincia", { length: 160 }),
  empresa: varchar("empresa", { length: 200 }),
  productId: integer("productId"),
  productName: varchar("productName", { length: 200 }),
  tractorMarca: varchar("tractorMarca", { length: 120 }),
  tractorModelo: varchar("tractorModelo", { length: 120 }),
  potencia: varchar("potencia", { length: 60 }),
  tipoEnganche: varchar("tipoEnganche", { length: 120 }),
  trabajo: varchar("trabajo", { length: 300 }),
  descripcion: text("descripcion"),
  attachmentKey: varchar("attachmentKey", { length: 512 }),
  consentPrivacy: boolean("consentPrivacy").notNull(),
  consentMarketing: boolean("consentMarketing").default(false).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Request = typeof requests.$inferSelect;

export const requestNotes = pgTable("request_notes", {
  id: serial("id").primaryKey(),
  requestId: integer("requestId")
    .notNull()
    .references(() => requests.id),
  authorId: integer("authorId")
    .notNull()
    .references(() => users.id),
  authorName: varchar("authorName", { length: 200 }),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type RequestNote = typeof requestNotes.$inferSelect;

// ---------- Conversaciones del asistente IA ----------

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  visitorName: varchar("visitorName", { length: 200 }),
  requestId: integer("requestId"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;

export const messageRoleEnum = pgEnum("message_role", ["visitor", "assistant"]);

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversationId")
    .notNull()
    .references(() => conversations.id),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
