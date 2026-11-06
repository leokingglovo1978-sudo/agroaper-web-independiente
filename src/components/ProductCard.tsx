import { Link } from "react-router";
import { ArrowRight, MessageSquare } from "lucide-react";
import type { Product, Category } from "@db/schema";

type ProductWithCategory = Product & { category?: Category | null };

export function ProductCard({ product }: { product: ProductWithCategory }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-brand-graphite/10 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <Link
        to={`/productos/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-brand-cream"
        aria-label={`Ver ${product.name}`}
      >
        <img
          src={product.image}
          alt={`${product.name} — imagen provisional`}
          loading="lazy"
          className="zoom-slow size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {product.category && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-deep/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-cream">
            {product.category.name}
          </span>
        )}
        {product.isDemo && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/90">
            Imagen provisional
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-bold uppercase leading-tight text-brand-graphite">
          <Link to={`/productos/${product.slug}`} className="transition-colors hover:text-brand-deep">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm text-foreground/70">{product.shortDescription}</p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link
            to={`/productos/${product.slug}`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-brand px-4 py-2 font-display text-sm font-semibold uppercase tracking-wide text-brand-graphite transition-all hover:bg-brand-bright active:scale-[0.98]"
          >
            Ver producto
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            to={`/contacto?producto=${encodeURIComponent(product.name)}#presupuesto`}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-brand-deep underline decoration-brand-orange decoration-2 underline-offset-4 transition-colors hover:text-brand-graphite"
          >
            <MessageSquare className="size-4" aria-hidden />
            Solicitar información
          </Link>
        </div>
      </div>
    </article>
  );
}
