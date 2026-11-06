import { useEffect } from "react";

/**
 * Chat de Relevance AI embebido.
 *
 * Si `VITE_RELEVANCE_EMBED_SNIPPET` está definido (pegar el snippet completo
 * que da Relevance AI en Agent → Share → Chat Widget), este componente lo
 * inyecta en la página y la web usa el chat de Relevance.
 *
 * Si NO está definido, este componente no hace nada y App.tsx renderiza
 * el chat integrado propio (ChatWidget) como respaldo.
 *
 * El snippet se toma de una variable de entorno de build, no de entrada del
 * usuario, por lo que es seguro inyectarlo tal cual.
 */

const snippet = import.meta.env.VITE_RELEVANCE_EMBED_SNIPPET?.trim() ?? "";

export const hasRelevanceChat = snippet.length > 0;

export function RelevanceChatEmbed() {
  useEffect(() => {
    if (!snippet) return;

    // El snippet suele ser una etiqueta <script src="..."></script>.
    // Lo insertamos en el body una sola vez.
    const container = document.createElement("div");
    container.id = "relevance-chat-embed";
    container.innerHTML = snippet;

    // React no ejecuta <script> insertados por innerHTML: hay que
    // recrearlos manualmente.
    const scripts = Array.from(container.querySelectorAll("script"));
    for (const old of scripts) {
      const s = document.createElement("script");
      for (const attr of Array.from(old.attributes)) {
        s.setAttribute(attr.name, attr.value);
      }
      s.textContent = old.textContent;
      document.body.appendChild(s);
    }

    return () => {
      container.remove();
    };
  }, []);

  return null;
}
