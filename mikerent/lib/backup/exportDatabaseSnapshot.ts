import type { PrismaClient } from "@prisma/client";

export type DatabaseSnapshot = {
  exportedAt: string;
  version: 1;
  counts: {
    apartments: number;
    bookings: number;
    bookingRequests: number;
    testimonials: number;
  };
  data: {
    apartments: Awaited<ReturnType<PrismaClient["apartment"]["findMany"]>>;
    bookings: Awaited<ReturnType<PrismaClient["booking"]["findMany"]>>;
    bookingRequests: Awaited<
      ReturnType<PrismaClient["bookingRequest"]["findMany"]>
    >;
    testimonials: Awaited<ReturnType<PrismaClient["testimonial"]["findMany"]>>;
  };
};

/** Повний знімок бізнес-даних для резервної копії. */
export async function exportDatabaseSnapshot(
  prisma: PrismaClient,
): Promise<DatabaseSnapshot> {
  const [apartments, bookings, bookingRequests, testimonials] =
    await Promise.all([
      prisma.apartment.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.booking.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.bookingRequest.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.testimonial.findMany({ orderBy: { createdAt: "asc" } }),
    ]);

  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    counts: {
      apartments: apartments.length,
      bookings: bookings.length,
      bookingRequests: bookingRequests.length,
      testimonials: testimonials.length,
    },
    data: {
      apartments,
      bookings,
      bookingRequests,
      testimonials,
    },
  };
}
