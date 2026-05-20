import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditApartmentForm from "./EditApartmentForm";
import {
  extractMonthlyMarkups,
  extractMonthlyOwnerPrices,
  extractMonthlyPrices,
} from "@/lib/monthlyPricing";
import { isActiveBookingStatus } from "@/lib/bookingStatus";
import { bookingRangeToCalendarIso } from "@/lib/bookingCalendarDates";
import { isExternalOccupancy } from "@/lib/bookingRecordType";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditApartmentPage({ params }: PageProps) {
  const { id } = await params;

  const apartment = await prisma.apartment.findUnique({
    where: { id },
    include: {
      bookings: true,
    },
  });

  if (!apartment) {
    notFound();
  }

  // Перетворюємо дати в рядки для форми
  const apartmentWithStrings = {
    ...apartment,
    seasonFrom:
      ((apartment.availability as { season?: { from?: string } } | null)?.season
        ?.from as string) || "",
    seasonTo:
      ((apartment.availability as { season?: { to?: string } } | null)?.season
        ?.to as string) || "",
    monthlyOwnerPrices: extractMonthlyOwnerPrices(apartment.availability),
    monthlyMarkups: extractMonthlyMarkups(apartment.availability),
    monthlyPrices: extractMonthlyPrices(apartment.availability),
    externalOccupancy: apartment.bookings
      .filter(
        (b) =>
          isActiveBookingStatus(b.status) && isExternalOccupancy(b.recordType),
      )
      .map((b) => ({
        ...bookingRangeToCalendarIso(b.dateFrom, b.dateTo),
        recordType: b.recordType as "OWNER" | "EXTERNAL",
      })),
  };
  return <EditApartmentForm apartment={apartmentWithStrings} />;
}
