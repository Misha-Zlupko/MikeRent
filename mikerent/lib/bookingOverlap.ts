import { prisma } from "@/lib/prisma";
import { INACTIVE_BOOKING_STATUSES } from "@/lib/bookingStatus";

export async function hasOverlappingActiveBooking(params: {
  apartmentId: string;
  dateFrom: Date;
  dateTo: Date;
  excludeBookingId?: string;
}): Promise<boolean> {
  const conflict = await prisma.booking.findFirst({
    where: {
      apartmentId: params.apartmentId,
      ...(params.excludeBookingId
        ? { id: { not: params.excludeBookingId } }
        : {}),
      status: { notIn: [...INACTIVE_BOOKING_STATUSES] },
      dateFrom: { lt: params.dateTo },
      dateTo: { gt: params.dateFrom },
    },
    select: { id: true },
  });
  return conflict != null;
}
