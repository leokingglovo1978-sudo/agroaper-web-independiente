import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Search, PackageSearch } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useSeo } from "@/hooks/useSeo";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Productos() {
  useSeo(
    "Catálogo de aperos agrícolas — AGROAPER",
    "Catálogo de aperos para tractores pequeños y compactos: preparación del suelo, transporte y mantenimiento. Fabricación propia en Almería.",
  );
  const [params, setParams] = useSearchParams();
  const categoria = params.get("categoria") ?? "";
  const [search, setSearch] = useState("");

  const categories = trpc.catalog.categories.useQuery();
  const products = trpc.catalog.products.useQuery({
    category: categoria || undefined,
    search: search || undefined,
  });

  const activeLabel = useMemo(() => {
    if (!categoria) return "Todos los aperos";
    return categories.data?.find((c) => c.slug === categoria)?.name ?? "Todos los aperos";
  }, [categoria, categories.data]);

  function setCategory(slug: string) {
    const next = new URLSearchParams(params);
    if (slug) next.set("categoria", slug);
    else next.delete("categoria");
    setParams(next, { replace: true });
  }

  return (
    <div className="bg-background">
      {/* Cabecera */}
      <section className="bg-brand-deep pb-14 pt-32 text-brand-cream sm:pt-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            dark
            eyebrow="Catálogo AGROAPER"
            title="Aperos para tractores pequeños y compactos"
            description="Catálogo de fabricación propia. Los productos actuales son de demostración: el catálogo real se irá publicando próximamente."
          />
        </div>
      </section>

      {/* Buscador + filtros */}
      <div className="sticky top-16 z-30 border-b border-brand-graphite/10 bg-brand-cream/95 py-4 backdrop-blur sm:top-[72px]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <label className="relative flex-1">
            <span className="sr-only">Buscar aperos</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-foreground/50" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o descripción…"
              className="min-h-[48px] w-full rounded-md border border-input bg-white pl-11 pr-4 text-[15px] outline-none focus-visible:outline-[3px] focus-visible:outline-brand-orange"
            />
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
            <button
              type="button"
              onClick={() => setCategory("")}
              className={cn(
                "min-h-[44px] rounded-full border px-4 text-sm font-semibold transition-colors",
                !categoria
                  ? "border-brand-deep bg-brand-deep text-brand-cream"
                  : "border-brand-graphite/20 bg-white text-foreground/70 hover:border-brand-deep",
              )}
            >
              Todos
            </button>
            {categories.data?.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.slug)}
                className={cn(
                  "min-h-[44px] rounded-full border px-4 text-sm font-semibold transition-colors",
                  categoria === c.slug
                    ? "border-brand-deep bg-brand-deep text-brand-cream"
                    : "border-brand-graphite/20 bg-white text-foreground/70 hover:border-brand-deep",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listado */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-foreground/60" aria-live="polite">
            {products.isLoading
              ? "Cargando…"
              : `${products.data?.length ?? 0} resultado${(products.data?.length ?? 0) === 1 ? "" : "s"} · ${activeLabel}`}
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}

            {products.data?.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i, 5) * 0.06}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>

          {products.data?.length === 0 && (
            <div className="mt-10 flex flex-col items-center gap-4 rounded-xl border border-dashed border-brand-graphite/25 bg-white px-6 py-16 text-center">
              <PackageSearch className="size-10 text-brand-deep" aria-hidden />
              <div>
                <p className="font-display text-lg font-bold uppercase text-brand-graphite">
                  Sin resultados
                </p>
                <p className="mt-1 max-w-md text-sm text-foreground/70">
                  No hay aperos que coincidan con tu búsqueda. Prueba con otros
                  términos o cuéntanos directamente qué necesitas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("");
                }}
                className="min-h-[44px] rounded-md bg-brand px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-brand-graphite transition-colors hover:bg-brand-bright"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
