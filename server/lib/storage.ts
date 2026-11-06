/**
 * storage.ts — Almacenamiento de adjuntos en Supabase Storage.
 *
 * Subida y URLs firmadas vía la API REST de Supabase Storage
 * (no requiere SDK: solo SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).
 *
 * Reglas:
 *  - La service_role key SOLO vive en el servidor (nunca en el navegador).
 *  - En la base de datos se guarda únicamente el `key` del objeto;
 *    las URLs firmadas caducan y se generan bajo demanda.
 *  - El bucket debe ser PRIVADO en Supabase (los adjuntos contienen
 *    datos de clientes). Las URLs firmadas son la única vía de acceso.
 */

import { env } from "./env";

export class StorageError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "StorageError";
    this.code = code;
  }
}

const MAX_UPLOAD_BYTES = 3 * 1024 * 1024; // coherente con el límite del formulario (3MB)
const SIGNED_URL_TTL_SECONDS = 600; // 10 minutos

const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

function guessContentType(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  if (dot < 0) return "application/octet-stream";
  return MIME_BY_EXT[fileName.slice(dot).toLowerCase()] ?? "application/octet-stream";
}

function encodeObjectKey(key: string): string {
  return key.split("/").map(encodeURIComponent).join("/");
}

function randomSuffix8(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Genera un key único: `carpeta/nombre-a1b2c3d4.ext` */
function uniqueKey(fileName: string): string {
  const slash = fileName.lastIndexOf("/");
  const dir = slash < 0 ? "" : fileName.slice(0, slash + 1);
  const base = slash < 0 ? fileName : fileName.slice(slash + 1);
  const dot = base.lastIndexOf(".");
  const suffix = randomSuffix8();
  if (dot <= 0) return `${dir}${base}-${suffix}`;
  return `${dir}${base.slice(0, dot)}-${suffix}${base.slice(dot)}`;
}

function baseHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
    apikey: env.supabaseServiceRoleKey,
  };
}

function storageBase(): string {
  return `${env.supabaseUrl.replace(/\/+$/, "")}/storage/v1`;
}

export interface UploadFileInput {
  fileContent: Uint8Array | string;
  fileName: string;
  contentType?: string;
}

export interface UploadResult {
  key: string;
  fileName: string;
  size: number;
  contentType: string;
}

export interface PresignedUrlResult {
  key: string;
  url: string;
}

export class Storage {
  /** Sube un archivo al bucket privado y devuelve su key. */
  async uploadFile(input: UploadFileInput): Promise<UploadResult> {
    const body =
      typeof input.fileContent === "string"
        ? new TextEncoder().encode(input.fileContent)
        : input.fileContent;
    if (body.byteLength === 0) {
      throw new StorageError("STORAGE_INVALID_INPUT", "El archivo está vacío");
    }
    if (body.byteLength > MAX_UPLOAD_BYTES) {
      throw new StorageError("STORAGE_FILE_TOO_LARGE", "El archivo supera el límite de 3MB");
    }
    const contentType = input.contentType ?? guessContentType(input.fileName);
    const key = uniqueKey(input.fileName);

    const res = await fetch(
      `${storageBase()}/object/${env.supabaseBucket}/${encodeObjectKey(key)}`,
      {
        method: "POST",
        headers: {
          ...baseHeaders(),
          "Content-Type": contentType,
          "x-upsert": "false",
        },
        body: body as unknown as NonNullable<RequestInit["body"]>,
      },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new StorageError(
        "STORAGE_UPLOAD_FAILED",
        `Supabase Storage rechazó la subida (HTTP ${res.status}): ${text.slice(0, 300)}`,
      );
    }
    return {
      key,
      fileName: key.slice(key.lastIndexOf("/") + 1),
      size: body.byteLength,
      contentType,
    };
  }

  /** Genera una URL firmada temporal (10 min) para descargar/ver un objeto. */
  async getPresignedUrl(input: { key: string }): Promise<PresignedUrlResult> {
    const res = await fetch(
      `${storageBase()}/object/sign/${env.supabaseBucket}/${encodeObjectKey(input.key)}`,
      {
        method: "POST",
        headers: { ...baseHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ expiresIn: SIGNED_URL_TTL_SECONDS }),
      },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new StorageError(
        "STORAGE_SIGN_FAILED",
        `No se pudo firmar la URL del adjunto (HTTP ${res.status}): ${text.slice(0, 300)}`,
      );
    }
    const data = (await res.json()) as { signedURL?: string };
    if (!data.signedURL) {
      throw new StorageError("STORAGE_SIGN_FAILED", "Supabase no devolvió signedURL");
    }
    return {
      key: input.key,
      url: `${env.supabaseUrl.replace(/\/+$/, "")}${data.signedURL}`,
    };
  }
}

/** Singleton perezoso: no lee env hasta la primera llamada. */
let _instance: Storage | undefined;
export const storage: Storage = new Proxy({} as Storage, {
  get(_target, prop) {
    _instance ??= new Storage();
    const value = Reflect.get(_instance, prop);
    return typeof value === "function" ? value.bind(_instance) : value;
  },
});
