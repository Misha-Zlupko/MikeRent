import type { BookingRecordType, Prisma } from "@prisma/client";

export type ExternalBookingRecordType = Extract<
  BookingRecordType,
  "OWNER" | "EXTERNAL"
>;

export const BOOKING_RECORD_TYPE_LABELS: Record<BookingRecordType, string> = {
  AGENCY: "Мої клієнти",
  OWNER: "Сам хазяїн",
  EXTERNAL: "Інший рієлтор",
};

export function isAgencyBooking(recordType: BookingRecordType): boolean {
  return recordType === "AGENCY";
}

export function isExternalOccupancy(recordType: BookingRecordType): boolean {
  return recordType === "OWNER" || recordType === "EXTERNAL";
}

export const agencyBookingWhere: Prisma.BookingWhereInput = {
  recordType: "AGENCY",
};

export function parseBookingRecordType(
  value: unknown,
): BookingRecordType | null {
  if (value === "AGENCY" || value === "OWNER" || value === "EXTERNAL") {
    return value;
  }
  return null;
}
