/** Кеш сторінки: оновлення цін і броней щохвилини */
export const revalidate = 60;

import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import type { Apartment, DateRangeISO } from "@/data/ApartmentsTypes";
import { HomeClient } from "@/components/HomeClient";
import { resolveGuestMonthlyPrices } from "@/lib/monthlyPricing";
import { INACTIVE_BOOKING_STATUSES } from "@/lib/bookingStatus";

export const metadata: Metadata = {
  title: "Подобова оренда житла у місті Чорноморськ",
  description:
    "Знайдіть та забронюйте квартиру, будинок або кімнату в Чорноморську. Реальні фото, актуальні ціни та швидке підтвердження.",
  alternates: {
    canonical: "/",
  },
};

async function getApartments(): Promise<Apartment[]> {
  const dbApartments = await prisma.apartment.findMany({
    select: {
      id: true,
      title: true,
      type: true,
      city: true,
      address: true,
      pricePerNight: true,
      guests: true,
      beds: true,
      images: true,
      seaDistanceMin: true,
      seaDistanceMax: true,
      availability: true,
      bookings: {
        where: { status: { notIn: [...INACTIVE_BOOKING_STATUSES] } },
        select: {
          dateFrom: true,
          dateTo: true,
        },
      },
    },
  });

  return dbApartments.map((a) => {
    const availability = (a.availability ?? {}) as {
      season?: { from?: string; to?: string };
    };
    return {
      id: a.id,
      title: a.title,
      type: a.type.toLowerCase() as Apartment["type"],
      city: a.city,
      address: a.address,
      pricePerNight: a.pricePerNight,
      guests: a.guests,
      bedrooms: 0,
      beds: a.beds,
      bathrooms: 0,
      images: a.images,
      description: "",
      mapUrl: "",
      amenities: [],
      floor: null,
      totalFloors: null,
      videoTourUrl: null,
      seaDistanceMin: a.seaDistanceMin,
      seaDistanceMax: a.seaDistanceMax,
      availability: {
        season: {
          from: availability.season?.from || "",
          to: availability.season?.to || "",
        } as DateRangeISO,
        booked: a.bookings.map((b) => ({
          from: b.dateFrom?.toISOString().slice(0, 10) || "",
          to: b.dateTo?.toISOString().slice(0, 10) || "",
        })),
        monthlyPrices: resolveGuestMonthlyPrices(a.availability),
      },
    };
  });
}

export default async function Home() {
  const apartments = await getApartments();
  return <HomeClient apartments={apartments} />;
}
