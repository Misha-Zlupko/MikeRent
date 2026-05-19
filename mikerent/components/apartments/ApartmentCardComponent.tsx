"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import Link from "next/link";

import { Apartment } from "../../data/ApartmentsTypes";
import { getDisplayNightlyPrice } from "@/lib/monthlyPricing";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { IMAGE_WIDTH } from "@/lib/optimizeImageUrl";

type Props = {
  apartment: Apartment;
  /** Дата заїзду з пошуку; без неї — ціна на сьогодні */
  priceAnchorDate?: Date | null;
  priority?: boolean;
};

const FAVORITES_KEY = "favorites";

export const ApartmentCard = ({
  apartment,
  priceAnchorDate = null,
  priority = false,
}: Props) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const coverImage = apartment.images[0];
  const totalImages = apartment.photoCount ?? apartment.images.length;

  const displayPrice = useMemo(
    () =>
      getDisplayNightlyPrice(
        apartment.availability.monthlyPrices ?? {},
        apartment.pricePerNight,
        priceAnchorDate,
      ),
    [apartment, priceAnchorDate],
  );

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem(FAVORITES_KEY) || "[]",
    ) as string[];

    setIsFavorite(stored.includes(apartment.id));
  }, [apartment.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const stored = JSON.parse(
      localStorage.getItem(FAVORITES_KEY) || "[]",
    ) as string[];

    let updated: string[];

    if (stored.includes(apartment.id)) {
      updated = stored.filter((id) => id !== apartment.id);
      setIsFavorite(false);
    } else {
      updated = [...stored, apartment.id];
      setIsFavorite(true);
    }

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  };

  if (!coverImage) {
    return null;
  }

  return (
    <div className="relative group h-full">
      <button
        type="button"
        onClick={toggleFavorite}
        className="
          absolute top-2 right-2 z-30
          h-9 w-9 rounded-full
          flex items-center justify-center
          bg-white/80 backdrop-blur shadow
          transition
          hover:scale-105
          active:scale-95
        "
      >
        <Heart
          className={`h-5 w-5 transition ${
            isFavorite ? "fill-blue-500 text-blue-500" : "text-gray-600"
          }`}
        />
      </button>

      <Link
        href={`/apartments/${apartment.id}`}
        className="
          h-full
          flex flex-col
          rounded-2xl
          overflow-hidden
          bg-white
          border border-gray-200
          shadow-sm
          hover:shadow-lg
          transition-shadow
        "
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {apartment.seaDistanceMin != null && apartment.seaDistanceMax != null && (
            <div className="absolute left-2 top-2 z-20 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
              {apartment.seaDistanceMin}-{apartment.seaDistanceMax} хв до моря
            </div>
          )}
          <OptimizedImage
            src={coverImage}
            alt={apartment.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            priority={priority}
            optimizeWidth={IMAGE_WIDTH.card}
            className="object-cover"
          />
          {totalImages > 1 && (
            <div className="absolute bottom-2 right-2 z-20 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
              {totalImages} фото
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col gap-2 flex-1">
          <div className="mb-auto">
            <h3 className="font-bold mb-1 text-sm sm:text-base text-gray-900 line-clamp-2">
              {apartment.title}
            </h3>

            <p className="text-xs sm:text-sm text-gray-500">
              {apartment.address}
            </p>

            <p className="text-xs sm:text-sm text-gray-500">
              {apartment.guests} гостей · {apartment.beds} ліжка
            </p>
          </div>

          <div>
            <span className="text-base sm:text-lg font-semibold text-gray-900">
              {displayPrice} ₴
              <span className="text-xs sm:text-sm text-gray-500"> / ніч</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};
