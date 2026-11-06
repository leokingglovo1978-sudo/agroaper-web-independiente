import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Search,
  Download,
  LogOut,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { trpcClient } from "@/lib/trpc-client";
import { useAuth } from "@/hooks/useAuth";
import { useSeo } from "@/hooks/useSeo";
import { Logo } from "@/components/Logo";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const STATUS = [
  { value: "nuevo", label: "Nuevo" },
  { value: "en_revision", label: "En revisión" },
  { value: "pendiente_contactar", label: "Pendiente de contactar" },
  { value: "contactado", label: "Contactado" },
  { value: "presupuesto_enviado", label: "Presupuesto enviado" },
  { value: "finalizado", label: "Finalizado" },
] as const;

export const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  STATUS.map((s) => [s.value, s.label]),
);

export const STATUS_STYLE: Record<string, string> = {
  nuevo: "bg-brand-orange/15 text-[#9A5B12] ring-brand-orange/40",
  en_revision: "bg-amber-100 text-amber-800 ring-amber-300",
  pendiente_contactar: "bg-sky-100 text-sky-800 ring-sky-300",
  contactado: "bg-brand/15 text-brand-deep ring-brand/40",
  presupuesto_enviado: "bg-brand-deep/10 text-brand-deep ring-brand-deep/30",
  finalizado: "bg-brand-graphite/10 text-brand-graphite ring-brand-graphite/25",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        STATUS_STYLE[status] ?? "bg-gray-100 text-gray-700 ring-gray-300",
      )}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export default function Admin() {
  useSeo("Panel de administración — AGROAPER", "Panel privado de gestión de solicitudes de AGROAPER.");
  const { user, isLoading, logout } = useAuth({ redirectOnUnauthenticated: true });
  const navigate = useNavigate();

  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const isAdmin = user?.role === "admin";
  const list = trpc.admin.list.useQuery(
    { status: (status || undefined) as never, search: search || undefined, page },
    { enabled: isAdmin },
  );
  const stats = trpc.admin.stats.useQuery(undefined, { enabled: isAdmin });

  function exportCsv() {
    trpcClient.admin.exportCsv
      .query({ status: (status || undefined) as never, search: search || undefined })
      .then(({ csv }) => {
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `solicitudes-agroaper-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
  }

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-cream">
        <Loader2 className="size-8 animate-spin text-brand-deep" aria-label="Cargando" />
      </div>
    );
  }

  if (user && !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-brand-cream px-4">
        <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
          <Logo />
          <h1 className="mt-6 font-display text-xl font-bold uppercase text-brand-graphite">
            Acceso restringido
          </h1>
          <p className="mt-3 text-sm text-foreground/70">
            Tu cuenta no tiene permisos de administración. El panel es privado y
            solo es accesible para el equipo de AGROAPER.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex min-h-[44px] items-center rounded-md bg-brand px-5 py-2.5 font-display text-sm font-bold uppercase text-brand-graphite"
          >
            Volver a la web
          </Link>
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil((list.data?.total ?? 0) / 15));

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Barra superior del panel */}
      <header className="sticky top-0 z-30 border-b border-brand-graphite/10 bg-brand-graphite text-brand-cream">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" aria-label="Volver a la web">
              <Logo light />
            </Link>
            <span className="hidden rounded-full bg-brand-bright/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-bright ring-1 ring-brand-bright/30 sm:inline">
              Panel privado
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-brand-cream/70 sm:block">{user?.name ?? user?.email}</span>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-brand-cream/80 transition-colors hover:text-brand-bright"
            >
              <LogOut className="size-4" aria-hidden />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold uppercase text-brand-graphite sm:text-3xl">
              Solicitudes
            </h1>
            <p className="mt-1 text-sm text-foreground/60">
              {stats.data ? `${stats.data.total} solicitudes en total` : "Cargando…"}
            </p>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-brand-deep px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-brand-cream transition-colors hover:bg-brand-graphite"
          >
            <Download className="size-4" aria-hidden />
            Exportar CSV
          </button>
        </div>

        {/* Filtros */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <form
            className="relative flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(searchInput.trim());
              setPage(1);
            }}
          >
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-foreground/50" aria-hidden />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre, email, teléfono, localidad…"
              aria-label="Buscar solicitudes"
              className="min-h-[48px] w-full rounded-md border border-input bg-white pl-11 pr-4 text-[15px] outline-none focus-visible:outline-[3px] focus-visible:outline-brand-orange"
            />
          </form>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setStatus(""); setPage(1); }}
              className={cn(
                "min-h-[40px] rounded-full border px-4 text-sm font-semibold transition-colors",
                !status ? "border-brand-deep bg-brand-deep text-brand-cream" : "border-brand-graphite/20 bg-white text-foreground/70 hover:border-brand-deep",
              )}
            >
              Todas
            </button>
            {STATUS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => { setStatus(s.value); setPage(1); }}
                className={cn(
                  "min-h-[40px] rounded-full border px-4 text-sm font-semibold transition-colors",
                  status === s.value
                    ? "border-brand-deep bg-brand-deep text-brand-cream"
                    : "border-brand-graphite/20 bg-white text-foreground/70 hover:border-brand-deep",
                )}
              >
                {s.label}
                {stats.data?.byStatus[s.value] ? ` (${stats.data.byStatus[s.value]})` : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla */}
        <div className="mt-6 overflow-hidden rounded-xl border border-brand-graphite/10 bg-white shadow-sm">
          {list.isLoading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : list.data?.items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <Inbox className="size-10 text-brand-deep" aria-hidden />
              <p className="font-display text-lg font-bold uppercase text-brand-graphite">
                No hay solicitudes
              </p>
              <p className="max-w-md text-sm text-foreground/60">
                Cuando un visitante envíe el formulario o complete una
                conversación con el asistente, su solicitud aparecerá aquí.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-graphite/10 bg-brand-cream/60 text-xs uppercase tracking-wider text-foreground/60">
                    <th className="px-5 py-3 font-semibold">Fecha</th>
                    <th className="px-5 py-3 font-semibold">Cliente</th>
                    <th className="px-5 py-3 font-semibold">Producto / necesidad</th>
                    <th className="px-5 py-3 font-semibold">Origen</th>
                    <th className="px-5 py-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {list.data?.items.map((r) => (
                    <tr
                      key={r.id}
                      tabIndex={0}
                      role="link"
                      aria-label={`Ver solicitud de ${r.nombre}`}
                      onClick={() => navigate(`/admin/solicitudes/${r.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/admin/solicitudes/${r.id}`);
                        }
                      }}
                      className="cursor-pointer border-b border-brand-graphite/5 transition-colors last:border-0 hover:bg-brand-cream/50"
                    >
                      <td className="tabular whitespace-nowrap px-5 py-3.5 text-foreground/60">
                        {new Date(r.createdAt).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-brand-graphite">{r.nombre}</p>
                        <p className="text-xs text-foreground/55">{r.email}</p>
                      </td>
                      <td className="max-w-[260px] truncate px-5 py-3.5 text-foreground/75">
                        {r.productName ?? r.trabajo ?? "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          r.source === "chat" ? "bg-brand-bright/20 text-brand-deep" : "bg-brand-graphite/10 text-brand-graphite",
                        )}>
                          {r.source === "chat" ? "Asistente IA" : "Formulario"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-foreground/60">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="grid min-h-[44px] min-w-[44px] place-items-center rounded-md border border-brand-graphite/20 bg-white disabled:opacity-40"
                aria-label="Página anterior"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="grid min-h-[44px] min-w-[44px] place-items-center rounded-md border border-brand-graphite/20 bg-white disabled:opacity-40"
                aria-label="Página siguiente"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
