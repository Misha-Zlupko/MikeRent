import { prisma } from "@/lib/prisma";
import { ApartmentHeader } from "@/components/apartment/ApartmentHeaderComponent";
import { ApartmentGallery } from "@/components/apartment/ApartmentGalleryComponent";
import { ApartmentContent } from "@/components/apartment/ApartmentContentComponent";
import { ApartmentBookingCard } from "@/components/apartment/ApartmentBookingCardComponent";
import { ApartmentMapComponent } from "@/components/apartment/ApartmentMapComponent";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ApartmentPage({ params }: PageProps) {
  const { id } = await params;

  const apartment = await prisma.apartment.findUnique({
    where: { id },
    include: { bookings: true },
  });

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
              rating: apartment.rating,
              reviewsCount: apartment.reviewsCount,
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
