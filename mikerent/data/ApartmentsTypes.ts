export type ApartmentType = "apartment" | "house" | "room";

export type DateRangeISO = {
  from: string;
  to: string;
};

export type ApartmentAvailability = {
  season: DateRangeISO;
  booked: DateRangeISO[];
  monthlyPrices?: Record<string, number>;
  monthlyOwnerPrices?: Record<string, number>;
  monthlyMarkups?: Record<string, number>;
};

export type Amenity =
  | "wifi"
  | "airConditioner"
  | "kitchen"
  | "dishes"
  | "washingMachine"
  | "tv"
  | "parking"
  | "balcony"
  | "seaView"
  | "pool"
  | "robotVacuum";

export type Apartment = {
  id: string;
  title: string;
  type: ApartmentType;

  city: string;
  address: string;
  seaDistanceMin?: number | null;
  seaDistanceMax?: number | null;

  pricePerNight: number;

  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;

  images: string[];
  /** Скільки фото в об'єкті (для бейджа на головній, якщо в images лише обкладинка) */
  photoCount?: number;

  description: string;

  mapUrl: string;
  amenities: string[];

  floor?: number | null;
  totalFloors?: number | null;
  videoTourUrl?: string | null;

  availability: ApartmentAvailability;
};
