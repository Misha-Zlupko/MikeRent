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

  pricePerNight: number;

  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;

  images: string[];

  description: string;

  mapUrl: string;
  amenities: string[];

  availability: ApartmentAvailability;
};
