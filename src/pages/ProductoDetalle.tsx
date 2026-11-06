import { Link, useParams } from "react-router";
import { ArrowLeft, ArrowRight, MessageSquare, Check } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useSeo } from "@/hooks/useSeo";
import { Reveal } from "@/components/Reveal";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductoDetalle() {
  const { slug } = useParams<{ slug: string }>();
  const product = trpc.catalog.productBySlug.useQuery({ slug: slug ?? "" }, { enabled: !!slug });

  const p = product.data;
  useSeo(
    p ? `${p.name} — AGROAPER` : "Producto — AGROAPER",
    p?.shortDescription ?? "Apero agrícola de fabricación propia AGROAPER.",
  );

  if (product.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-48" />
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <Skeleton className="aspect-[4/3] rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-40 text-center sm:px-6">
        <h1 className="font-display text-3xl font-bold uppercase text-brand-graphite">
          Producto no encontrado
        </h1>
        <p className="mt-4 text-foreground/70">
          El apero que buscas no existe o ha dejado de estar disponible.
        </p>
        <Link
          to="/productos"
          className="mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-md bg-brand px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-brand-graphite transition-colors hover:bg-brand-bright"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const applications = p.applications?.split("\n").filter(Boolean) ?? [];
  const specs = p.specs ? (JSON.parse(p.specs) as Array<{ label: string; value: string }>) : [];

  return (
    <div className="bg-background pb-24">
      {/* Migas + cabecera */}
      <div className="bg-brand-deep pb-10 pt-28 text-brand-cream sm:pt-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/productos"
            className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-brand-cream/75 transition-colors hover:text-brand-bright"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Catálogo
          </Link>
          <p className="eyebrow mt-4 text-brand-bright">
            <span className="inline-block h-[3px] w-8 bg-brand-orange" aria-hidden />
            {p.category?.name ?? "Apero"}
          </p>
          <h1 className="mt-3 text-balance font-display text-3xl font-bold uppercase leading-tight sm:text-5xl">
            {p.name}
          </h1>
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:px-8">
        {/* Galería */}
        <Reveal>
          <figure className="overflow-hidden rounded-xl border border-brand-graphite/10 bg-white">
            <img
              src={p.image}
              alt={`${p.name} — imagen provisional`}
              className="aspect-[4/3] w-full object-cover"
            />
          </figure>
          {p.isDemo && (
            <p className="mt-3 text-xs text-foreground/55">
              Imagen y ficha provisionales: el contenido definitivo del producto
              se publicará próximamente.
            </p>
          )}
        </Reveal>

        {/* Información */}
        <div>
          <p className="text-lg text-foreground/80">{p.description}</p>

          {applications.length > 0 && (
            <div className="mt-8">
              <h2 className="eyebrow text-brand-deep">Aplicaciones</h2>
              <ul className="mt-4 space-y-2.5">
                {applications.map((a) => (
                  <li key={a} className="flex items-start gap-3 text-[15px] text-foreground/80">
                    <Check className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 rounded-xl border border-brand-graphite/10 bg-white p-6">
            <h2 className="eyebrow text-brand-deep">Características técnicas</h2>
            {specs.length > 0 ? (
              <dl className="tabular mt-4 divide-y divide-brand-graphite/10">
                {specs.map((s) => (
                  <div key={s.label} className="flex justify-between gap-4 py-2.5 text-sm">
                    <dt className="text-foreground/60">{s.label}</dt>
                    <dd className="font-semibold text-brand-graphite">{s.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-3 text-sm text-foreground/65">
                Las características técnicas y compatibilidades de este apero se
                publicarán cuando estén verificadas. Si necesitas conocer un
                dato concreto, consúltanos y nuestro equipo lo revisará.
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/contacto?producto=${encodeURIComponent(p.name)}#presupuesto`}
              className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-md bg-brand-orange px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-brand-graphite transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Solicitar presupuesto
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              to={`/contacto?producto=${encodeURIComponent(p.name)}`}
              className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-md border-2 border-brand-deep px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-brand-deep transition-colors hover:bg-brand-deep hover:text-brand-cream"
            >
              <MessageSquare className="size-4" aria-hidden />
              Consultar sobre este apero
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
