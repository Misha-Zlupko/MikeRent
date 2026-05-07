import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { isValidUkrainianPhone, normalizePhone } from "@/lib/phone";
import {
  mergeMonthlyGuestPrices,
  parseMonthlyNonNegative,
} from "@/lib/monthlyPricing";

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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // ← Додай Promise
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params; // ← Додай await

    // Спочатку видаляємо всі бронювання
    await prisma.booking.deleteMany({
      where: { apartmentId: id }, // ← використовуй id
    });

    // Потім видаляємо квартиру
    await prisma.apartment.delete({
      where: { id: id }, // ← використовуй id
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Помилка видалення" }, { status: 500 });
  }
}

// GET /api/admin/apartments/[id]
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // ← Додай Promise
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params; // ← Додай await

    const apartment = await prisma.apartment.findUnique({
      where: { id: id }, // ← використовуй id
      include: { bookings: true },
    });

    if (!apartment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(apartment);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Помилка завантаження" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/apartments/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
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

    const monthlyOwnerPrices = parseMonthlyNonNegative(data.monthlyOwnerPrices);
    const monthlyMarkups = parseMonthlyNonNegative(data.monthlyMarkups);
    const monthlyPrices = mergeMonthlyGuestPrices(
      monthlyOwnerPrices,
      monthlyMarkups,
    );
    if (Object.keys(monthlyPrices).length === 0) {
      return NextResponse.json(
        {
          error:
            "Вкажіть хоча б для одного місяця ціну власника та/або націнку (сума має бути більше 0)",
        },
        { status: 400 },
      );
    }
    const ownerVals = Object.values(monthlyOwnerPrices);
    const markupVals = Object.values(monthlyMarkups);
    const guestVals = Object.values(monthlyPrices);
    const ownerPrice = ownerVals.length ? Math.max(...ownerVals) : 0;
    const markup = markupVals.length ? Math.max(...markupVals) : 0;
    const pricePerNight = guestVals.length ? Math.max(...guestVals) : 0;

    const existing = await prisma.apartment.findUnique({
      where: { id },
      select: { availability: true },
    });
    const prevBooked =
      existing?.availability &&
      typeof existing.availability === "object" &&
      "booked" in existing.availability
        ? (existing.availability as { booked?: unknown }).booked
        : [];

    const apartment = await prisma.apartment.update({
      where: { id },
      data: {
        title: data.title,
        type: data.type?.toUpperCase() || "APARTMENT",
        category: data.category?.toUpperCase() || "EXCLUSIVE",
        city: data.city,
        address: data.address || "",
        ownerName,
        ownerPhone: normalizePhone(ownerPhone),
        ownerPrice,
        markup,
        pricePerNight,
        guests: Number(data.guests) || 2,
        bedrooms: Number(data.bedrooms) || 1,
        beds: Number(data.beds) || Number(data.bedrooms) || 1,
        bathrooms: Number(data.bathrooms) || 1,
        description: data.description || "",
        images: data.images || [],
        amenities: data.amenities || [],
        mapUrl: data.mapUrl || "",
        // 👇 ЗАМІСТЬ seasonFrom/seasonTo ВИКОРИСТОВУЄМО availability
        availability: {
          season: {
            from:
              data.seasonFrom instanceof Date
                ? data.seasonFrom.toISOString().slice(0, 10)
                : typeof data.seasonFrom === "string"
                  ? data.seasonFrom.slice(0, 10)
                  : "",
            to:
              data.seasonTo instanceof Date
                ? data.seasonTo.toISOString().slice(0, 10)
                : typeof data.seasonTo === "string"
                  ? data.seasonTo.slice(0, 10)
                  : "",
          },
          booked: Array.isArray(data.bookings) ? data.bookings : prevBooked ?? [],
          monthlyOwnerPrices,
          monthlyMarkups,
          monthlyPrices,
        },
      },
    });

    return NextResponse.json(apartment);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Помилка оновлення" }, { status: 500 });
  }
}
