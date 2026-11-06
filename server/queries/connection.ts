import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    // prepare:false → obligatorio con el pooler de Supabase en modo transaction.
    // max:3 → en serverless cada instancia abre su propio pool; hay que
    // mantenerlo pequeño para no agotar las conexiones del pooler.
    const client = postgres(env.databaseUrl, { prepare: false, max: 3 });
    instance = drizzle(client, { schema: fullSchema });
  }
  return instance;
}
