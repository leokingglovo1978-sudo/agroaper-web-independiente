import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-brand-cream px-4 pt-24">
      <div className="text-center">
        <p className="eyebrow justify-center text-brand-deep">
          <span className="inline-block h-[3px] w-8 bg-brand-orange" aria-hidden />
          Error 404
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold uppercase text-brand-graphite sm:text-5xl">
          Página no encontrada
        </h1>
        <p className="mx-auto mt-4 max-w-md text-foreground/70">
          La página que buscas no existe o ha cambiado de dirección.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-md bg-brand px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-brand-graphite transition-colors hover:bg-brand-bright"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
