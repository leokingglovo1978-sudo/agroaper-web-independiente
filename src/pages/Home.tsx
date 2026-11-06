import { Link } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Factory,
  Handshake,
  Sprout,
  Maximize2,
  Tractor,
  ClipboardList,
  Wrench,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useSeo } from "@/hooks/useSeo";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

const MARQUEE_ITEMS = [
  "Fabricación propia",
  "Trato directo",
  "Sin intermediarios",
  "Tractores pequeños y compactos",
  "Especialistas en invernadero",
  "Almería · España",
];

export default function Home() {
  useSeo(
    "AGROAPER — Fabricante de aperos agrícolas para tractores pequeños | Almería",
    "Fabricamos aperos agrícolas para tractores pequeños y compactos. Especialistas en trabajos bajo invernadero. Fabricación propia en Almería, sin intermediarios.",
  );
  const reduce = useReducedMotion();
  const featured = trpc.catalog.featured.useQuery();

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-brand-graphite">
        <motion.img
          src="/images/hero.jpg"
          alt="Tractor compacto trabajando con un apero dentro de un invernadero — imagen provisional"
          className="absolute inset-0 size-full object-cover"
          initial={reduce ? undefined : { scale: 1.12 }}
          animate={reduce ? undefined : { scale: 1 }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="scrim-full absolute inset-0" aria-hidden />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-36 sm:px-6 lg:px-8">
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 40 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1 text-brand-bright">
              <span className="inline-block h-[3px] w-8 bg-brand-orange" aria-hidden />
              Fabricación propia · Almería · España
            </p>
            <h1 className="mt-6 max-w-4xl text-balance font-display text-[2.6rem] font-bold uppercase leading-[0.98] text-brand-cream sm:text-6xl lg:text-7xl">
              Fabricamos los aperos que el campo necesita
            </h1>
            <p className="mt-6 max-w-2xl text-base text-brand-cream/85 sm:text-lg">
              Especialistas en aperos para tractores pequeños y compactos.
              Soluciones diseñadas para responder a las necesidades del trabajo
              agrícola, especialmente en invernaderos.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/productos"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-md bg-brand-orange px-8 py-3 font-display text-base font-bold uppercase tracking-wide text-brand-graphite transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Ver nuestros aperos
                <ArrowRight className="size-5" aria-hidden />
              </Link>
              <Link
                to="/sobre-agroaper"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-md border-2 border-brand-cream/70 px-8 py-3 font-display text-base font-bold uppercase tracking-wide text-brand-cream transition-colors hover:border-brand-bright hover:text-brand-bright active:scale-[0.98]"
              >
                Conoce AGROAPER
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ CINTA DE MARCA ============ */}
      <div className="overflow-hidden border-y border-brand-graphite/10 bg-brand py-3" aria-hidden>
        <div className="marquee-track flex w-max items-center gap-8">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-8 whitespace-nowrap font-display text-sm font-bold uppercase tracking-[0.18em] text-brand-graphite"
            >
              {item}
              <span className="inline-block size-2 rotate-45 bg-brand-graphite/70" />
            </span>
          ))}
        </div>
      </div>

      {/* ============ FABRICANTES, NO INTERMEDIARIOS ============ */}
      <section className="bg-background py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Quiénes somos"
              title="No somos intermediarios. Somos fabricantes."
            />
            <p className="mt-6 max-w-xl text-foreground/75 sm:text-lg">
              En AGROAPER trabajamos directamente en la fabricación de aperos
              agrícolas, buscando ofrecer soluciones funcionales y adaptadas a
              las necesidades reales del agricultor.
            </p>
            <p className="mt-4 max-w-xl text-foreground/75 sm:text-lg">
              Nuestro objetivo es facilitar el trabajo diario en el campo
              mediante aperos pensados para tractores pequeños y compactos.
            </p>
            <Link
              to="/fabricacion"
              className="mt-8 inline-flex min-h-[44px] items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-brand-deep underline decoration-brand-orange decoration-[3px] underline-offset-8 transition-colors hover:text-brand-graphite"
            >
              Así fabricamos
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Reveal>

          <div className="flex flex-col justify-center gap-4">
            {[
              {
                icon: Factory,
                title: "Fabricación propia",
                text: "Fabricamos nuestros aperos. Hablas directamente con quien los construye.",
              },
              {
                icon: Handshake,
                title: "Trato directo",
                text: "Sin intermediarios: cuentas tu necesidad y la estudia el propio fabricante.",
              },
              {
                icon: Sprout,
                title: "Soluciones agrícolas especializadas",
                text: "Aperos pensados para el trabajo real del campo, no para el escaparate.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1}>
                <div className="flex gap-5 rounded-xl border border-brand-graphite/10 bg-white p-6 shadow-sm">
                  <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-brand-deep text-brand-bright">
                    <item.icon className="size-6" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold uppercase tracking-tight text-brand-graphite">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-foreground/70">{item.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRODUCTOS DESTACADOS ============ */}
      <section className="bg-brand-cream py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Catálogo"
                title="Nuestros productos"
                description="Una selección de aperos para tractores pequeños y compactos. Catálogo provisional en preparación."
              />
              <Link
                to="/productos"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-md border-2 border-brand-deep px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-brand-deep transition-colors hover:bg-brand-deep hover:text-brand-cream"
              >
                Ver catálogo completo
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            {featured.data?.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}>
                <ProductCard product={p} />
              </Reveal>
            ))}
            {featured.data?.length === 0 && (
              <p className="col-span-full rounded-xl border border-dashed border-brand-graphite/25 bg-white p-8 text-center text-foreground/60">
                El catálogo está en preparación. Muy pronto podrás ver aquí nuestros aperos.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ============ ESPECIALISTAS EN INVERNADEROS ============ */}
      <section className="bg-brand-deep py-20 text-brand-cream sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <SectionHeading
                dark
                eyebrow="Especialistas en invernaderos"
                title="Conocemos las necesidades del campo"
                description="Trabajar bajo invernadero no es lo mismo que trabajar en campo abierto. Las calles son estrechas, los giros son cortos y el tractor manda sobre el espacio disponible, no al revés."
              />
              <ul className="mt-8 space-y-5">
                {[
                  {
                    icon: Maximize2,
                    title: "Espacios de trabajo reducidos",
                    text: "Calles y pasillos que exigen aperos ágiles y bien dimensionados.",
                  },
                  {
                    icon: Tractor,
                    title: "Tractores pequeños y compactos",
                    text: "El tractor habitual del invernadero necesita aperos a su medida.",
                  },
                  {
                    icon: ClipboardList,
                    title: "Necesidades específicas del agricultor",
                    text: "Cada explotación trabaja distinto: primero escuchamos, luego proponemos.",
                  },
                  {
                    icon: Wrench,
                    title: "Soluciones adaptadas a cada explotación",
                    text: "Estudiamos cada caso para proponer el apero adecuado al trabajo.",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-lg bg-brand-bright/15 text-brand-bright ring-1 ring-brand-bright/30">
                      <item.icon className="size-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-bold uppercase tracking-tight">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-brand-cream/75">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                to="/invernaderos"
                className="mt-9 inline-flex min-h-[44px] items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-brand-bright underline decoration-brand-orange decoration-[3px] underline-offset-8 transition-colors hover:text-white"
              >
                Soluciones para invernaderos
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="grid grid-cols-2 gap-4">
                <div className="group overflow-hidden rounded-xl">
                  <img
                    src="/images/tractor-fresa-invernadero.jpg"
                    alt="Tractor compacto con fresa trabajando entre calles de un invernadero — imagen provisional"
                    loading="lazy"
                    className="zoom-slow aspect-[3/4] size-full object-cover"
                  />
                </div>
                <div className="group mt-10 overflow-hidden rounded-xl">
                  <img
                    src="/images/invernadero-interior.jpg"
                    alt="Calle interior de un invernadero hortícola — imagen provisional"
                    loading="lazy"
                    className="zoom-slow aspect-[3/4] size-full object-cover"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ FABRICACIÓN PROPIA ============ */}
      <section className="bg-background py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:px-8">
          <Reveal>
            <div className="group relative overflow-hidden rounded-xl">
              <img
                src="/images/taller-soldadura.jpg"
                alt="Proceso de soldadura en un taller de fabricación metálica — imagen provisional"
                loading="lazy"
                className="zoom-slow aspect-[4/3] size-full object-cover"
              />
              <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white/90">
                Imagen provisional
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <SectionHeading
              eyebrow="Fabricación propia"
              title="Del taller al campo"
            />
            <p className="mt-6 text-foreground/75 sm:text-lg">
              En AGROAPER creemos en la fabricación de soluciones agrícolas que
              respondan a necesidades reales. Apostamos por el trato directo con
              el cliente y por conocer de primera mano qué necesita cada
              explotación.
            </p>
            <Link
              to="/fabricacion"
              className="mt-8 inline-flex min-h-[44px] items-center gap-2 rounded-md border-2 border-brand-deep px-5 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-brand-deep transition-colors hover:bg-brand-deep hover:text-brand-cream"
            >
              Conoce nuestra fabricación
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============ FRANJA ALMERÍA ============ */}
      <section className="relative overflow-hidden">
        <img
          src="/images/almeria.jpg"
          alt="Vista aérea del mar de invernaderos de Almería al atardecer — imagen provisional"
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="scrim-full absolute inset-0" aria-hidden />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-28 text-center sm:px-6 sm:py-36 lg:px-8">
          <Reveal>
            <p className="eyebrow justify-center text-brand-bright">
              Almería · Andalucía
            </p>
            <p className="mx-auto mt-5 max-w-3xl text-balance font-display text-2xl font-bold uppercase leading-tight text-brand-cream sm:text-4xl">
              Fabricación propia. Trato directo. Sin intermediarios.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============ CTA FINAL ============ */}
      <section className="bg-brand-graphite py-20 text-brand-cream sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <Reveal>
            <p className="eyebrow justify-center text-brand-bright">
              <span className="inline-block h-[3px] w-8 bg-brand-orange" aria-hidden />
              Hablemos de tu explotación
            </p>
            <h2 className="mt-5 text-balance font-display text-3xl font-bold uppercase leading-tight sm:text-5xl">
              ¿Buscas un apero para tu tractor?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-brand-cream/80 sm:text-lg">
              Cuéntanos qué trabajo necesitas realizar y qué tractor utilizas.
              Nuestro equipo podrá revisar tu solicitud y estudiar la solución
              adecuada.
            </p>
            <Link
              to="/contacto#presupuesto"
              className="mt-9 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-md bg-brand-orange px-9 py-3 font-display text-base font-bold uppercase tracking-wide text-brand-graphite transition-all hover:brightness-110 active:scale-[0.98]"
            >
              Solicitar presupuesto
              <ArrowRight className="size-5" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
