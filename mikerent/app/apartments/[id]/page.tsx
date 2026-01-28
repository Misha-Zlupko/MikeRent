"use client";

import { useParams } from "next/navigation";
import { ApartmentHeader } from "@/components/apartment/ApartmentHeaderComponent";
import { ApartmentGallery } from "@/components/apartment/ApartmentGalleryComponent";
import { ApartmentContent } from "@/components/apartment/ApartmentContentComponent";
import { ApartmentBookingCard } from "@/components/apartment/ApartmentBookingCardComponent";
import { ApartmentMapComponent } from "@/components/apartment/ApartmentMapComponent";

export default function ApartmentPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <main className="container py-8">
      <section className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <ApartmentHeader id={id} />
          <ApartmentGallery id={id} />
          <ApartmentMapComponent id={id} />
          <ApartmentContent id={id} />
        </div>
        
        <aside className="lg:col-span-3">
          <ApartmentBookingCard id={id} />
        </aside>
      </section>
    </main>
  );
}