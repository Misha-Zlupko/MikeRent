import { calendarDateKyiv } from "@/lib/dates/ukraine";

export type BookingTripPhase = "completed" | "active" | "upcoming";

/** Фаза поїздки за календарем Києва (як у списку бронювань) */
export function getBookingTripPhase(
  dateFrom: Date,
  dateTo: Date,
  now = new Date(),
): BookingTripPhase {
  const today = calendarDateKyiv(now);
  const fromDay = calendarDateKyiv(dateFrom);
  const toDay = calendarDateKyiv(dateTo);

  if (toDay < today) return "completed";
  if (fromDay > today) return "upcoming";
  return "active";
}
