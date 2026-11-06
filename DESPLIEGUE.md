# AGROAPER — Guía de despliegue

Web completa e independiente: React + Vite + Tailwind (frontend), Hono + tRPC + Drizzle (backend), PostgreSQL en **Supabase**, IA con **tu propia API key** (OpenAI-compatible) y adjuntos en **Supabase Storage**. Sin dependencia de ninguna plataforma externa adicional.

---

## 1. Qué necesitas antes de empezar

| Pieza | Dónde se consigue |
|---|---|
| Proyecto Supabase | [supabase.com](https://supabase.com) → New project (gratis) |
| API key de IA | OpenAI, OpenRouter, Groq… cualquier endpoint OpenAI-compatible |
| VPS | Hostinger, Hetzner… con Docker instalado (o despliegue local) |
| Dominio (opcional) | Apuntado a la IP del VPS |

---

## 2. Configurar Supabase

### 2.1 Base de datos

1. En tu proyecto Supabase: **Project Settings → Database → Connection string**.
2. Copia la URI (formato `postgresql://postgres:TU_PASSWORD@db.xxxx.supabase.co:5432/postgres`).
   - Si tu VPS no tiene IPv6 y la conexión directa falla, usa el **Connection Pooler** (puerto `6543`, modo transaction). El código ya viene preparado (`prepare: false`).
3. **No necesitas crear tablas a mano**: las crea el proyecto (paso 4.3).

### 2.2 Storage (adjuntos de las solicitudes)

1. En Supabase: **Storage → New bucket**.
2. Nombre: `adjuntos` (o el que quieras, y ajústalo en `SUPABASE_BUCKET`).
3. **IMPORTANTE: marca el bucket como PRIVADO.** Los adjuntos contienen datos de clientes; el acceso se hace con URLs firmadas temporales que genera el backend.
4. En **Project Settings → API** copia:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY` — **nunca la pongas en el frontend ni la subas a GitHub**.

---

## 3. Variables de entorno

Copia `.env.example` a `.env` y rellena:

```bash
cp .env.example .env
```

| Variable | Qué es |
|---|---|
| `DATABASE_URL` | URI de Postgres de Supabase (paso 2.1) |
| `APP_SECRET` | Cadena larga aleatoria para firmar sesiones. Genera una: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credenciales del administrador que crea el seed |
| `AI_API_KEY` | Tu API key de IA |
| `AI_BASE_URL` | `https://api.openai.com/v1` (OpenAI) u otro endpoint compatible |
| `AI_MODEL` | `gpt-4o-mini`, `openai/gpt-4o-mini` (OpenRouter), etc. |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_BUCKET` | Paso 2.2 |

**El archivo `.env` nunca se sube a GitHub** (ya está en `.gitignore`).

---

## 4. Puesta en marcha

### 4.1 Instalar dependencias

```bash
npm install
```

### 4.2 Crear las tablas en Supabase

```bash
npm run db:push
```

### 4.3 Crear el admin y el catálogo de demostración

```bash
npm run db:seed
```

Esto crea el usuario administrador con `ADMIN_EMAIL` / `ADMIN_PASSWORD` y las categorías/productos demo (`isDemo=true`, listos para sustituir por el catálogo real).

### 4.4 Desarrollo local

```bash
npm run dev
```

Web en `http://localhost:3000`, panel en `http://localhost:3000/login`.

---

## 5. Despliegue en VPS (Docker)

### 5.1 En el VPS

```bash
# Instalar Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh

# Clonar el repo (privado: usa tu clave SSH de GitHub)
git clone git@github.com:TU_USUARIO/agroaper-web.git
cd agroaper-web

# Crear el .env con tus valores (sección 3)
nano .env

# Levantar
docker compose up -d --build
```

La web queda en `http://IP_DEL_VPS:3000`.

### 5.2 Dominio + HTTPS (recomendado: Caddy)

Instala Caddy y crea `/etc/caddy/Caddyfile`:

```
agroaper.es {
    reverse_proxy localhost:3000
}
```

```bash
sudo systemctl reload caddy
```

Caddy emite y renueva el certificado HTTPS automáticamente.

### 5.3 Actualizar la web tras cambios en Cursor

```bash
git pull
docker compose up -d --build
```

---

## 6. Estructura del proyecto

```
api/            Backend (Hono + tRPC)
  auth/         Login propio (bcrypt + JWT en cookie httpOnly)
  ai/           Proveedor IA OpenAI-compatible (AI_API_KEY)
  lib/storage.ts  Supabase Storage (subida + URLs firmadas)
  *-router.ts   Solicitudes, chat, catálogo, admin
db/             Esquema Drizzle (Postgres) + seed
src/            Frontend React (páginas, componentes, chat widget)
contracts/      Constantes compartidas (cookie de sesión, errores)
Dockerfile      Imagen todo-en-uno (frontend compilado + backend)
docker-compose.yml
```

## 7. Panel de administración

- URL: `/login` → email + contraseña del admin.
- Solicitudes del formulario y del chat con estados: `nuevo → en_revision → pendiente_contactar → contactado → presupuesto_enviado → finalizado`.
- Notas internas por solicitud y exportación CSV.
- Los adjuntos se descargan con URLs firmadas de 10 minutos.

## 8. Chat con Relevance AI (opcional)

La web trae **dos chats**: el integrado (IA OpenAI-compatible, todo en tu Supabase) y, si lo activas, tu agente de **Relevance AI** embebido. Si configuras Relevance, el widget de Relevance sustituye automáticamente al chat integrado.

### 8.1 Crea y configura el agente en Relevance AI

1. Crea el agente en tu cuenta de Relevance AI.
2. Pega en sus instrucciones el prompt de recepción (está completo en `api/chat-router.ts`, función `buildSystemPrompt`): recepción de solicitudes, preguntas progresivas, nunca negocia precios ni plazos, y al confirmar el visitante, prepara el envío.
3. Añade al agente un **tool step de tipo "API call"** que el agente ejecute cuando el visitante confirme el envío:
   - **Método:** `POST`
   - **URL:** `https://tudominio.es/api/webhooks/relevance`
   - **Header:** `x-relevance-secret: <tu RELEVANCE_WEBHOOK_SECRET>`
   - **Body (JSON):**
     ```json
     {
       "nombre": "{{nombre}}",
       "telefono": "{{telefono}}",
       "email": "{{email}}",
       "localidad": "{{localidad}}",
       "provincia": "{{provincia}}",
       "empresa": "{{empresa}}",
       "productName": "{{producto}}",
       "tractorMarca": "{{marca_tractor}}",
       "tractorModelo": "{{modelo_tractor}}",
       "potencia": "{{potencia}}",
       "tipoEnganche": "{{tipo_enganche}}",
       "trabajo": "{{trabajo}}",
       "descripcion": "{{descripcion}}"
     }
     ```
   - Obligatorios: `nombre`, `telefono`, `email`. El resto son opcionales.
   - Cuando el tool se ejecuta con éxito, la solicitud aparece en tu panel `/admin` con origen **Chat**.

### 8.2 Genera el secreto y actívalo

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Ponlo en tu `.env` como `RELEVANCE_WEBHOOK_SECRET` y úsalo también en el header del tool step. Sin este secreto el webhook responde 404 (deshabilitado) y con secreto incorrecto, 401.

### 8.3 Incrusta el widget en la web

1. En Relevance AI: **Agent → Share → Chat Widget** y personaliza colores (`primary_color: #AEC51B` va con la marca), mensaje de bienvenida y prompts iniciales.
2. Copia el snippet `<script …>` que te dan.
3. Ponlo en tu `.env` como valor de `VITE_RELEVANCE_EMBED_SNIPPET` (todo en una sola línea).
4. Reconstruye la web (`docker compose up -d --build`). El widget aparece solo en las páginas públicas, nunca en `/admin`.

> ⚠️ Ten en cuenta: el widget de Relevance es público y el consumo del agente se cobra de **tus créditos de Relevance AI**. Las conversaciones se ven en Relevance; las **solicitudes** se ven en tu panel.

### 8.4 Volver al chat integrado

Borra (o comenta) `VITE_RELEVANCE_EMBED_SNIPPET` del `.env`, reconstruye y listo: la web vuelve al chat propio con `AI_API_KEY`.

## 9. Seguridad (resumen)

- Contraseñas con bcrypt (coste 12). Sesión JWT HS256 en cookie httpOnly.
- Rate limiting en login, formulario, subida de adjuntos y chat.
- La service_role key de Supabase y la API key de IA solo existen en el servidor.
- Webhook de Relevance protegido con secreto compartido (comparación en tiempo constante).
- Honeypot anti-spam en el formulario público.
- `.env` excluido de Git por `.gitignore`.
