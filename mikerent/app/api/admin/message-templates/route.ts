import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";
import { ensureMessageTemplates } from "@/lib/admin/messageTemplates";

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureMessageTemplates();
  const templates = await prisma.messageTemplate.findMany({
    orderBy: { slug: "asc" },
  });
  return NextResponse.json(templates);
}

export async function PUT(req: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug, title, body } = await req.json();
    if (!slug || !title || !body) {
      return NextResponse.json({ error: "slug, title, body required" }, { status: 400 });
    }

    const template = await prisma.messageTemplate.update({
      where: { slug: String(slug) },
      data: { title: String(title), body: String(body) },
    });
    return NextResponse.json(template);
  } catch (error) {
    console.error("Template update error:", error);
    return NextResponse.json({ error: "Помилка оновлення" }, { status: 500 });
  }
}
