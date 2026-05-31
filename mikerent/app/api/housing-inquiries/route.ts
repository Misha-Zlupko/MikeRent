import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateHousingInquiryNumber } from "@/lib/housingInquiryNumber";
import { isValidUkrainianPhone, normalizePhone } from "@/lib/phone";
import {
  mapHousingInquiryFromDb,
  notifyHousingInquiryNew,
} from "@/lib/telegramNotify";

const HOUSING_TYPES = ["APARTMENT", "HOUSE", "ROOM", "ANY"] as const;

function parseDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const name = typeof data.name === "string" ? data.name.trim() : "";
    const phone = normalizePhone(String(data.phone ?? ""));
    const comment =
      typeof data.comment === "string" ? data.comment.trim() : null;
    const guests =
      data.guests != null && data.guests !== ""
        ? Number(data.guests)
        : null;
    const housingType = HOUSING_TYPES.includes(data.housingType)
      ? data.housingType
      : "ANY";
    const checkIn = parseDate(data.checkIn);
    const checkOut = parseDate(data.checkOut);
    const withPets = Boolean(data.withPets);
    const petsDetails =
      withPets && typeof data.petsDetails === "string"
        ? data.petsDetails.trim() || null
        : null;

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Вкажіть ваше ім'я" },
        { status: 400 },
      );
    }

    if (!isValidUkrainianPhone(phone)) {
      return NextResponse.json(
        { error: "Вкажіть коректний номер телефону" },
        { status: 400 },
      );
    }

    if (
      checkIn &&
      checkOut &&
      checkOut.getTime() <= checkIn.getTime()
    ) {
      return NextResponse.json(
        { error: "Дата виїзду має бути після дати заїзду" },
        { status: 400 },
      );
    }

    const inquiry = await prisma.housingInquiry.create({
      data: {
        inquiryNumber: generateHousingInquiryNumber(),
        name,
        phone,
        checkIn,
        checkOut,
        adults: guests && guests > 0 ? Math.floor(guests) : 1,
        children: 0,
        propertyType: housingType,
        hasPets: withPets,
        petsDescription: petsDetails,
        notes: comment || null,
      },
    });

    let telegramSent = false;

    try {
      telegramSent = await notifyHousingInquiryNew(
        mapHousingInquiryFromDb(inquiry),
      );
    } catch (error) {
      console.error("Telegram housing inquiry notify error:", error);
    }

    return NextResponse.json(
      {
        success: true,
        inquiryNumber: inquiry.inquiryNumber,
        telegramSent,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create housing inquiry error:", error);
    return NextResponse.json(
      { error: "Помилка відправки запиту" },
      { status: 500 },
    );
  }
}
