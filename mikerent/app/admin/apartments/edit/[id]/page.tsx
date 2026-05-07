import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditApartmentForm from "./EditApartmentForm";
import {
  extractMonthlyMarkups,
  extractMonthlyOwnerPrices,
  extractMonthlyPrices,
} from "@/lib/monthlyPricing";

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
    bookings: apartment.bookings.map((b) => ({
      from: b.dateFrom.toISOString().slice(0, 10),
      to: b.dateTo.toISOString().slice(0, 10),
    })),
  };
  return <EditApartmentForm apartment={apartmentWithStrings} />;
}
