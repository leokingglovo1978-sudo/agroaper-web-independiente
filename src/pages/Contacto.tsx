import { useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  MapPin,
  Paperclip,
  X,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useSeo } from "@/hooks/useSeo";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

/**
 * Datos de contacto de la empresa — pendientes de facilitar.
 * Cuando estén disponibles, se completan aquí y aparecen en toda la web.
 */
const CONTACT = {
  telefono: "",
  email: "",
  direccion: "",
  horario: "",
};

type FormState = {
  nombre: string;
  telefono: string;
  email: string;
  localidad: string;
  provincia: string;
  empresa: string;
  productName: string;
  tractorMarca: string;
  tractorModelo: string;
  potencia: string;
  tipoEnganche: string;
  trabajo: string;
  descripcion: string;
  consentPrivacy: boolean;
  consentMarketing: boolean;
  website: string; // honeypot
};

const inputCls =
  "min-h-[48px] w-full rounded-md border border-input bg-white px-3.5 py-2.5 text-[15px] outline-none transition-colors focus-visible:outline-[3px] focus-visible:outline-brand-orange";
const labelCls = "mb-1.5 block text-sm font-semibold text-brand-graphite";

export default function Contacto() {
  useSeo(
    "Contacto y solicitud de presupuesto — AGROAPER",
    "Cuéntanos qué trabajo necesitas realizar y qué tractor utilizas. Solicita presupuesto de aperos agrícolas directamente al fabricante.",
  );
  const [params] = useSearchParams();
  const productoInicial = params.get("producto") ?? "";

  const products = trpc.catalog.products.useQuery({});
  const createRequest = trpc.requests.create.useMutation();
  const uploadAttachment = trpc.requests.uploadAttachment.useMutation();

  const [form, setForm] = useState<FormState>({
    nombre: "",
    telefono: "",
    email: "",
    localidad: "",
    provincia: "",
    empresa: "",
    productName: productoInicial,
    tractorMarca: "",
    tractorModelo: "",
    potencia: "",
    tipoEnganche: "",
    trabajo: "",
    descripcion: "",
    consentPrivacy: false,
    consentMarketing: false,
    website: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const productoOptions = useMemo(
    () => products.data?.map((p) => p.name) ?? [],
    [products.data],
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (form.nombre.trim().length < 2) e.nombre = "Indícanos tu nombre y apellidos.";
    if (form.telefono.trim().length < 6) e.telefono = "Indícanos un teléfono válido.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Indícanos un correo electrónico válido.";
    if (!form.consentPrivacy)
      e.consentPrivacy = "Necesitamos tu consentimiento para gestionar la consulta.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onFileChange(f: File | null) {
    setFileError(null);
    if (!f) {
      setFile(null);
      return;
    }
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(f.type)) {
      setFileError("Formato no admitido. Usa JPG, PNG, WebP o PDF.");
      return;
    }
    if (f.size > 3 * 1024 * 1024) {
      setFileError("El archivo supera el máximo de 3 MB.");
      return;
    }
    setFile(f);
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setSending(true);
    try {
      let attachmentKey: string | undefined;
      if (file) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve(String(reader.result).split(",")[1] ?? "");
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const up = await uploadAttachment.mutateAsync({
          name: file.name,
          contentBase64: base64,
          contentType: file.type,
        });
        attachmentKey = up.key;
      }
      const product = products.data?.find((p) => p.name === form.productName);
      await createRequest.mutateAsync({
        nombre: form.nombre.trim(),
        telefono: form.telefono.trim(),
        email: form.email.trim(),
        localidad: form.localidad.trim() || undefined,
        provincia: form.provincia.trim() || undefined,
        empresa: form.empresa.trim() || undefined,
        productId: product?.id,
        productName: form.productName.trim() || undefined,
        tractorMarca: form.tractorMarca.trim() || undefined,
        tractorModelo: form.tractorModelo.trim() || undefined,
        potencia: form.potencia.trim() || undefined,
        tipoEnganche: form.tipoEnganche.trim() || undefined,
        trabajo: form.trabajo.trim() || undefined,
        descripcion: form.descripcion.trim() || undefined,
        attachmentKey,
        consentPrivacy: true,
        consentMarketing: form.consentMarketing,
        website: form.website,
      });
      setSent(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(
        err instanceof Error && err.message
          ? err.message
          : "No se ha podido enviar la solicitud. Inténtalo de nuevo.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <section className="bg-brand-deep pb-16 pt-32 text-brand-cream sm:pt-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            dark
            eyebrow="Contacto"
            title="Habla directamente con el fabricante"
            description="Cuéntanos qué trabajo necesitas realizar y qué tractor utilizas. Nuestro equipo revisará tu solicitud y estudiará la solución adecuada."
          />
        </div>
      </section>

      <section className="py-16 sm:py-24" id="presupuesto">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:px-8">
          {/* Datos de contacto */}
          <Reveal>
            <div>
              <h2 className="font-display text-2xl font-bold uppercase text-brand-graphite">
                Datos de contacto
              </h2>
              <p className="mt-3 text-foreground/70">
                Estamos en Almería, en plena zona de agricultura bajo
                invernadero.
              </p>
              <ul className="mt-6 space-y-4 text-[15px]">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-brand-orange" aria-hidden />
                  <span>Almería · Andalucía · España</span>
                </li>
                {(CONTACT.telefono || CONTACT.email || CONTACT.direccion || CONTACT.horario) && (
                  <li className="text-foreground/70">
                    {CONTACT.telefono && <p>Teléfono: {CONTACT.telefono}</p>}
                    {CONTACT.email && <p>Email: {CONTACT.email}</p>}
                    {CONTACT.direccion && <p>Dirección: {CONTACT.direccion}</p>}
                    {CONTACT.horario && <p>Horario: {CONTACT.horario}</p>}
                  </li>
                )}
              </ul>
              <div className="mt-8 rounded-xl bg-brand-deep p-6 text-brand-cream">
                <p className="font-display text-lg font-bold uppercase">
                  ¿Prefieres que te ayude nuestro asistente?
                </p>
                <p className="mt-2 text-sm text-brand-cream/80">
                  AGROAPER AI puede recoger tu necesidad en una conversación
                  rápida. Ábrelo desde el botón verde de la esquina inferior
                  derecha.
                </p>
              </div>
              <p className="mt-6 text-sm text-foreground/60">
                También puedes consultar primero nuestro{" "}
                <Link to="/productos" className="font-semibold text-brand-deep underline decoration-brand-orange decoration-2 underline-offset-4">
                  catálogo de aperos
                </Link>
                .
              </p>
            </div>
          </Reveal>

          {/* Formulario */}
          <Reveal delay={0.1}>
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border border-brand/30 bg-white px-6 py-16 text-center shadow-sm">
                <CheckCircle2 className="size-14 text-brand" aria-hidden />
                <h2 className="mt-5 font-display text-2xl font-bold uppercase text-brand-graphite">
                  Solicitud enviada
                </h2>
                <p className="mt-3 max-w-md text-foreground/70">
                  Hemos registrado tu solicitud correctamente. El equipo de
                  AGROAPER la revisará y estudiará la solución adecuada para tu
                  caso.
                </p>
                <Link
                  to="/productos"
                  className="mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-md bg-brand px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-brand-graphite transition-colors hover:bg-brand-bright"
                >
                  Volver al catálogo
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                noValidate
                className="rounded-xl border border-brand-graphite/10 bg-white p-6 shadow-sm sm:p-8"
              >
                <h2 className="font-display text-2xl font-bold uppercase text-brand-graphite">
                  Solicitud de presupuesto
                </h2>
                <p className="mt-2 text-sm text-foreground/65">
                  Los campos marcados con * son obligatorios. Cuanta más
                  información nos des sobre tu tractor y tu trabajo, mejor
                  podremos estudiar tu caso.
                </p>

                {/* Honeypot anti-spam */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                />

                <fieldset className="mt-7">
                  <legend className="eyebrow text-brand-deep">Tus datos</legend>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="nombre" className={labelCls}>Nombre y apellidos *</label>
                      <input id="nombre" className={inputCls} value={form.nombre} onChange={(e) => set("nombre", e.target.value)} autoComplete="name" />
                      {errors.nombre && <p className="mt-1.5 text-sm font-medium text-red-700">{errors.nombre}</p>}
                    </div>
                    <div>
                      <label htmlFor="telefono" className={labelCls}>Teléfono *</label>
                      <input id="telefono" type="tel" className={inputCls} value={form.telefono} onChange={(e) => set("telefono", e.target.value)} autoComplete="tel" />
                      {errors.telefono && <p className="mt-1.5 text-sm font-medium text-red-700">{errors.telefono}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className={labelCls}>Correo electrónico *</label>
                      <input id="email" type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
                      {errors.email && <p className="mt-1.5 text-sm font-medium text-red-700">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="localidad" className={labelCls}>Localidad</label>
                      <input id="localidad" className={inputCls} value={form.localidad} onChange={(e) => set("localidad", e.target.value)} autoComplete="address-level2" />
                    </div>
                    <div>
                      <label htmlFor="provincia" className={labelCls}>Provincia</label>
                      <input id="provincia" className={inputCls} value={form.provincia} onChange={(e) => set("provincia", e.target.value)} autoComplete="address-level1" />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="empresa" className={labelCls}>Empresa o explotación agrícola (opcional)</label>
                      <input id="empresa" className={inputCls} value={form.empresa} onChange={(e) => set("empresa", e.target.value)} autoComplete="organization" />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="mt-8">
                  <legend className="eyebrow text-brand-deep">Tu tractor</legend>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="tractorMarca" className={labelCls}>Marca del tractor</label>
                      <input id="tractorMarca" className={inputCls} value={form.tractorMarca} onChange={(e) => set("tractorMarca", e.target.value)} placeholder="Ej.: John Deere, Pasquali…" />
                    </div>
                    <div>
                      <label htmlFor="tractorModelo" className={labelCls}>Modelo</label>
                      <input id="tractorModelo" className={inputCls} value={form.tractorModelo} onChange={(e) => set("tractorModelo", e.target.value)} />
                    </div>
                    <div>
                      <label htmlFor="potencia" className={labelCls}>Potencia aproximada</label>
                      <input id="potencia" className={inputCls} value={form.potencia} onChange={(e) => set("potencia", e.target.value)} placeholder="Ej.: 35 CV" />
                    </div>
                    <div>
                      <label htmlFor="tipoEnganche" className={labelCls}>Tipo de enganche (si lo conoces)</label>
                      <input id="tipoEnganche" className={inputCls} value={form.tipoEnganche} onChange={(e) => set("tipoEnganche", e.target.value)} placeholder="Ej.: tres puntos Cat. I" />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="mt-8">
                  <legend className="eyebrow text-brand-deep">Tu necesidad</legend>
                  <div className="mt-4 grid gap-5">
                    <div>
                      <label htmlFor="producto" className={labelCls}>Producto o apero que te interesa</label>
                      <select
                        id="producto"
                        className={inputCls}
                        value={form.productName}
                        onChange={(e) => set("productName", e.target.value)}
                      >
                        <option value="">Selecciona un apero o déjalo en blanco…</option>
                        {productoOptions.map((name) => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                        <option value="Otro / no lo tengo claro">Otro / no lo tengo claro</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="trabajo" className={labelCls}>Trabajo que necesitas realizar</label>
                      <input id="trabajo" className={inputCls} value={form.trabajo} onChange={(e) => set("trabajo", e.target.value)} placeholder="Ej.: fresar las calles del invernadero" />
                    </div>
                    <div>
                      <label htmlFor="descripcion" className={labelCls}>Describe tu necesidad</label>
                      <textarea
                        id="descripcion"
                        rows={4}
                        className="w-full resize-y rounded-md border border-input bg-white px-3.5 py-2.5 text-[15px] outline-none focus-visible:outline-[3px] focus-visible:outline-brand-orange"
                        value={form.descripcion}
                        onChange={(e) => set("descripcion", e.target.value)}
                        placeholder="Cuéntanos cómo es tu explotación, si trabajas en invernadero, dimensiones aproximadas…"
                      />
                    </div>
                    <div>
                      <span className={labelCls}>Archivo o fotografía (opcional)</span>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInput.current?.click()}
                          className="inline-flex min-h-[48px] items-center gap-2 rounded-md border-2 border-dashed border-brand-graphite/25 px-5 py-2.5 text-sm font-semibold text-foreground/75 transition-colors hover:border-brand-deep hover:text-brand-deep"
                        >
                          <Paperclip className="size-4" aria-hidden />
                          {file ? "Cambiar archivo" : "Adjuntar archivo"}
                        </button>
                        {file && (
                          <span className="inline-flex items-center gap-2 rounded-md bg-brand-cream px-3 py-2 text-sm">
                            {file.name}
                            <button
                              type="button"
                              onClick={() => onFileChange(null)}
                              aria-label="Quitar archivo"
                              className="grid min-h-[28px] min-w-[28px] place-items-center rounded text-foreground/60 hover:text-red-700"
                            >
                              <X className="size-4" />
                            </button>
                          </span>
                        )}
                        <input
                          ref={fileInput}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          className="hidden"
                          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-foreground/55">JPG, PNG, WebP o PDF. Máximo 3 MB.</p>
                      {fileError && <p className="mt-1.5 text-sm font-medium text-red-700">{fileError}</p>}
                    </div>
                  </div>
                </fieldset>

                <fieldset className="mt-8 space-y-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={form.consentPrivacy}
                      onChange={(e) => set("consentPrivacy", e.target.checked)}
                      className="mt-1 size-5 shrink-0 accent-[#254E27]"
                    />
                    <span className="text-sm text-foreground/80">
                      He leído y acepto la{" "}
                      <Link to="/privacidad" className="font-semibold text-brand-deep underline decoration-brand-orange decoration-2 underline-offset-4">
                        política de privacidad
                      </Link>{" "}
                      y consiento el tratamiento de mis datos para gestionar mi
                      consulta. *
                    </span>
                  </label>
                  {errors.consentPrivacy && (
                    <p className="text-sm font-medium text-red-700">{errors.consentPrivacy}</p>
                  )}
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={form.consentMarketing}
                      onChange={(e) => set("consentMarketing", e.target.checked)}
                      className="mt-1 size-5 shrink-0 accent-[#254E27]"
                    />
                    <span className="text-sm text-foreground/80">
                      Acepto recibir comunicaciones comerciales de AGROAPER sobre
                      productos y novedades. (Opcional)
                    </span>
                  </label>
                </fieldset>

                {submitError && (
                  <p className="mt-5 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-md bg-brand-orange px-8 py-3 font-display text-base font-bold uppercase tracking-wide text-brand-graphite transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {sending ? (
                    <>
                      <Loader2 className="size-5 animate-spin" aria-hidden />
                      Enviando…
                    </>
                  ) : (
                    <>
                      Solicitar presupuesto
                      <ArrowRight className="size-5" aria-hidden />
                    </>
                  )}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </div>
  );
}
