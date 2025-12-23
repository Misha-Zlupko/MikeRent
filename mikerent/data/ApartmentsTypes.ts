export type ApartmentType = "apartment" | "house" | "room";

export type DateRangeISO = {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
};

export type ApartmentAvailability = {
  season: DateRangeISO;
  booked: DateRangeISO[];
};

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

  rating: number;
  reviewsCount: number;

  description: string;

  availability: ApartmentAvailability;
};
