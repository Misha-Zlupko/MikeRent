"use client";

import { useParams } from "next/navigation";
import { ApartmentHeader } from "@/components/apartment/ApartmentHeader";
import { ApartmentGallery } from "@/components/apartment/ApartmentGallery";
import { ApartmentContent } from "@/components/apartment/ApartmentContent";
import { ApartmentBookingCard } from "@/components/apartment/ApartmentBookingCard";

export default function ApartmentPage() {
  const { id } = useParams();

  return (
    <main className="container py-8">
      <ApartmentHeader id={id} />
      <ApartmentGallery id={id} />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <ApartmentContent id={id} />
        <ApartmentBookingCard id={id} />
      </section>
    </main>
  );
}
