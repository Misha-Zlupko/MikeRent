"use client";

import { apartments } from "@/data/ApartmentsData";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

const FAVORITES_KEY = "favorites";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);

    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  const removeFavorite = (id: string) => {
    const updated = favorites.filter((favId) => favId !== id);
    setFavorites(updated);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  };

  const favoriteApartments = apartments.filter((apartment) =>
    favorites.includes(apartment.id)
  );

  if (favoriteApartments.length === 0) {
    return (
      <main className="container py-16 text-center">
        <h1 className="mb-4 text-2xl font-semibold">Обрані квартири</h1>
        <p className="text-gray-500">У вас ще немає обраних квартир 🤍</p>
      </main>
    );
  }

  return (
    <main className="container py-8">
      <h1 className="mb-6 text-center text-2xl font-semibold">
        Обрані квартири
      </h1>

      <section className="space-y-4">
        {favoriteApartments.map((apartment) => (
          <div
            key={apartment.id}
            className="
              relative
              flex gap-4
              rounded-2xl
              border
            bg-white
              p-4
              shadow-sm
              transition
              hover:shadow-md
            "
          >
            <div className="relative h-28 w-40 flex-shrink-0 overflow-hidden rounded-xl">
              <Image
                src={apartment.images[0]}
                alt={apartment.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{apartment.title}</h3>

                <p className="mt-1 text-sm text-gray-500">
                  {apartment.city} · {apartment.address}
                </p>
              </div>

              <div className="mt-2 text-sm text-gray-600">
                {apartment.guests} гостей · {apartment.bedrooms} спальня ·{" "}
                {apartment.beds} ліжка
              </div>

              <div className="mt-2 font-semibold text-gray-900">
                {apartment.pricePerNight} ₴{" "}
                <span className="text-sm font-normal text-gray-500">/ ніч</span>
              </div>
            </div>
            <button
              onClick={() => removeFavorite(apartment.id)}
              aria-label="Видалити з обраних"
              className="
                absolute
                right-4
                top-4
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-white
                shadow
                transition
                hover:scale-105
                hover:shadow-md
                active:scale-95
              "
            >
              <Heart className="h-5 w-5 text-main fill-main" />
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}
