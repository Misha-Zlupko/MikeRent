"use client";

import { useParams } from "next/navigation";
import { ApartmentHeader } from "@/components/apartment/ApartmentHeader";
import { ApartmentGallery } from "@/components/apartment/ApartmentGallery";
import { ApartmentContent } from "@/components/apartment/ApartmentContent";
import { ApartmentBookingCard } from "@/components/apartment/ApartmentBookingCard";

export default function ApartmentPage() {
  const { id } = useParams();

  console.log("Apartment ID:", id);

  return (
    <main className="container py-8">
      <ApartmentHeader />
      <ApartmentGallery />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <ApartmentContent />
        <ApartmentBookingCard />
      </section>
    </main>
  );
}
