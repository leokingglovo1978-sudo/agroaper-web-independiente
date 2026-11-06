import { Link } from "react-router";
import { ArrowRight, Maximize2, Tractor, ClipboardList, Wrench } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

export default function Invernaderos() {
  useSeo(
    "Aperos para agricultura bajo invernadero — AGROAPER",
    "Soluciones para el trabajo agrícola en invernaderos: aperos para tractores pequeños y compactos, pensados para espacios reducidos. Almería.",
  );

  return (
    <div>
      <section className="bg-brand-deep pb-16 pt-32 text-brand-cream sm:pt-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            dark
            eyebrow="Soluciones para invernaderos"
            title="Conocemos las necesidades del campo"
            description="La agricultura bajo invernadero es el corazón de Almería. Trabajar entre calles estrechas exige maquinaria y aperos pensados para el espacio real de la explotación."
          />
        </div>
      </section>

      {/* Franja aérea */}
      <section className="relative overflow-hidden">
        <img
          src="/images/almeria.jpg"
          alt="Mar de invernaderos de Almería visto desde el aire — imagen provisional"
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
        />
        <div className="scrim-full absolute inset-0" aria-hidden />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <p className="max-w-2xl text-balance font-display text-2xl font-bold uppercase leading-tight text-brand-cream sm:text-3xl">
            Una de las mayores concentraciones de agricultura bajo plástico del
            mundo es nuestro entorno de trabajo.
          </p>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="grid grid-cols-2 gap-4">
              <Reveal>
                <div className="group overflow-hidden rounded-xl">
                  <img
                    src="/images/tractor-fresa-invernadero.jpg"
                    alt="Tractor compacto con apero trabajando entre calles de cultivo en invernadero — imagen provisional"
                    loading="lazy"
                    className="zoom-slow aspect-[3/4] size-full object-cover"
                  />
                </div>
              </Reveal>
              <Reveal delay={0.12}>
                <div className="group mt-10 overflow-hidden rounded-xl">
                  <img
                    src="/images/invernadero-interior.jpg"
                    alt="Interior de un invernadero con calles de cultivo — imagen provisional"
                    loading="lazy"
                    className="zoom-slow aspect-[3/4] size-full object-cover"
                  />
                </div>
              </Reveal>
            </div>

            <div>
              <SectionHeading
                eyebrow="El trabajo bajo invernadero"
                title="Aperos pensados para espacios que no perdonan"
              />
              <ul className="mt-8 space-y-6">
                {[
                  {
                    icon: Maximize2,
                    title: "Espacios de trabajo reducidos",
                    text: "Las calles de un invernadero marcan el ancho de trabajo y el radio de giro. El apero debe adaptarse a ellas.",
                  },
                  {
                    icon: Tractor,
                    title: "Tractores pequeños y compactos",
                    text: "La potencia y el tamaño del tractor condicionan el apero adecuado. Por eso te preguntamos siempre por tu tractor.",
                  },
                  {
                    icon: ClipboardList,
                    title: "Necesidades específicas del agricultor",
                    text: "Cada cultivo y cada explotación trabajan de forma distinta. Escuchamos antes de proponer.",
                  },
                  {
                    icon: Wrench,
                    title: "Soluciones adaptadas a cada explotación",
                    text: "Estudiamos cada solicitud para proponer la solución que encaje con tu trabajo diario.",
                  },
                ].map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <span className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-lg bg-brand-deep text-brand-bright">
                      <item.icon className="size-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold uppercase text-brand-graphite">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-[15px] text-foreground/70">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Reveal className="mt-16">
            <div className="rounded-xl bg-brand-deep px-6 py-10 text-center text-brand-cream sm:px-12">
              <h2 className="text-balance font-display text-2xl font-bold uppercase sm:text-3xl">
                ¿Trabajas bajo invernadero?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-brand-cream/80">
                Cuéntanos cómo es tu explotación y qué trabajo necesitas
                realizar. Estudiaremos tu caso.
              </p>
              <Link
                to="/contacto#presupuesto"
                className="mt-7 inline-flex min-h-[52px] items-center gap-2 rounded-md bg-brand-orange px-8 py-3 font-display text-base font-bold uppercase tracking-wide text-brand-graphite transition-all hover:brightness-110 active:scale-[0.98]"
              >
                Solicitar presupuesto
                <ArrowRight className="size-5" aria-hidden />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
