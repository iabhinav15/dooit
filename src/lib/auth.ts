import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";

const secretKey = process.env.JWT_SECRET || "super-secret-key-for-dev";

interface SessionPayload extends JwtPayload {
  userId: string;
}

export async function encrypt(payload: Record<string, unknown>) {
  return jwt.sign(payload, secretKey, { expiresIn: "7d" });
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const payload = jwt.verify(input, secretKey);
    return typeof payload === "string" ? null : (payload as SessionPayload);
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({ userId, expires });
  const cookieStore = await cookies();
  cookieStore.set("dooit:session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("dooit:session")?.value;
  if (!session) return null;
  try {
    return await decrypt(session);
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.set("dooit:session", "", { expires: new Date(0), path: "/" });
}
