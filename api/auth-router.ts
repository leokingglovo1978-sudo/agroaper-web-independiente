import * as cookie from "cookie";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { signSessionToken } from "./auth/session";
import { findUserByEmail } from "./queries/users";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import { rateLimit } from "./lib/ratelimit";

export const authRouter = createRouter({
  /** Login del equipo AGROAPER: email + contraseña. */
  login: publicQuery
    .input(
      z.object({
        email: z.string().trim().email().max(320),
        password: z.string().min(1).max(200),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const ip =
        ctx.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
      // 10 intentos / 10 min por IP: frena fuerza bruta sin molestar al equipo.
      if (!rateLimit(`login:${ip}`, 10, 10 * 60 * 1000)) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Demasiados intentos. Inténtalo de nuevo más tarde.",
        });
      }

      const user = await findUserByEmail(input.email);
      const ok =
        user && (await bcrypt.compare(input.password, user.passwordHash));
      if (!ok) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Correo o contraseña incorrectos.",
        });
      }

      const token = await signSessionToken({ userId: user.id, email: user.email });
      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );

      await getDb()
        .update(users)
        .set({ lastSignInAt: new Date() })
        .where(eq(users.id, user.id));

      return { id: user.id, name: user.name, email: user.email, role: user.role };
    }),

  me: authedQuery.query((opts) => {
    const { passwordHash: _omit, ...user } = opts.ctx.user;
    return user;
  }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
