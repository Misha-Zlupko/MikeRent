import { prisma } from "@/lib/prisma";
import type { Apartment, DateRangeISO } from "@/data/ApartmentsTypes";
import { HomeClient } from "@/components/HomeClient";

async function getApartments(): Promise<Apartment[]> {
  const dbApartments = await prisma.apartment.findMany({
    include: { bookings: true },
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
    rating: a.rating,
    reviewsCount: a.reviewsCount,
    description: a.description,
    mapUrl: a.mapUrl,
    amenities: a.amenities,
    availability: {
      season: {
        // 👇 ВИПРАВЛЕНО: додано перевірку через ?.
        from: a.seasonFrom?.toISOString().slice(0, 10) || "",
        to: a.seasonTo?.toISOString().slice(0, 10) || "",
      } as DateRangeISO,
      booked: a.bookings.map((b) => ({
        // 👇 ВИПРАВЛЕНО: додано перевірку через ?.
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
