import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) return false;

  try {
    verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

// DELETE /api/admin/apartments/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  // Перевіряємо чи це адмін
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.apartment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Помилка видалення" }, { status: 500 });
  }
}

// GET /api/admin/apartments/[id] - для редагування
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const apartment = await prisma.apartment.findUnique({
      where: { id: params.id },
    });

    if (!apartment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(apartment);
  } catch (error) {
    return NextResponse.json(
      { error: "Помилка завантаження" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/apartments/[id] - оновлення
export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    const apartment = await prisma.apartment.update({
      where: { id: params.id },
      data: {
        title: data.title,
        type: data.type,
        city: data.city,
        address: data.address,
        pricePerNight: Number(data.pricePerNight),
        guests: Number(data.guests),
        bedrooms: Number(data.bedrooms),
        beds: Number(data.beds),
        bathrooms: Number(data.bathrooms),
        description: data.description,
        images: data.images,
        amenities: data.amenities,
        mapUrl: data.mapUrl,
      },
    });

    return NextResponse.json(apartment);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Помилка оновлення" }, { status: 500 });
  }
}
