import type { Apartment, ApartmentType, DateRangeISO } from "@/data/ApartmentsTypes";
import { bookingRangeToCalendarIso } from "@/lib/bookingCalendarDates";
import { resolveGuestMonthlyPrices } from "@/lib/monthlyPricing";
import { homeCardImages } from "@/lib/apartmentCoverImage";

type DbApartmentRow = {
  id: string;
  title: string;
  type: string;
  city: string;
  address: string;
  pricePerNight: number;
  guests: number;
  beds: number;
  images: string[];
  coverImageUrl: string | null;
  seaDistanceMin: number | null;
  seaDistanceMax: number | null;
  availability: unknown;
  bookings: { dateFrom: Date; dateTo: Date }[];
};

/** Легкий об’єкт для головної (ISR). Без base64 і без зайвих полів. */
export function toHomeApartmentPayload(a: DbApartmentRow): Apartment {
  const availability = (a.availability ?? {}) as {
    season?: { from?: string; to?: string };
  };

  return {
    id: a.id,
    title: a.title,
    type: a.type.toLowerCase() as ApartmentType,
    city: a.city,
    address: a.address,
    pricePerNight: a.pricePerNight,
    guests: a.guests,
    bedrooms: 0,
    beds: a.beds,
    bathrooms: 0,
    images: homeCardImages(a.coverImageUrl, a.images),
    description: "",
    mapUrl: "",
    amenities: [],
    floor: null,
    totalFloors: null,
    videoTourUrl: null,
    seaDistanceMin: a.seaDistanceMin,
    seaDistanceMax: a.seaDistanceMax,
    availability: {
      season: {
        from: availability.season?.from ?? "",
        to: availability.season?.to ?? "",
      } as DateRangeISO,
      booked: a.bookings.map((b) =>
        bookingRangeToCalendarIso(b.dateFrom, b.dateTo),
      ),
      monthlyPrices: resolveGuestMonthlyPrices(a.availability),
    },
  };
}
