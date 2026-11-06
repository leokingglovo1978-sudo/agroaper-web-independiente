import { Link } from "react-router";
import { ArrowRight, Flame, Scissors, Boxes, Handshake } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

export default function Fabricacion() {
  useSeo(
    "Fabricación propia de aperos agrícolas — AGROAPER",
    "Del taller al campo: fabricamos nuestros aperos agrícolas y tratamos directamente con cada agricultor. Sin intermediarios.",
  );

  return (
    <div>
      <section className="bg-brand-deep pb-16 pt-32 text-brand-cream sm:pt-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            dark
            eyebrow="Fabricación propia"
            title="Del taller al campo"
            description="En AGROAPER creemos en la fabricación de soluciones agrícolas que respondan a necesidades reales. Apostamos por el trato directo con el cliente y por conocer de primera mano qué necesita cada explotación."
          />
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <Reveal>
              <div className="group overflow-hidden rounded-xl">
                <img
                  src="/images/taller-soldadura.jpg"
                  alt="Soldadura de componentes metálicos en un taller — imagen provisional"
                  loading="lazy"
                  className="zoom-slow aspect-[4/3] size-full object-cover"
                />
              </div>
            </Reveal>
            <div className="flex flex-col justify-center">
              <Reveal>
                <h2 className="font-display text-2xl font-bold uppercase text-brand-graphite sm:text-3xl">
                  El apero nace del trabajo, no del catálogo
                </h2>
                <p className="mt-5 text-foreground/75 sm:text-lg">
                  Cada apero que fabricamos parte de una necesidad concreta del
                  campo: una calle estrecha, un giro imposible, un suelo que
                  exige un trabajo distinto. Por eso hablamos directamente con
                  el agricultor antes de fabricar.
                </p>
                <p className="mt-4 text-foreground/75 sm:text-lg">
                  Fabricar nosotros mismos nos permite controlar el proceso,
                  cuidar los materiales y responder con agilidad cuando una
                  explotación necesita algo particular.
                </p>
              </Reveal>
            </div>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Flame,
                title: "Soldadura y calderería",
                text: "Procesos de soldadura y trabajo del metal en taller propio.",
              },
              {
                icon: Scissors,
                title: "Corte y mecanizado",
                text: "Corte de metal y preparación de componentes estructurales.",
              },
              {
                icon: Boxes,
                title: "Estructuras metálicas",
                text: "Bastidores y estructuras pensadas para el trabajo agrícola diario.",
              },
              {
                icon: Handshake,
                title: "Trato directo",
                text: "Hablas con quien fabrica. Tu necesidad no pasa por intermediarios.",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="h-full rounded-xl border border-brand-graphite/10 bg-white p-6 shadow-sm">
                  <span className="grid size-12 place-items-center rounded-lg bg-brand-deep text-brand-bright">
                    <item.icon className="size-6" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold uppercase text-brand-graphite">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-foreground/70">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-14">
            <p className="rounded-xl border border-brand-orange/30 bg-brand-orange/10 px-6 py-5 text-sm text-foreground/80">
              Las fotografías de taller que ves actualmente son imágenes
              provisionales de archivo. No representan las instalaciones reales
              de AGROAPER y se sustituirán por fotografías propias.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-brand-graphite py-20 text-center text-brand-cream">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-balance font-display text-3xl font-bold uppercase sm:text-4xl">
              Cuéntanos qué necesitas fabricar
            </h2>
            <p className="mt-4 text-brand-cream/80 sm:text-lg">
              Revisaremos tu solicitud y estudiaremos la solución adecuada para tu tractor y tu explotación.
            </p>
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
