import { cn } from "@/lib/utils";

/**
 * Cabecera de sección: micro-etiqueta industrial (eyebrow) + titular.
 * La marca naranja a la izquierda es la seña de identidad de AGROAPER.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  dark = false,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  dark?: boolean;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p
        className={cn(
          "eyebrow flex items-center gap-3",
          align === "center" && "justify-center",
          dark ? "text-brand-bright" : "text-brand-deep",
        )}
      >
        <span className="inline-block h-[3px] w-8 bg-brand-orange" aria-hidden />
        {eyebrow}
      </p>
      <h2
        className={cn(
          "mt-4 text-balance font-display text-3xl font-bold uppercase leading-[1.05] sm:text-4xl lg:text-5xl",
          dark ? "text-brand-cream" : "text-brand-graphite",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-5 max-w-2xl text-base sm:text-lg",
            dark ? "text-brand-cream/80" : "text-foreground/75",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
