export type ApartmentType = "apartment" | "house" | "room";

export type DateRangeISO = {
  from: string;
  to: string;
};

export type ApartmentAvailability = {
  season: DateRangeISO;
  booked: DateRangeISO[];
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
  | "pool";

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

  mapUrl: string;
  amenities: Amenity[]; 


  availability: ApartmentAvailability;
};
