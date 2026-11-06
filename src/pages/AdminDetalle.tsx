import { useState } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Loader2, MessageSquareText, Paperclip, Send } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useSeo } from "@/hooks/useSeo";
import { Logo } from "@/components/Logo";
import { Skeleton } from "@/components/ui/skeleton";
import { STATUS_LABEL, StatusBadge } from "./Admin";
import { cn } from "@/lib/utils";

const STATUS_VALUES = Object.keys(STATUS_LABEL);

function Dato({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-foreground/50">{label}</dt>
      <dd className="mt-0.5 text-[15px] text-brand-graphite">{value?.trim() ? value : "—"}</dd>
    </div>
  );
}

export default function AdminDetalle() {
  useSeo("Detalle de solicitud — AGROAPER", "Detalle de solicitud en el panel privado de AGROAPER.");
  const { id } = useParams<{ id: string }>();
  const { user, isLoading } = useAuth({ redirectOnUnauthenticated: true });
  const isAdmin = user?.role === "admin";

  const detail = trpc.admin.detail.useQuery(
    { id: Number(id) },
    { enabled: isAdmin && !!id },
  );
  const utils = trpc.useUtils();
  const updateStatus = trpc.admin.updateStatus.useMutation({
    onSuccess: () => utils.admin.detail.invalidate({ id: Number(id) }),
  });
  const addNote = trpc.admin.addNote.useMutation({
    onSuccess: () => {
      setNote("");
      utils.admin.detail.invalidate({ id: Number(id) });
    },
  });
  const [note, setNote] = useState("");
  const [showChat, setShowChat] = useState(false);

  if (isLoading || (isAdmin && detail.isLoading)) {
    return (
      <div className="min-h-screen bg-brand-cream px-4 py-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const r = detail.data?.request;
  if (!r) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-cream px-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold uppercase text-brand-graphite">
            Solicitud no encontrada
          </h1>
          <Link
            to="/admin"
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-md bg-brand px-5 py-2.5 font-display text-sm font-bold uppercase text-brand-graphite"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="sticky top-0 z-30 border-b border-brand-graphite/10 bg-brand-graphite text-brand-cream">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Volver a la web">
            <Logo light />
          </Link>
          <span className="rounded-full bg-brand-bright/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-bright ring-1 ring-brand-bright/30">
            Panel privado
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/admin"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-foreground/70 transition-colors hover:text-brand-deep"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Todas las solicitudes
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold uppercase text-brand-graphite sm:text-3xl">
              {r.nombre}
            </h1>
            <p className="mt-1 text-sm text-foreground/60">
              Solicitud #{r.id} · {r.source === "chat" ? "Asistente IA" : "Formulario web"} ·{" "}
              {new Date(r.createdAt).toLocaleString("es-ES")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={r.status} />
            <select
              value={r.status}
              onChange={(e) =>
                updateStatus.mutate({ id: r.id, status: e.target.value as never })
              }
              disabled={updateStatus.isPending}
              aria-label="Cambiar estado de la solicitud"
              className="min-h-[44px] rounded-md border border-input bg-white px-3 text-sm font-semibold outline-none focus-visible:outline-[3px] focus-visible:outline-brand-orange"
            >
              {STATUS_VALUES.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Datos de la solicitud */}
          <div className="space-y-6">
            <section className="rounded-xl border border-brand-graphite/10 bg-white p-6 shadow-sm">
              <h2 className="eyebrow text-brand-deep">Datos de contacto</h2>
              <dl className="mt-4 grid gap-5 sm:grid-cols-2">
                <Dato label="Teléfono" value={r.telefono} />
                <Dato label="Correo electrónico" value={r.email} />
                <Dato label="Localidad" value={r.localidad} />
                <Dato label="Provincia" value={r.provincia} />
                <Dato label="Empresa / explotación" value={r.empresa} />
                <Dato label="Publicidad" value={r.consentMarketing ? "Acepta comunicaciones comerciales" : "No acepta comunicaciones"} />
              </dl>
              {detail.data?.attachmentUrl && (
                <a
                  href={detail.data.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-md border-2 border-brand-deep px-4 py-2 text-sm font-semibold text-brand-deep transition-colors hover:bg-brand-deep hover:text-brand-cream"
                >
                  <Paperclip className="size-4" aria-hidden />
                  Ver archivo adjunto
                </a>
              )}
            </section>

            <section className="rounded-xl border border-brand-graphite/10 bg-white p-6 shadow-sm">
              <h2 className="eyebrow text-brand-deep">Tractor y necesidad</h2>
              <dl className="mt-4 grid gap-5 sm:grid-cols-2">
                <Dato label="Apero de interés" value={r.productName} />
                <Dato label="Trabajo a realizar" value={r.trabajo} />
                <Dato label="Marca del tractor" value={r.tractorMarca} />
                <Dato label="Modelo" value={r.tractorModelo} />
                <Dato label="Potencia" value={r.potencia} />
                <Dato label="Tipo de enganche" value={r.tipoEnganche} />
              </dl>
              {r.descripcion && (
                <div className="mt-5 border-t border-brand-graphite/10 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
                    Descripción
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-[15px] text-foreground/80">
                    {r.descripcion}
                  </p>
                </div>
              )}
            </section>

            {/* Conversación del asistente */}
            {detail.data && detail.data.conversationMessages.length > 0 && (
              <section className="rounded-xl border border-brand-graphite/10 bg-white p-6 shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowChat((v) => !v)}
                  aria-expanded={showChat}
                  className="flex min-h-[44px] w-full items-center gap-3 text-left"
                >
                  <MessageSquareText className="size-5 text-brand-deep" aria-hidden />
                  <span className="eyebrow flex-1 text-brand-deep">
                    Conversación del asistente ({detail.data.conversationMessages.length} mensajes)
                  </span>
                  <span className="text-sm font-semibold text-foreground/60">
                    {showChat ? "Ocultar" : "Ver"}
                  </span>
                </button>
                {showChat && (
                  <div className="mt-4 max-h-[480px] space-y-3 overflow-y-auto rounded-lg bg-brand-cream/60 p-4">
                    {detail.data.conversationMessages.map((m, i) => (
                      <div
                        key={i}
                        className={cn(
                          "max-w-[85%] whitespace-pre-wrap rounded-xl px-3.5 py-2 text-sm",
                          m.role === "assistant"
                            ? "mr-auto bg-white ring-1 ring-brand-graphite/10"
                            : "ml-auto bg-brand-deep text-brand-cream",
                        )}
                      >
                        {m.content}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Notas internas */}
          <aside className="rounded-xl border border-brand-graphite/10 bg-white p-6 shadow-sm lg:sticky lg:top-24 lg:self-start">
            <h2 className="eyebrow text-brand-deep">Notas internas</h2>
            <div className="mt-4 space-y-4">
              {r.notes.length === 0 && (
                <p className="text-sm text-foreground/55">
                  Todavía no hay notas. Añade la primera para el equipo.
                </p>
              )}
              {r.notes.map((n) => (
                <div key={n.id} className="rounded-lg bg-brand-cream/70 p-3.5">
                  <p className="whitespace-pre-wrap text-sm text-foreground/85">{n.content}</p>
                  <p className="mt-2 text-xs text-foreground/50">
                    {n.authorName ?? "Equipo"} · {new Date(n.createdAt).toLocaleString("es-ES")}
                  </p>
                </div>
              ))}
            </div>
            <form
              className="mt-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (note.trim()) addNote.mutate({ requestId: r.id, content: note.trim() });
              }}
            >
              <label htmlFor="nota" className="sr-only">Nueva nota interna</label>
              <textarea
                id="nota"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Escribe una nota interna…"
                className="w-full resize-y rounded-md border border-input bg-white px-3.5 py-2.5 text-sm outline-none focus-visible:outline-[3px] focus-visible:outline-brand-orange"
              />
              <button
                type="submit"
                disabled={!note.trim() || addNote.isPending}
                className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-brand-deep px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-brand-cream transition-colors hover:bg-brand-graphite disabled:opacity-50"
              >
                {addNote.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Send className="size-4" aria-hidden />
                )}
                Añadir nota
              </button>
            </form>
          </aside>
        </div>
      </main>
    </div>
  );
}
