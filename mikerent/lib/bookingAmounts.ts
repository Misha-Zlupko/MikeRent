/**
 * У адмін-формі бронювання суми вводяться в гривнях, у БД зберігаються поділені на цей коефіцієнт
 * (історична схема в BookingForm). Для таблиць / звітів множимо назад у гривні.
 */
export const BOOKING_AMOUNT_UAH_FACTOR = 42;

export function bookingStoredToUah(
  value: number | null | undefined,
): number | null {
  if (value == null) return null;
  if (!Number.isFinite(value)) return null;
  return Math.round(value * BOOKING_AMOUNT_UAH_FACTOR * 100) / 100;
}

export function uahToBookingStored(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return value / BOOKING_AMOUNT_UAH_FACTOR;
}
