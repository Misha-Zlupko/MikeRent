export type AdminRole = "OWNER" | "WORKER";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

export type AdminSession = {
  id: string;
  email: string;
  role: AdminRole;
  name: string | null;
};

type JwtPayload = {
  id?: string;
  email?: string;
  role?: AdminRole;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;

  try {
    const decoded = verify(token, JWT_SECRET) as JwtPayload;
    if (!decoded.email) return null;

    const admin = await prisma.admin.findUnique({
      where: decoded.id ? { id: decoded.id } : { email: decoded.email },
      select: { id: true, email: true, role: true, name: true },
    });
    if (!admin) return null;
    return admin;
  } catch {
    return null;
  }
}

export async function verifyAdmin(): Promise<boolean> {
  return (await getAdminSession()) != null;
}

export async function getAdminEmail(): Promise<string | null> {
  const session = await getAdminSession();
  return session?.email ?? null;
}

export function isOwner(session: AdminSession): boolean {
  return session.role === "OWNER";
}

export async function requireAdmin(): Promise<AdminSession | null> {
  return getAdminSession();
}

export async function requireOwner(): Promise<AdminSession | null> {
  const session = await getAdminSession();
  if (!session || !isOwner(session)) return null;
  return session;
}
