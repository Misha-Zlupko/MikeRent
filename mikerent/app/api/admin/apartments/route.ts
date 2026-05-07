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
          booked: [],
          monthlyOwnerPrices,
          monthlyMarkups,
          monthlyPrices,
        },
      },
    });

    return NextResponse.json(apartment, { status: 201 });
  } catch (error) {
    console.error("Create error:", error);
    return NextResponse.json({ error: "Помилка створення" }, { status: 500 });
  }
}
