import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { isValidUkrainianPhone, normalizePhone } from "@/lib/phone";
import {
  mergeMonthlyGuestPrices,
  parseMonthlyNonNegative,
} from "@/lib/monthlyPricing";
import { getAdminEmail } from "@/lib/adminAuth";
import { writeAuditLog } from "@/lib/admin/audit";
import {
  filterPersistableImages,
  getInvalidImageMessage,
} from "@/lib/validateApartmentImages";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const ALLOWED_CITIES = new Set(["Черноморск", "Санжейка"]);

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
    const city = data.city?.toString().trim() || "";
    const seaDistanceMin =
      data.seaDistanceMin === null || data.seaDistanceMin === undefined
        ? null
        : Number(data.seaDistanceMin);
    const seaDistanceMax =
      data.seaDistanceMax === null || data.seaDistanceMax === undefined
        ? null
        : Number(data.seaDistanceMax);

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
    if (!ALLOWED_CITIES.has(city)) {
      return NextResponse.json(
        { error: "Доступні міста: Черноморск або Санжейка" },
        { status: 400 },
      );
    }
    if (
      seaDistanceMin !== null &&
      (!Number.isInteger(seaDistanceMin) || seaDistanceMin < 1)
    ) {
      return NextResponse.json(
        { error: "Мінімальна відстань до моря має бути цілим числом від 1" },
        { status: 400 },
      );
    }
    if (
      seaDistanceMax !== null &&
      (!Number.isInteger(seaDistanceMax) || seaDistanceMax < 1)
    ) {
      return NextResponse.json(
        { error: "Максимальна відстань до моря має бути цілим числом від 1" },
        { status: 400 },
      );
    }
    if (
      seaDistanceMin !== null &&
      seaDistanceMax !== null &&
      seaDistanceMin > seaDistanceMax
    ) {
      return NextResponse.json(
        { error: "Мінімальна відстань не може бути більшою за максимальну" },
        { status: 400 },
      );
    }

    const floor =
      data.floor === null || data.floor === undefined || data.floor === ""
        ? null
        : Number(data.floor);
    const totalFloors =
      data.totalFloors === null ||
      data.totalFloors === undefined ||
      data.totalFloors === ""
        ? null
        : Number(data.totalFloors);
    const videoTourUrlRaw =
      typeof data.videoTourUrl === "string" ? data.videoTourUrl.trim() : "";
    const videoTourUrl = videoTourUrlRaw.length > 0 ? videoTourUrlRaw : null;

    if (floor !== null && (!Number.isInteger(floor) || floor < 1)) {
      return NextResponse.json(
        { error: "Поверх квартири має бути цілим числом від 1" },
        { status: 400 },
      );
    }
    if (
      totalFloors !== null &&
      (!Number.isInteger(totalFloors) || totalFloors < 1)
    ) {
      return NextResponse.json(
        { error: "Кількість поверхів у будинку має бути цілим числом від 1" },
        { status: 400 },
      );
    }
    if (floor !== null && totalFloors !== null && floor > totalFloors) {
      return NextResponse.json(
        {
          error:
            "Поверх квартири не може бути більшим за загальну кількість поверхів у будинку",
        },
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

    const rawImages: string[] = Array.isArray(data.images)
      ? data.images.filter((x: unknown): x is string => typeof x === "string")
      : [];
    const invalidMsg = getInvalidImageMessage(rawImages);
    if (invalidMsg) {
      return NextResponse.json({ error: invalidMsg }, { status: 400 });
    }
    const images = filterPersistableImages(rawImages);

    const apartmentData = {
        title: data.title,
        type: data.type || "apartment",
        category: data.category?.toUpperCase() || "EXCLUSIVE",
        city,
        address: data.address || "",
        seaDistanceMin,
        seaDistanceMax,
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
        images,
        amenities: data.amenities || [],
        mapUrl: data.mapUrl || "",
        floor,
        totalFloors,
        videoTourUrl,
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
      };

    const apartment = await prisma.apartment.create({
      data: apartmentData as any,
    });

    const adminEmail = (await getAdminEmail()) ?? "admin";
    await writeAuditLog({
      adminEmail,
      entityType: "apartment",
      entityId: apartment.id,
      action: "create",
      summary: `Додано квартиру: ${apartment.title}`,
    });

    return NextResponse.json(apartment, { status: 201 });
  } catch (error) {
    console.error("Create error:", error);
    return NextResponse.json({ error: "Помилка створення" }, { status: 500 });
  }
}
