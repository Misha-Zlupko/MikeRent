/** Календарні дні бронювань — як у адмінці (Europe/Kyiv), без зміни даних у БД. */
export const BOOKING_CALENDAR_TIMEZONE = "Europe/Kyiv";

export function bookingDateToCalendarIso(d: Date): string {
  return d.toLocaleDateString("en-CA", {
    timeZone: BOOKING_CALENDAR_TIMEZONE,
  });
}

export function bookingRangeToCalendarIso(
  dateFrom: Date,
  dateTo: Date,
): { from: string; to: string } {
  return {
    from: bookingDateToCalendarIso(dateFrom),
    to: bookingDateToCalendarIso(dateTo),
  };
}

/** YYYY-MM-DD як локальний календарний день (без зсуву UTC). */
export function parseCalendarDate(iso: string): Date {
  const [y, m, day] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, day);
}
