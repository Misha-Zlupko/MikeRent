import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditApartmentForm from "./EditApartmentForm";

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
    seasonFrom: (apartment as any).seasonFrom?.toISOString().slice(0, 10) || "",
    seasonTo: (apartment as any).seasonTo?.toISOString().slice(0, 10) || "",
    bookings: apartment.bookings.map((b) => ({
      from: b.dateFrom.toISOString().slice(0, 10),
      to: b.dateTo.toISOString().slice(0, 10),
    })),
  };
  return <EditApartmentForm apartment={apartmentWithStrings} />;
}
