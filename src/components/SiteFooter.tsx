import { Link } from "react-router";
import { MapPin } from "lucide-react";
import { Logo } from "./Logo";

/**
 * Pie de página. Los datos de contacto quedan preparados para completarse
 * cuando la empresa los facilite (ver CONTACT en Contacto).
 */
export function SiteFooter() {
  return (
    <footer className="bg-brand-graphite text-brand-cream">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs font-display text-lg font-semibold uppercase leading-snug text-brand-bright">
              Fabricamos lo que el campo necesita
            </p>
            <p className="mt-3 flex items-start gap-2 text-sm text-brand-cream/70">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-orange" aria-hidden />
              Almería · Andalucía · España
            </p>
          </div>

          <nav aria-label="Navegación del pie">
            <p className="eyebrow text-brand-cream/60">Navegación</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link className="transition-colors hover:text-brand-bright" to="/">Inicio</Link></li>
              <li><Link className="transition-colors hover:text-brand-bright" to="/fabricacion">Fabricación propia</Link></li>
              <li><Link className="transition-colors hover:text-brand-bright" to="/invernaderos">Soluciones para invernaderos</Link></li>
              <li><Link className="transition-colors hover:text-brand-bright" to="/sobre-agroaper">Sobre AGROAPER</Link></li>
            </ul>
          </nav>

          <nav aria-label="Catálogo">
            <p className="eyebrow text-brand-cream/60">Catálogo</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link className="transition-colors hover:text-brand-bright" to="/productos">Todos los aperos</Link></li>
              <li><Link className="transition-colors hover:text-brand-bright" to="/productos?categoria=preparacion-del-suelo">Preparación del suelo</Link></li>
              <li><Link className="transition-colors hover:text-brand-bright" to="/productos?categoria=transporte">Transporte</Link></li>
              <li><Link className="transition-colors hover:text-brand-bright" to="/productos?categoria=mantenimiento">Mantenimiento</Link></li>
            </ul>
          </nav>

          <nav aria-label="Contacto y legal">
            <p className="eyebrow text-brand-cream/60">Contacto</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link className="transition-colors hover:text-brand-bright" to="/contacto">Contacto</Link></li>
              <li><Link className="transition-colors hover:text-brand-bright" to="/contacto#presupuesto">Solicitar presupuesto</Link></li>
            </ul>
            <p className="eyebrow mt-8 text-brand-cream/60">Legal</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link className="transition-colors hover:text-brand-bright" to="/aviso-legal">Aviso legal</Link></li>
              <li><Link className="transition-colors hover:text-brand-bright" to="/privacidad">Política de privacidad</Link></li>
              <li><Link className="transition-colors hover:text-brand-bright" to="/cookies">Política de cookies</Link></li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-brand-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AGROAPER. Fabricación propia. Trato directo. Sin intermediarios.</p>
          <p>Las imágenes actuales son provisionales y se sustituirán por fotografías reales.</p>
        </div>
      </div>
    </footer>
  );
}
