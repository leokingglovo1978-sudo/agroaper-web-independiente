import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/productos", label: "Productos" },
  { to: "/fabricacion", label: "Fabricación propia" },
  { to: "/invernaderos", label: "Invernaderos" },
  { to: "/sobre-agroaper", label: "Sobre AGROAPER" },
  { to: "/contacto", label: "Contacto" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const overDark = (location.pathname === "/" && !scrolled) || open;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
          overDark
            ? "bg-transparent"
            : "border-b border-brand-graphite/10 bg-brand-cream/95 backdrop-blur supports-[backdrop-filter]:bg-brand-cream/85",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-6 lg:px-8">
          <Link to="/" aria-label="AGROAPER — inicio" className="shrink-0">
            <Logo light={overDark} />
          </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  overDark
                    ? "text-brand-cream/85 hover:text-white"
                    : "text-foreground/75 hover:text-brand-graphite",
                  isActive && (overDark ? "text-brand-bright" : "text-brand-deep"),
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/contacto#presupuesto"
            className="ml-3 inline-flex min-h-[44px] items-center gap-2 rounded-md bg-brand-orange px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-wide text-brand-graphite transition-all hover:brightness-110 active:scale-[0.98]"
          >
            Solicitar presupuesto
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </nav>

        <button
          type="button"
          className={cn(
            "grid min-h-[44px] min-w-[44px] place-items-center rounded-md lg:hidden",
            overDark ? "text-brand-cream" : "text-brand-graphite",
          )}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>
      </header>

      {/* Menú móvil: hermano del header (un `fixed` dentro de un header con
          backdrop-blur quedaría recortado por el containing block) */}
      {open && (
        <div className="fixed inset-0 z-30 flex flex-col bg-brand-deep px-6 pb-8 pt-24 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Navegación móvil">
            {NAV.map((item, i) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "border-b border-white/10 py-4 font-display text-2xl font-semibold uppercase tracking-tight text-brand-cream transition-colors",
                    isActive && "text-brand-bright",
                  )
                }
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Link
            to="/contacto#presupuesto"
            className="mt-8 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-md bg-brand-orange px-6 py-3 font-display text-base font-semibold uppercase tracking-wide text-brand-graphite"
          >
            Solicitar presupuesto
            <ArrowRight className="size-5" aria-hidden />
          </Link>
          <p className="mt-auto pt-8 text-sm text-brand-cream/60">
            Fabricación propia · Almería · España
          </p>
        </div>
      )}
    </>
  );
}
