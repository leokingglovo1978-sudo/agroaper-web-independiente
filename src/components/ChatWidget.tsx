import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Bot, RotateCcw } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { trpcClient } from "@/lib/trpc-client";
import { cn } from "@/lib/utils";

type Msg = { role: "visitor" | "assistant"; content: string };

const STORAGE_KEY = "agroaper_chat_id";

/**
 * AGROAPER AI — asistente de recepción. Recoge la necesidad del visitante
 * y prepara la solicitud para el equipo humano. No vende ni presupuesta.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const startMutation = trpc.chat.start.useMutation();
  const sendMutation = trpc.chat.send.useMutation();

  // Al abrir por primera vez: crear o recuperar la conversación
  useEffect(() => {
    if (!open || conversationId !== null || messages.length > 0) return;
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    if (saved) {
      trpcClient.chat.history
        .query({ conversationId: saved })
        .then((res) => {
          // Si la conversación ya no existe en el servidor, empezar de cero
          if (res.messages.length === 0 && !res.completed) {
            localStorage.removeItem(STORAGE_KEY);
            void startConversation();
            return;
          }
          setConversationId(saved);
          setMessages(res.messages);
          setCompleted(res.completed);
        })
        .catch(() => {
          localStorage.removeItem(STORAGE_KEY);
          void startConversation();
        });
    } else {
      void startConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function startConversation() {
    try {
      const res = await startMutation.mutateAsync();
      setConversationId(res.conversationId);
      localStorage.setItem(STORAGE_KEY, String(res.conversationId));
      setMessages([{ role: "assistant", content: res.welcome }]);
    } catch {
      setError("No se ha podido iniciar el asistente. Inténtalo de nuevo.");
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, open]);

  async function send() {
    const text = input.trim();
    if (!text || !conversationId || sending) return;
    setInput("");
    setError(null);
    setMessages((m) => [...m, { role: "visitor", content: text }]);
    setSending(true);
    try {
      const res = await sendMutation.mutateAsync({ conversationId, message: text });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
      if (res.completed) setCompleted(true);
    } catch (err) {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : "No he podido responder. Inténtalo de nuevo.";
      setError(msg);
    } finally {
      setSending(false);
    }
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setConversationId(null);
    setMessages([]);
    setCompleted(false);
    setError(null);
    void startConversation();
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar asistente AGROAPER AI" : "Abrir asistente AGROAPER AI"}
        className={cn(
          "fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full bg-brand-deep text-brand-bright shadow-xl ring-2 ring-brand-bright/40 transition-transform hover:scale-105 active:scale-95",
          open && "ring-brand-orange/60",
        )}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex flex-col bg-brand-cream sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[min(620px,75vh)] sm:w-[400px] sm:overflow-hidden sm:rounded-2xl sm:border sm:border-brand-graphite/15 sm:shadow-2xl"
            role="dialog"
            aria-label="Asistente AGROAPER AI"
          >
            {/* Cabecera */}
            <div className="flex items-center gap-3 bg-brand-deep px-4 py-3.5 text-brand-cream">
              <span className="grid size-10 place-items-center rounded-full bg-brand-bright/15 ring-1 ring-brand-bright/40">
                <Bot className="size-5 text-brand-bright" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-bold uppercase tracking-wide">
                  AGROAPER AI
                </p>
                <p className="truncate text-xs text-brand-cream/70">
                  Asistente de recepción · el equipo humano gestiona tu solicitud
                </p>
              </div>
              <button
                type="button"
                onClick={reset}
                aria-label="Reiniciar conversación"
                className="grid min-h-[44px] min-w-[44px] place-items-center rounded-md text-brand-cream/70 transition-colors hover:text-brand-bright"
              >
                <RotateCcw className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar chat"
                className="grid min-h-[44px] min-w-[44px] place-items-center rounded-md text-brand-cream/70 transition-colors hover:text-brand-bright sm:hidden"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Mensajes */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
                    m.role === "assistant"
                      ? "mr-auto rounded-tl-sm bg-white text-foreground shadow-sm ring-1 ring-brand-graphite/10"
                      : "ml-auto rounded-tr-sm bg-brand-deep text-brand-cream",
                  )}
                >
                  {m.content}
                </div>
              ))}

              {sending && (
                <div className="mr-auto flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm ring-1 ring-brand-graphite/10">
                  <span className="typing-dot size-2 rounded-full bg-brand-deep" />
                  <span className="typing-dot size-2 rounded-full bg-brand-deep" />
                  <span className="typing-dot size-2 rounded-full bg-brand-deep" />
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-brand-orange/40 bg-brand-orange/10 px-4 py-3 text-sm text-foreground">
                  {error}
                </div>
              )}

              {completed && (
                <p className="pt-1 text-center text-xs text-foreground/60">
                  Solicitud registrada. Referencia disponible en el panel del equipo AGROAPER.
                </p>
              )}
            </div>

            {/* Entrada */}
            <form
              className="flex items-end gap-2 border-t border-brand-graphite/10 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                rows={1}
                placeholder={completed ? "Solicitud enviada" : "Escribe tu mensaje…"}
                disabled={!conversationId || completed}
                aria-label="Escribe tu mensaje"
                className="max-h-28 min-h-[44px] flex-1 resize-none rounded-md border border-input bg-background px-3 py-2.5 text-[15px] outline-none focus-visible:outline-[3px] focus-visible:outline-brand-orange disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || sending || !conversationId || completed}
                aria-label="Enviar mensaje"
                className="grid min-h-[44px] min-w-[44px] place-items-center rounded-md bg-brand-orange text-brand-graphite transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="size-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
