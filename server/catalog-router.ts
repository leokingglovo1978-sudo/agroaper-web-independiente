import { z } from "zod";
import { asc, eq, like, or, and } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { categories, products } from "@db/schema";

export const catalogRouter = createRouter({
  categories: publicQuery.query(async () => {
    return getDb().query.categories.findMany({
      orderBy: [asc(categories.sortOrder)],
    });
  }),

  products: publicQuery
    .input(
      z.object({
        category: z.string().optional(), // slug de categoría
        search: z.string().max(120).optional(),
      }),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      if (input.category) {
        const cat = await db.query.categories.findFirst({
          where: (c, { eq }) => eq(c.slug, input.category!),
        });
        if (cat) conditions.push(eq(products.categoryId, cat.id));
      }
      if (input.search) {
        const term = `%${input.search}%`;
        conditions.push(
          or(like(products.name, term), like(products.shortDescription, term)),
        );
      }
      return db.query.products.findMany({
        where: conditions.length ? and(...conditions) : undefined,
        with: { category: true },
        orderBy: [asc(products.sortOrder)],
      });
    }),

  featured: publicQuery.query(async () => {
    return getDb().query.products.findMany({
      where: eq(products.featured, true),
      with: { category: true },
      orderBy: [asc(products.sortOrder)],
      limit: 4,
    });
  }),

  productBySlug: publicQuery
    .input(z.object({ slug: z.string().max(160) }))
    .query(async ({ input }) => {
      const product = await getDb().query.products.findFirst({
        where: eq(products.slug, input.slug),
        with: { category: true },
      });
      return product ?? null;
    }),
});
