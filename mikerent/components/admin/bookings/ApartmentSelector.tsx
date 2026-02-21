"use client";

import { useState, useEffect } from "react";
import { Home } from "lucide-react";

type Apartment = {
  id: string;
  title: string;
  city: string;
  pricePerNight: number;
};

type Props = {
  selectedApartment: Apartment | null;
  onSelect: (apartment: Apartment | null) => void;
};

export default function ApartmentSelector({
  selectedApartment,
  onSelect,
}: Props) {
  const [apartments, setApartments] = useState<Apartment[]>([]);

  useEffect(() => {
    fetch("/api/admin/apartments")
      .then((res) => res.json())
      .then((data) => setApartments(data));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Home size={20} className="text-blue-600" />
        Квартира
      </h2>

      <select
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
        value={selectedApartment?.id || ""}
        onChange={(e) => {
          const apt = apartments.find((a) => a.id === e.target.value);
          onSelect(apt || null);
        }}
        required
      >
        <option value="">Виберіть квартиру</option>
        {apartments.map((apt) => (
          <option key={apt.id} value={apt.id}>
            {apt.title} ({apt.city}) - ${apt.pricePerNight}/ніч
          </option>
        ))}
      </select>
    </div>
  );
}
