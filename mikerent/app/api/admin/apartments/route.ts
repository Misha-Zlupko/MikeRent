import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { isValidUkrainianPhone, normalizePhone } from "@/lib/phone";

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

    const ownerName =
      data.ownerName?.toString().trim() ? data.ownerName.toString().trim() : "";
    const ownerPhone =
      data.ownerPhone?.toString().trim() ? data.ownerPhone.toString().trim() : "";

    if (!ownerName) {
      return NextResponse.json(
        { error: "Ім'я власника не може бути порожнім" },
        { status: 400 },
      );
    }
    if (!ownerPhone) {
      return NextResponse.json(
        { error: "Номер телефону власника не може бути порожнім" },
        { status: 400 },
      );
    }
    if (!isValidUkrainianPhone(ownerPhone)) {
      return NextResponse.json(
        { error: "Некоректний номер телефону власника" },
        { status: 400 },
      );
    }

    const ownerPrice = Number(data.ownerPrice);
    const markup = Number(data.markup);
    if (!Number.isFinite(ownerPrice) || ownerPrice < 0) {
      return NextResponse.json(
        { error: "Ціна власника не може бути від’ємною" },
        { status: 400 },
      );
    }
    if (!Number.isFinite(markup) || markup < 0) {
      return NextResponse.json(
        { error: "Націнка не може бути від’ємною" },
        { status: 400 },
      );
    }
    const pricePerNight = ownerPrice + markup;

    const apartment = await prisma.apartment.create({
      data: {
        title: data.title,
        type: data.type || "apartment",
        category: data.category?.toUpperCase() || "EXCLUSIVE",
        city: data.city,
        address: data.address || "",
        ownerName,
        ownerPhone: normalizePhone(ownerPhone),
        ownerPrice,
        markup,
        pricePerNight,
        guests: Number(data.guests) || 1,
        bedrooms: Number(data.bedrooms) || 1,
        beds: Number(data.beds) || Number(data.bedrooms) || 1,
        bathrooms: Number(data.bathrooms) || 1,
        description: data.description || "",
        images: data.images || [],
        amenities: data.amenities || [],
        mapUrl: data.mapUrl || "",
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
