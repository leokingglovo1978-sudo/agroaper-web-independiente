import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { env } from "../lib/env";

/**
 * Proveedor de IA propio (API OpenAI-compatible).
 * Configurable por variables de entorno:
 *   AI_API_KEY  — tu API key (solo servidor, nunca llega al navegador)
 *   AI_BASE_URL — endpoint, p. ej. https://api.openai.com/v1
 *                 (también vale OpenRouter, Groq, Together, etc.)
 *   AI_MODEL    — id del modelo, p. ej. gpt-4o-mini
 *
 * La instancia se crea de forma perezosa para que importar el módulo
 * no exija las variables (p. ej. en type-checks o scripts).
 */
let _provider: ReturnType<typeof createOpenAICompatible> | undefined;

export function aiProvider() {
  _provider ??= createOpenAICompatible({
    name: "agroaper-ai",
    baseURL: env.aiBaseUrl,
    apiKey: env.aiApiKey,
    includeUsage: true,
    supportsStructuredOutputs: true,
  });
  return _provider;
}

/** Modelo de chat configurado (AI_MODEL). */
export function chatModel() {
  return aiProvider()(env.aiModel);
}
