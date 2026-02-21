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

// GET /api/admin/apartments - отримати всі квартири
export async function GET() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const apartments = await prisma.apartment.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(apartments);
  } catch (error) {
    return NextResponse.json(
      { error: "Помилка завантаження" },
      { status: 500 },
    );
  }
}

// POST /api/admin/apartments - створити нову квартиру
export async function POST(req: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    const apartment = await prisma.apartment.create({
      data: {
        title: data.title,
        type: data.type || "apartment",
        city: data.city,
        address: data.address || "",
        pricePerNight: Number(data.pricePerNight),
        guests: Number(data.guests) || 1,
        bedrooms: Number(data.bedrooms) || 1,
        beds: Number(data.beds) || Number(data.bedrooms) || 1,
        bathrooms: Number(data.bathrooms) || 1,
        description: data.description || "",
        images: data.images || [],
        amenities: data.amenities || [],
        mapUrl: data.mapUrl || "",
        rating: 0,
        reviewsCount: 0,
        // ✅ ЗБЕРІГАЄМО ЯК Є - прямо JSON
        availability: data.availability || {
          season: { from: "", to: "" },
          booked: [],
        },
      },
    });

    return NextResponse.json(apartment, { status: 201 });
  } catch (error) {
    console.error("Create error:", error);
    return NextResponse.json({ error: "Помилка створення" }, { status: 500 });
  }
}
