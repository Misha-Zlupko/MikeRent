import { prisma } from "@/lib/prisma";
import { normalizeGuestPhone } from "@/lib/phone";

export async function upsertGuestFromBooking(params: {
  guestPhone?: string | null;
  guestName?: string | null;
  guestNotes?: string | null;
}) {
  const phone = params.guestPhone?.trim();
  if (!phone) return null;
  const phoneNormalized = normalizeGuestPhone(phone);
  if (phoneNormalized.length < 9) return null;

  const name = params.guestName?.trim() || undefined;
  const notes = params.guestNotes?.trim();

  return prisma.guest.upsert({
    where: { phoneNormalized },
    create: {
      phoneNormalized,
      name: name ?? null,
      notes: notes ?? null,
    },
    update: {
      ...(name ? { name } : {}),
      ...(notes !== undefined && notes !== "" ? { notes } : {}),
    },
  });
}

export async function findGuestByPhone(phone: string) {
  const phoneNormalized = normalizeGuestPhone(phone);
  if (phoneNormalized.length < 9) return null;
  return prisma.guest.findUnique({ where: { phoneNormalized } });
}

export async function findPastBookingsByPhone(
  phone: string,
  excludeBookingId?: string,
) {
  const digits = normalizeGuestPhone(phone);
  if (digits.length < 9) return [];

  const bookings = await prisma.booking.findMany({
    where: {
      recordType: "AGENCY",
      ...(excludeBookingId ? { NOT: { id: excludeBookingId } } : {}),
    },
    include: { apartment: { select: { title: true, city: true } } },
    orderBy: { dateFrom: "desc" },
    take: 200,
  });

  return bookings.filter((b) => {
    if (!b.guestPhone) return false;
    return normalizeGuestPhone(b.guestPhone) === digits;
  });
}
