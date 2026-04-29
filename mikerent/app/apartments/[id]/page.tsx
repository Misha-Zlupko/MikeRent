export const revalidate = 120;

import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { cache } from "react";
import { ApartmentHeader } from "@/components/apartment/ApartmentHeaderComponent";
import { ApartmentGallery } from "@/components/apartment/ApartmentGalleryComponent";
import { ApartmentContent } from "@/components/apartment/ApartmentContentComponent";
import { ApartmentBookingCard } from "@/components/apartment/ApartmentBookingCardComponent";
import { ApartmentMapComponent } from "@/components/apartment/ApartmentMapComponent";

type PageProps = {
  params: Promise<{ id: string }>;
};

const getApartmentById = cache(async (id: string) => {
  return prisma.apartment.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      city: true,
      address: true,
      description: true,
      images: true,
      mapUrl: true,
      pricePerNight: true,
      guests: true,
      bedrooms: true,
      beds: true,
      bathrooms: true,
      amenities: true,
      bookings: {
        select: {
          dateFrom: true,
          dateTo: true,
        },
      },
    },
  });
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const apartment = await getApartmentById(id);

  if (!apartment) {
    return {
      title: "Квартира не знайдена",
      description: "Схоже, ця сторінка більше не доступна.",
    };
  }

  const pageTitle = `${apartment.title} - подобова оренда в ${apartment.city}`;
  const pageDescription =
    apartment.description?.slice(0, 160) ||
    `Оренда житла: ${apartment.title}, ${apartment.address}, ${apartment.city}.`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: `/apartments/${id}`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: "article",
      url: `/apartments/${id}`,
      images: apartment.images?.[0]
        ? [{ url: apartment.images[0], alt: apartment.title }]
        : undefined,
    },
  };
}

export default async function ApartmentPage({ params }: PageProps) {
  const { id } = await params;
  const apartment = await getApartmentById(id);

  if (!apartment) {
    return null;
  }
  return (
    <main className="container py-8">
      <section className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <ApartmentHeader
            apartment={{
              id: apartment.id,
              title: apartment.title,
              address: apartment.address,
              mapUrl: apartment.mapUrl ?? null,
            }}
          />
          <ApartmentGallery
            apartment={{
              id: apartment.id,
              title: apartment.title,
              images: apartment.images ?? [],
            }}
          />
          <ApartmentMapComponent
            apartment={{
              address: apartment.address,
              mapUrl: apartment.mapUrl ?? null,
            }}
          />
          <ApartmentContent
            apartment={{
              guests: apartment.guests,
              bedrooms: apartment.bedrooms,
              beds: apartment.beds,
              bathrooms: apartment.bathrooms,
              description: apartment.description,
              amenities: apartment.amenities ?? [],
            }}
          />
        </div>

        <aside className="lg:col-span-3">
          <ApartmentBookingCard
            apartment={{
              id: apartment.id,
              title: apartment.title,
              pricePerNight: apartment.pricePerNight,
              guests: apartment.guests,
              availability: {
                booked: apartment.bookings.map((b) => ({
                  from: b.dateFrom.toISOString().slice(0, 10),
                  to: b.dateTo.toISOString().slice(0, 10),
                })),
              },
            }}
          />
        </aside>
      </section>
    </main>
  );
}
