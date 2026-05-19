export const revalidate = 60;

import dynamic from "next/dynamic";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { cache } from "react";
import { ApartmentHeader } from "@/components/apartment/ApartmentHeaderComponent";
import { ApartmentContent } from "@/components/apartment/ApartmentContentComponent";
import { ApartmentMapComponent } from "@/components/apartment/ApartmentMapComponent";
import { ApartmentVideoTour } from "@/components/apartment/ApartmentVideoTour";
import {
  BookingCardSkeleton,
  GallerySkeleton,
} from "@/components/apartment/ApartmentPageSkeletons";
import { LazyWhenVisible } from "@/components/ui/LazyWhenVisible";
import { resolveGuestMonthlyPrices } from "@/lib/monthlyPricing";
import { INACTIVE_BOOKING_STATUSES } from "@/lib/bookingStatus";

const ApartmentGallery = dynamic(
  () =>
    import("@/components/apartment/ApartmentGalleryComponent").then(
      (m) => m.ApartmentGallery,
    ),
  { loading: () => <GallerySkeleton /> },
);

const ApartmentBookingCard = dynamic(
  () =>
    import("@/components/apartment/ApartmentBookingCardComponent").then(
      (m) => m.ApartmentBookingCard,
    ),
  { loading: () => <BookingCardSkeleton /> },
);

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
      seaDistanceMin: true,
      seaDistanceMax: true,
      description: true,
      images: true,
      mapUrl: true,
      pricePerNight: true,
      guests: true,
      bedrooms: true,
      beds: true,
      bathrooms: true,
      floor: true,
      totalFloors: true,
      videoTourUrl: true,
      amenities: true,
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
});

export async function generateStaticParams() {
  const rows = await prisma.apartment.findMany({
    select: { id: true },
  });
  return rows.map((row) => ({ id: row.id }));
}

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

  const booked = apartment.bookings.map((b) => ({
    from: b.dateFrom.toISOString().slice(0, 10),
    to: b.dateTo.toISOString().slice(0, 10),
  }));

  return (
    <main className="bg-gradient-to-b from-slate-50 to-white">
      <section className="container py-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-10 lg:gap-8">
          <div className="space-y-6 lg:col-span-7">
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
                seaDistanceMin: apartment.seaDistanceMin,
                seaDistanceMax: apartment.seaDistanceMax,
              }}
            />
            {apartment.videoTourUrl ? (
              <LazyWhenVisible minHeight={200} rootMargin="300px 0px">
                <ApartmentVideoTour videoTourUrl={apartment.videoTourUrl} />
              </LazyWhenVisible>
            ) : null}
            <LazyWhenVisible minHeight={280} rootMargin="300px 0px">
              <ApartmentMapComponent
                apartment={{
                  address: apartment.address,
                  mapUrl: apartment.mapUrl ?? null,
                }}
              />
            </LazyWhenVisible>
            <ApartmentContent
              apartment={{
                guests: apartment.guests,
                bedrooms: apartment.bedrooms,
                beds: apartment.beds,
                bathrooms: apartment.bathrooms,
                floor: apartment.floor,
                totalFloors: apartment.totalFloors,
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
                  booked,
                  monthlyPrices: resolveGuestMonthlyPrices(
                    apartment.availability,
                  ),
                },
              }}
            />
          </aside>
        </div>
      </section>
    </main>
  );
}
