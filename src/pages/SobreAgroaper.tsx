import { Link } from "react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

export default function SobreAgroaper() {
  useSeo(
    "Sobre AGROAPER — Fabricante de aperos agrícolas en Almería",
    "Somos AGROAPER: fabricamos aperos agrícolas para tractores pequeños y compactos. Fabricación propia, trato directo y especialización en invernaderos.",
  );

  return (
    <div>
      <section className="bg-brand-deep pb-16 pt-32 text-brand-cream sm:pt-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            dark
            eyebrow="Sobre AGROAPER"
            title="Somos AGROAPER. Fabricamos para el campo."
            description="Fabricante de aperos agrícolas para tractores pequeños y compactos, con especial atención al trabajo bajo invernadero."
          />
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <div className="group overflow-hidden rounded-xl">
                <img
                  src="/images/manos-tierra.jpg"
                  alt="Manos de agricultor sosteniendo tierra de cultivo — imagen provisional"
                  loading="lazy"
                  className="zoom-slow aspect-[4/3] size-full object-cover"
                />
              </div>
            </Reveal>
            <div>
              <h2 className="font-display text-2xl font-bold uppercase text-brand-graphite sm:text-3xl">
                Una empresa del campo, para el campo
              </h2>
              <p className="mt-5 text-foreground/75 sm:text-lg">
                AGROAPER nace en Almería, en el corazón de una de las zonas
                agrícolas más intensivas de Europa. Aquí el trabajo bajo
                invernadero marca el ritmo, y la maquinaria debe responder a
                espacios y necesidades muy concretos.
              </p>
              <p className="mt-4 text-foreground/75 sm:text-lg">
                Nuestra actividad es la fabricación de aperos agrícolas para
                tractores pequeños y compactos. No somos una tienda ni un
                distribuidor: fabricamos, y quien nos contacta habla directamente
                con el fabricante.
              </p>
              <p className="mt-6 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-brand-deep">
                <MapPin className="size-5 text-brand-orange" aria-hidden />
                Almería · Andalucía · España
              </p>
            </div>
          </div>

          <div className="mt-20 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Filosofía de fabricación",
                text: "Fabricar nosotros mismos nos permite controlar materiales y proceso, y responder a necesidades reales de cada explotación.",
              },
              {
                title: "Atención directa",
                text: "Escuchamos al agricultor, entendemos su trabajo y estudiamos cada solicitud antes de proponer una solución.",
              },
              {
                title: "Especialización",
                text: "Nos centramos en tractores pequeños y compactos y en el trabajo bajo invernadero: nuestro entorno y nuestra especialidad.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="h-full border-t-4 border-brand bg-white p-6 shadow-sm">
                  <h3 className="font-display text-lg font-bold uppercase text-brand-graphite">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-foreground/70">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-14">
            <p className="rounded-xl border border-brand-orange/30 bg-brand-orange/10 px-6 py-5 text-sm text-foreground/80">
              Las imágenes de esta página son provisionales y se sustituirán por
              fotografías reales de AGROAPER.
            </p>
          </Reveal>

          <Reveal className="mt-16 text-center">
            <h2 className="text-balance font-display text-3xl font-bold uppercase text-brand-graphite sm:text-4xl">
              Habla directamente con el fabricante
            </h2>
            <Link
              to="/contacto#presupuesto"
              className="mt-8 inline-flex min-h-[52px] items-center gap-2 rounded-md bg-brand-orange px-8 py-3 font-display text-base font-bold uppercase tracking-wide text-brand-graphite transition-all hover:brightness-110 active:scale-[0.98]"
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
