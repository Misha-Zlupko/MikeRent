/** Бронювання з цими статусами не блокують календар і не враховуються в перетинах дат. */
export const INACTIVE_BOOKING_STATUSES = ["CANCELLED", "REJECTED"] as const;

export function isActiveBookingStatus(status: string): boolean {
  return !INACTIVE_BOOKING_STATUSES.includes(
    status as (typeof INACTIVE_BOOKING_STATUSES)[number],
  );
}
