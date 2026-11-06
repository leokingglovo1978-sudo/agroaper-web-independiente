import { useSeo } from "@/hooks/useSeo";
import { SectionHeading } from "@/components/SectionHeading";

type LegalKind = "aviso" | "privacidad" | "cookies";

const CONTENT: Record<
  LegalKind,
  { title: string; seo: string; sections: Array<{ h: string; p: string[] }> }
> = {
  aviso: {
    title: "Aviso legal",
    seo: "Aviso legal de AGROAPER, fabricante de aperos agrícolas en Almería.",
    sections: [
      {
        h: "Titular del sitio web",
        p: [
          "Este sitio web es titularidad de AGROAPER, empresa dedicada a la fabricación de aperos agrícolas, con actividad en Almería (Andalucía, España).",
          "Los datos identificativos completos del titular (denominación social, NIF, domicilio y datos registrales) se publicarán en este apartado en cuanto se facilite la información definitiva de la empresa.",
        ],
      },
      {
        h: "Objeto",
        p: [
          "Este sitio web tiene por objeto presentar la actividad de AGROAPER como fabricante de aperos agrícolas para tractores pequeños y compactos, mostrar su catálogo y facilitar el contacto y la solicitud de presupuestos personalizados.",
          "El catálogo mostrado no constituye una tienda en línea: no se realizan ventas ni pagos a través de este sitio web.",
        ],
      },
      {
        h: "Propiedad intelectual",
        p: [
          "Los contenidos, textos, diseño y elementos gráficos de este sitio web son titularidad de AGROAPER o se utilizan con las licencias correspondientes. Las fotografías actuales son provisionales y se sustituirán por material propio.",
        ],
      },
      {
        h: "Responsabilidad",
        p: [
          "La información sobre productos mostrada en este sitio es orientativa. Las características técnicas y compatibilidades definitivas se confirmarán siempre de forma individualizada durante la gestión de cada solicitud.",
        ],
      },
    ],
  },
  privacidad: {
    title: "Política de privacidad",
    seo: "Política de privacidad de AGROAPER: cómo tratamos los datos de las solicitudes de presupuesto y contacto.",
    sections: [
      {
        h: "Responsable del tratamiento",
        p: [
          "El responsable del tratamiento de los datos es AGROAPER, con actividad en Almería (Andalucía, España). Los datos de contacto del responsable se publicarán en este apartado en cuanto se faciliten.",
        ],
      },
      {
        h: "Datos que recogemos y finalidad",
        p: [
          "A través del formulario de solicitud de presupuesto y del asistente AGROAPER AI recogemos los datos que nos facilitas: nombre y apellidos, teléfono, correo electrónico, localidad, provincia, empresa o explotación, información sobre tu tractor y la necesidad agrícola que nos describes, así como los archivos que decidas adjuntar.",
          "La finalidad del tratamiento es exclusivamente la gestión de tu consulta o solicitud de presupuesto por parte del equipo de AGROAPER.",
        ],
      },
      {
        h: "Base jurídica",
        p: [
          "La base del tratamiento es tu consentimiento, otorgado al enviar el formulario o confirmar el envío de la solicitud en el asistente, y la aplicación de medidas precontractuales solicitadas por ti.",
          "El consentimiento para comunicaciones comerciales es independiente, opcional y puede retirarse en cualquier momento.",
        ],
      },
      {
        h: "Conservación y destinatarios",
        p: [
          "Los datos se conservarán durante el tiempo necesario para gestionar tu solicitud y, en su caso, la relación comercial derivada. No se ceden a terceros salvo obligación legal.",
        ],
      },
      {
        h: "Tus derechos",
        p: [
          "Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad dirigiéndote a AGROAPER a través de los medios de contacto habilitados en este sitio. También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).",
        ],
      },
    ],
  },
  cookies: {
    title: "Política de cookies",
    seo: "Política de cookies del sitio web de AGROAPER.",
    sections: [
      {
        h: "Qué son las cookies",
        p: [
          "Las cookies son pequeños archivos que los sitios web guardan en tu dispositivo para funcionar correctamente o recordar preferencias.",
        ],
      },
      {
        h: "Cookies que utiliza este sitio",
        p: [
          "Este sitio web utiliza únicamente almacenamiento técnico necesario para su funcionamiento, como la cookie de sesión del área de administración y la preferencia que mantiene tu conversación con el asistente AGROAPER AI mientras navegas.",
          "No utilizamos cookies de publicidad ni de seguimiento de terceros.",
        ],
      },
      {
        h: "Cómo gestionarlas",
        p: [
          "Puedes configurar tu navegador para rechazar o eliminar las cookies. Ten en cuenta que algunas funciones del sitio podrían dejar de estar disponibles.",
        ],
      },
    ],
  },
};

export default function Legal({ kind }: { kind: LegalKind }) {
  const content = CONTENT[kind];
  useSeo(`${content.title} — AGROAPER`, content.seo);

  return (
    <div className="bg-background pb-24">
      <section className="bg-brand-deep pb-14 pt-32 text-brand-cream sm:pt-40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading dark eyebrow="Legal" title={content.title} />
        </div>
      </section>
      <div className="mx-auto mt-14 max-w-4xl space-y-10 px-4 sm:px-6 lg:px-8">
        {content.sections.map((s, i) => (
          <section key={s.h}>
            <h2 className="font-display text-xl font-bold uppercase text-brand-graphite">
              {i + 1}. {s.h}
            </h2>
            {s.p.map((par) => (
              <p key={par.slice(0, 32)} className="mt-3 text-foreground/75">
                {par}
              </p>
            ))}
          </section>
        ))}
        <p className="border-t border-brand-graphite/10 pt-6 text-sm text-foreground/55">
          Última actualización: noviembre de 2025.
        </p>
      </div>
    </div>
  );
}
