import { getDb } from "../api/queries/connection";
import * as schema from "./schema";
import bcrypt from "bcryptjs";

/**
 * Datos iniciales:
 *  1. Usuario administrador (credenciales de ADMIN_EMAIL / ADMIN_PASSWORD).
 *  2. Categorías y productos de demostración (isDemo=true), pensados
 *     para ser sustituidos por el catálogo real de AGROAPER.
 */
async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // --- 1. Usuario administrador ---
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  if (adminEmail && adminPassword) {
    const existingAdmin = await db.query.users.findFirst();
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await db.insert(schema.users).values({
        email: adminEmail,
        name: "Administrador AGROAPER",
        passwordHash,
        role: "admin",
      });
      console.log(`Usuario administrador creado: ${adminEmail}`);
    } else {
      console.log("Ya existe un usuario. Seed de admin omitido.");
    }
  } else {
    console.warn(
      "ADMIN_EMAIL / ADMIN_PASSWORD no definidos: no se crea usuario administrador.",
    );
  }

  // --- 2. Catálogo de demostración ---
  const existing = await db.query.categories.findFirst();
  if (existing) {
    console.log("La base de datos ya contiene categorías. Seed de catálogo omitido.");
    process.exit(0);
  }

  const [preparacion, transporte, mantenimiento] = await db
    .insert(schema.categories)
    .values([
      {
        slug: "preparacion-del-suelo",
        name: "Preparación del suelo",
        description: "Aperos para el trabajo y preparación de la tierra.",
        sortOrder: 1,
      },
      {
        slug: "transporte",
        name: "Transporte",
        description: "Soluciones de transporte para la explotación agrícola.",
        sortOrder: 2,
      },
      {
        slug: "mantenimiento",
        name: "Mantenimiento",
        description: "Aperos para el mantenimiento de la explotación.",
        sortOrder: 3,
      },
    ])
    .returning({ id: schema.categories.id });

  const prepId = preparacion.id;
  const transpId = transporte.id;
  const mantId = mantenimiento.id;

  await db.insert(schema.products).values([
    {
      slug: "fresa-rotativa-compacta",
      name: "Fresa rotativa compacta",
      categoryId: prepId,
      shortDescription:
        "Apero de demostración para el fresado del suelo con tractores compactos.",
      description:
        "Producto de demostración. Fresa rotativa pensada para el trabajo del suelo con tractores pequeños y compactos, especialmente en espacios reducidos como invernaderos. Las características técnicas definitivas se publicarán cuando el catálogo real esté disponible.",
      applications: "Preparación de camas de cultivo\nAfincado y mullido del suelo\nTrabajo en calles de invernadero",
      specs: null,
      image: "/images/producto-fresa.jpg",
      gallery: null,
      isDemo: true,
      featured: true,
      sortOrder: 1,
    },
    {
      slug: "arado-de-vertedera",
      name: "Arado de vertedera",
      categoryId: prepId,
      shortDescription:
        "Apero de demostración para el volteo de la tierra con tractores pequeños.",
      description:
        "Producto de demostración. Arado de vertedera orientado a tractores de baja potencia. Las características técnicas definitivas se publicarán cuando el catálogo real esté disponible.",
      applications: "Volteo de la tierra\nPreparación profunda del suelo",
      specs: null,
      image: "/images/producto-arado.jpg",
      gallery: null,
      isDemo: true,
      featured: false,
      sortOrder: 2,
    },
    {
      slug: "remolque-basculante",
      name: "Remolque basculante",
      categoryId: transpId,
      shortDescription:
        "Apero de demostración para el transporte dentro de la explotación.",
      description:
        "Producto de demostración. Remolque basculante de pequeño formato para el transporte de cosecha, sustratos y materiales dentro de la explotación. Las características técnicas definitivas se publicarán cuando el catálogo real esté disponible.",
      applications: "Transporte de cosecha\nTraslado de materiales\nLogística interna de la explotación",
      specs: null,
      image: "/images/producto-remolque.jpg",
      gallery: null,
      isDemo: true,
      featured: true,
      sortOrder: 3,
    },
    {
      slug: "desbrozadora",
      name: "Desbrozadora",
      categoryId: mantId,
      shortDescription:
        "Apero de demostración para el desbroce y mantenimiento de zonas verdes.",
      description:
        "Producto de demostración. Desbrozadora para el mantenimiento de márgenes, caminos y zonas de hierba de la explotación. Las características técnicas definitivas se publicarán cuando el catálogo real esté disponible.",
      applications: "Desbroce de márgenes\nMantenimiento de caminos",
      specs: null,
      image: "/images/producto-desbrozadora.jpg",
      gallery: null,
      isDemo: true,
      featured: true,
      sortOrder: 4,
    },
    {
      slug: "cultivador-de-brazos",
      name: "Cultivador de brazos",
      categoryId: prepId,
      shortDescription:
        "Apero de demostración para el escarificado y aireado del suelo.",
      description:
        "Producto de demostración. Cultivador de brazos para el escarificado del suelo con tractores compactos. Las características técnicas definitivas se publicarán cuando el catálogo real esté disponible.",
      applications: "Escarificado\nAireado del suelo\nDestrucción de costras superficiales",
      specs: null,
      image: "/images/producto-cultivador.jpg",
      gallery: null,
      isDemo: true,
      featured: false,
      sortOrder: 5,
    },
    {
      slug: "pala-niveladora-trasera",
      name: "Pala niveladora trasera",
      categoryId: mantId,
      shortDescription:
        "Apero de demostración para nivelar y mantener suelos y caminos.",
      description:
        "Producto de demostración. Pala niveladora trasera para el mantenimiento de suelos y caminos de la explotación. Las características técnicas definitivas se publicarán cuando el catálogo real esté disponible.",
      applications: "Nivelación de suelos\nMantenimiento de caminos interiores",
      specs: null,
      image: "/images/producto-niveladora.jpg",
      gallery: null,
      isDemo: true,
      featured: false,
      sortOrder: 6,
    },
  ]);

  console.log("Done.");
  process.exit(0);
}

seed();
