import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "mikerent_sid";
const ACTIVE_WINDOW_MINUTES = 10;

export async function POST() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(COOKIE_NAME)?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }

  const now = new Date();

  // Upsert heartbeat
  await prisma.activeUser.upsert({
    where: { sessionId },
    update: { lastActivity: now },
    create: { sessionId, lastActivity: now },
  });

  // Opportunistic cleanup (keeps table small)
  const cutoff = new Date(Date.now() - ACTIVE_WINDOW_MINUTES * 60 * 1000 * 3);
  await prisma.activeUser.deleteMany({
    where: { lastActivity: { lt: cutoff } },
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

