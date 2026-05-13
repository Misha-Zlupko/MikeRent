import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const apartments = await prisma.apartment.findMany({
    select: {
      id: true,
      title: true,
      type: true,
      category: true,
      city: true,
      address: true,
      seaDistanceMin: true,
      seaDistanceMax: true,
      pricePerNight: true,
      guests: true,
      bedrooms: true,
      beds: true,
      bathrooms: true,
      images: true,
      description: true,
      mapUrl: true,
      amenities: true,
      availability: true,
      createdAt: true,
      updatedAt: true,
      lastCalledAt: true,
      floor: true,
      totalFloors: true,
      videoTourUrl: true,
    },
  });
  return NextResponse.json(apartments, {
    headers: {
      "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
    },
  });
}

