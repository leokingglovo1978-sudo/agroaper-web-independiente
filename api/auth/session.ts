import * as jose from "jose";
import { env } from "../lib/env";

/**
 * Sesión de administrador: JWT HS256 firmado con APP_SECRET.
 * El token viaja en una cookie httpOnly (ver contracts/constants.ts).
 */

const JWT_ALG = "HS256";

export interface SessionPayload {
  userId: number;
  email: string;
}

export async function signSessionToken(
  payload: SessionPayload,
): Promise<string> {
  const secret = new TextEncoder().encode(env.appSecret);
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(env.appSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
    });
    const { userId, email } = payload;
    if (typeof userId !== "number" || typeof email !== "string") return null;
    return { userId, email };
  } catch {
    return null;
  }
}
