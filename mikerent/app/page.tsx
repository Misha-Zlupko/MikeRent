export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import type { Apartment, DateRangeISO } from "@/data/ApartmentsTypes";
import { HomeClient } from "@/components/HomeClient";

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
      bedrooms: true,
      beds: true,
      bathrooms: true,
      images: true,
      description: true,
      mapUrl: true,
      amenities: true,
      bookings: {
        select: {
          dateFrom: true,
          dateTo: true,
        },
      },
    },
  });

  return dbApartments.map((a) => ({
    id: a.id,
    title: a.title,
    type: a.type.toLowerCase() as Apartment["type"],
    city: a.city,
    address: a.address,
    pricePerNight: a.pricePerNight,
    guests: a.guests,
    bedrooms: a.bedrooms,
    beds: a.beds,
    bathrooms: a.bathrooms,
    images: a.images,
    description: a.description,
    mapUrl: a.mapUrl,
    amenities: a.amenities,
    availability: {
      season: {
        from: (a as any).seasonFrom?.toISOString().slice(0, 10) || "",
        to: (a as any).seasonTo?.toISOString().slice(0, 10) || "",
      } as DateRangeISO,
      booked: a.bookings.map((b) => ({
        from: b.dateFrom?.toISOString().slice(0, 10) || "",
        to: b.dateTo?.toISOString().slice(0, 10) || "",
      })),
    },
  }));
}

export default async function Home() {
  const apartments = await getApartments();
  return <HomeClient apartments={apartments} />;
}
