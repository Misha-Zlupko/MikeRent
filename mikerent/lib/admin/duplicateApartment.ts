import type { Apartment, Prisma } from "@prisma/client";

function shiftIsoDate(iso: string, years: number): string {
  if (!iso || iso.length < 10) return iso;
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d.toISOString().slice(0, 10);
}

export function buildDuplicatedApartmentData(source: Apartment, targetYear?: number) {
  const year =
    targetYear ??
    (() => {
      const avail = source.availability as { season?: { from?: string } } | null;
      const from = avail?.season?.from;
      if (from && from.length >= 4) return Number(from.slice(0, 4)) + 1;
      return new Date().getFullYear() + 1;
    })();

  let availability: Prisma.InputJsonValue | undefined = source.availability as
    | Prisma.InputJsonValue
    | undefined;
  if (availability && typeof availability === "object" && !Array.isArray(availability)) {
    const a = { ...(availability as Record<string, unknown>) };
    if (a.season && typeof a.season === "object") {
      const s = a.season as { from?: string; to?: string };
      a.season = {
        from: shiftIsoDate(s.from ?? `${year}-05-01`, 1),
        to: shiftIsoDate(s.to ?? `${year}-09-30`, 1),
      };
    }
    a.booked = [];
    availability = a as Prisma.InputJsonValue;
  }

  return {
    title: `${source.title} (${year})`,
    type: source.type,
    category: source.category,
    city: source.city,
    address: source.address,
    seaDistanceMin: source.seaDistanceMin,
    seaDistanceMax: source.seaDistanceMax,
    ownerName: source.ownerName,
    ownerPhone: source.ownerPhone,
    ownerPrice: source.ownerPrice,
    markup: source.markup,
    pricePerNight: source.pricePerNight,
    guests: source.guests,
    bedrooms: source.bedrooms,
    beds: source.beds,
    bathrooms: source.bathrooms,
    images: [...source.images],
    description: source.description,
    mapUrl: source.mapUrl,
    amenities: [...source.amenities],
    floor: source.floor,
    totalFloors: source.totalFloors,
    videoTourUrl: source.videoTourUrl,
    availability,
  };
}
