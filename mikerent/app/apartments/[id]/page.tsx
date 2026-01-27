"use client";

import { useParams } from "next/navigation";
import { ApartmentHeader } from "@/components/apartment/ApartmentHeader";
import { ApartmentGallery } from "@/components/apartment/ApartmentGallery";
import { ApartmentContent } from "@/components/apartment/ApartmentContent";
import { ApartmentBookingCard } from "@/components/apartment/ApartmentBookingCard";

export default function ApartmentPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <main className="container py-8">
      <section className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <ApartmentHeader id={id} />
          <ApartmentGallery id={id} />
          <ApartmentContent id={id} />
        </div>
        
        <aside className="lg:col-span-3">
          <ApartmentBookingCard id={id} />
        </aside>
      </section>
    </main>
  );
}