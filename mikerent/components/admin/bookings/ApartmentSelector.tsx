"use client";

import { useState, useEffect } from "react";
import { Home } from "lucide-react";

type Apartment = {
  id: string;
  title: string;
  city: string;
  address: string;
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
          if (!apt) {
            onSelect(null);
            return;
          }
          onSelect({
            ...apt,
            address: apt.address ?? "",
          });
        }}
        required
      >
        <option value="">Виберіть квартиру</option>
        {apartments.map((apt) => (
          <option key={apt.id} value={apt.id}>
            {apt.title} — {apt.address}, {apt.city} — {apt.pricePerNight} ₴/ніч
          </option>
        ))}
      </select>

      {selectedApartment && (
        <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          <p className="font-medium text-gray-900">{selectedApartment.title}</p>
          <p className="text-gray-600">
            {selectedApartment.address}, {selectedApartment.city}
          </p>
          <p className="mt-1 text-gray-800">
            {selectedApartment.pricePerNight} ₴ / ніч
          </p>
        </div>
      )}
    </div>
  );
}
