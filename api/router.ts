import { authRouter } from "./auth-router";
import { catalogRouter } from "./catalog-router";
import { requestsRouter } from "./requests-router";
import { chatRouter } from "./chat-router";
import { adminRouter } from "./admin-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  catalog: catalogRouter,
  requests: requestsRouter,
  chat: chatRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
