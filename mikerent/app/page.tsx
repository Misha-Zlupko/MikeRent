/** Кеш сторінки: оновлення цін і броней щохвилини */
export const revalidate = 60;

import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import type { Apartment } from "@/data/ApartmentsTypes";
import { HomeClient } from "@/components/HomeClient";
import { INACTIVE_BOOKING_STATUSES } from "@/lib/bookingStatus";
import { toHomeApartmentPayload } from "@/lib/homeApartmentPayload";

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

  return dbApartments.map(toHomeApartmentPayload);
}

export default async function Home() {
  const apartments = await getApartments();
  return <HomeClient apartments={apartments} />;
}
