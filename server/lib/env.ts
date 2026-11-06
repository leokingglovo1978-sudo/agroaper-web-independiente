import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

export const env = {
  isProduction: process.env.NODE_ENV === "production",

  /** PostgreSQL (Supabase) connection string */
  databaseUrl: required("DATABASE_URL"),

  /** Secret used to sign admin session JWTs — any long random string */
  appSecret: required("APP_SECRET"),

  /** Initial admin credentials (used by `npm run db:seed`) */
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",

  /** AI provider (OpenAI-compatible API) — opcional: sin key, el chat queda desactivado */
  aiApiKey: process.env.AI_API_KEY ?? "",
  aiBaseUrl: process.env.AI_BASE_URL ?? "https://api.openai.com/v1",
  aiModel: process.env.AI_MODEL ?? "gpt-4o-mini",

  /** Supabase Storage (for quote-request attachments) */
  supabaseUrl: required("SUPABASE_URL"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  supabaseBucket: process.env.SUPABASE_BUCKET ?? "adjuntos",

  /**
   * Webhook de Relevance AI: secreto compartido que el agente envía en la
   * cabecera `x-relevance-secret` al llamar a POST /api/webhooks/relevance.
   * Si está vacío, el webhook queda deshabilitado (404).
   */
  relevanceWebhookSecret: process.env.RELEVANCE_WEBHOOK_SECRET ?? "",
};
