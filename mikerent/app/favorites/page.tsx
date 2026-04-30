"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Heart, Trash2, MapPin, Users, Bed, Bath, ArrowLeft, Star, ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { Apartment } from "@prisma/client";

const FAVORITES_KEY = "favorites";

// Функція для правильної відміни слова "квартира"
const getApartmentsText = (count: number) => {
  if (count === 1) return "квартира";
  if (count >= 2 && count <= 4) return "квартири";
  return "квартир";
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/apartments");
        if (!res.ok) return;
        const data = (await res.json()) as Apartment[];
        setApartments(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const removeFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    const updated = favorites.filter((favId) => favId !== id);
    setFavorites(updated);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  };

  const favoriteApartments = apartments.filter((apartment) =>
    favorites.includes(apartment.id),
  );

  const apartmentsCount = favoriteApartments.length;
  const apartmentsText = getApartmentsText(apartmentsCount);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container flex min-h-[60vh] items-center justify-center py-16">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-gray-500">Завантаження...</p>
          </div>
        </div>
      </main>
    );
  }

  if (favoriteApartments.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
          {/* Кнопка назад */}
          <div className="absolute left-4 top-4 sm:left-8 sm:top-8">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
            >
              <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
              На головну
            </Link>
          </div>

          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner">
            <Heart className="h-12 w-12 text-gray-400" strokeWidth={1.5} />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">
            Список порожній
          </h1>
          <p className="mb-6 text-gray-500">
            Додайте квартири в обрані, щоб побачити їх тут
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-blue-700"
          >
            <ArrowLeft size={18} />
            Знайти житло
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container py-8 sm:py-12">
        {/* Кнопка повернення на головну */}
        <div className="mb-6">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
          >
            <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
            На головну
          </Link>
        </div>

        {/* Заголовок */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5">
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            <span className="text-sm font-medium text-blue-800">
              {apartmentsCount} {apartmentsText} у списку
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">
            Обрані квартири
          </h1>
          <p className="mt-2 text-gray-500">
            Ваш персональний список улюблених помешкань
          </p>
        </div>

        {/* Список карток */}
        <div className="space-y-4">
          {favoriteApartments.map((apartment) => (
            <div
              key={apartment.id}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex flex-col gap-4 p-4 sm:flex-row">
                {/* Фото */}
                <Link
                  href={`/apartments/${apartment.id}`}
                  className="relative block flex-shrink-0"
                >
                  <div className="relative h-48 w-full overflow-hidden rounded-xl sm:h-32 sm:w-40">
                    {apartment.images?.[0] ? (
                      <Image
                        src={apartment.images[0]}
                        alt={apartment.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-100">
                        <span className="text-gray-400">Немає фото</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Інформація */}
                <Link
                  href={`/apartments/${apartment.id}`}
                  className="flex-1"
                >
                  <div className="flex h-full flex-col">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="line-clamp-1 text-lg font-semibold text-gray-800">
                        {apartment.title}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {apartment.rating}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({apartment.reviewsCount})
                        </span>
                      </div>
                    </div>

                    <div className="mb-2 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin size={14} />
                      <span className="line-clamp-1">
                        {apartment.city}, {apartment.address}
                      </span>
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{apartment.guests} гостей</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bed size={14} />
                        <span>{apartment.bedrooms} спальні</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath size={14} />
                        <span>{apartment.bathrooms} ванни</span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <div className="text-lg font-bold text-gray-800">
                        {apartment.pricePerNight} ₴
                        <span className="text-sm font-normal text-gray-500">
                          / ніч
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Кнопка видалення */}
                <button
                  onClick={(e) => removeFavorite(apartment.id, e)}
                  aria-label="Видалити з обраних"
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md transition-all hover:scale-110 hover:bg-red-50 sm:relative sm:right-0 sm:top-0"
                >
                  <Trash2 className="h-4 w-4 text-gray-500 transition-colors hover:text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}