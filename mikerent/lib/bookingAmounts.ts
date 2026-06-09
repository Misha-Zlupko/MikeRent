/**
 * У адмін-формі бронювання суми вводяться в гривнях, у БД зберігаються поділені на цей коефіцієнт.
 * Броні з сайту (підтвердження заявки) історично могли зберігати totalAmount одразу в гривнях.
 */
export const BOOKING_AMOUNT_UAH_FACTOR = 42;

export type BookingMoneyFields = {
  totalAmount: number | null;
  ownerPayout?: number | null;
  ourProfit?: number | null;
  prepaidToMe?: number | null;
  prepaidToOwner?: number | null;
};

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

/** Чи суми в рядку збережені у «адмінському» форматі (/42), а не в гривнях напряму */
export function isScaledBookingStorage(booking: BookingMoneyFields): boolean {
  const splitFields = [
    booking.ownerPayout,
    booking.ourProfit,
    booking.prepaidToMe,
    booking.prepaidToOwner,
  ];
  if (splitFields.some((v) => v != null && v > 0)) return true;

  const total = booking.totalAmount;
  if (total == null || total <= 0) return true;

  // Старі броні з сайту: ціле число гривень (зазвичай ≥ 1000)
  if (total >= 1000 && Number.isInteger(total)) return false;

  // Адмін / нові підтвердження: сума ÷ 42 (часто дробове або < 1000)
  return true;
}

function fieldToUah(value: number | null | undefined, scaled: boolean): number {
  if (value == null || !Number.isFinite(value)) return 0;
  if (scaled) return bookingStoredToUah(value) ?? 0;
  return Math.round(value * 100) / 100;
}

/** Усі грошові поля броні в гривнях (UAH) з урахуванням двох форматів збереження */
export function bookingMoneyToUah(booking: BookingMoneyFields) {
  const scaled = isScaledBookingStorage(booking);
  return {
    scaled,
    clientTotal: fieldToUah(booking.totalAmount, scaled),
    ownerPayout: fieldToUah(booking.ownerPayout, scaled),
    ourProfit: fieldToUah(booking.ourProfit, scaled),
    prepaidToMe: fieldToUah(booking.prepaidToMe, scaled),
    prepaidToOwner: fieldToUah(booking.prepaidToOwner, scaled),
  };
}
