"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Heart } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Link from "next/link";

import "swiper/css";
import "swiper/css/navigation";

import { Apartment } from "../../data/ApartmentsTypes";
import { getDisplayNightlyPrice } from "@/lib/monthlyPricing";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { IMAGE_WIDTH } from "@/lib/optimizeImageUrl";

type Props = {
  apartment: Apartment;
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

  const images = apartment.images.filter(Boolean);
  const hasMultipleImages = images.length > 1;

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

    if (stored.includes(apartment.id)) {
      setIsFavorite(false);
      localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(stored.filter((id) => id !== apartment.id)),
      );
    } else {
      setIsFavorite(true);
      localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify([...stored, apartment.id]),
      );
    }
  };

  const stopNav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="group relative h-full">
      <button
        type="button"
        onClick={toggleFavorite}
        className="
          absolute top-2 right-2 z-30
          flex h-9 w-9 items-center justify-center
          rounded-full bg-white/80 shadow backdrop-blur
          transition hover:scale-105 active:scale-95
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
          flex h-full flex-col overflow-hidden
          rounded-2xl border border-gray-200 bg-white
          shadow-sm transition-shadow hover:shadow-lg
        "
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {apartment.seaDistanceMin != null &&
            apartment.seaDistanceMax != null && (
              <div className="absolute left-2 top-2 z-20 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                {apartment.seaDistanceMin}-{apartment.seaDistanceMax} хв до моря
              </div>
            )}

          <Swiper
            modules={[Navigation]}
            slidesPerView={1}
            navigation={{
              prevEl: `.prev-${apartment.id}`,
              nextEl: `.next-${apartment.id}`,
            }}
            className="h-full w-full"
          >
            {images.map((src, index) => (
              <SwiperSlide key={`${apartment.id}-${index}`}>
                <div className="relative aspect-[4/3] w-full">
                  <OptimizedImage
                    src={src}
                    alt={apartment.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    priority={priority && index === 0}
                    optimizeWidth={IMAGE_WIDTH.card}
                    className="object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {hasMultipleImages && (
            <>
              <button
                type="button"
                aria-label="Попереднє фото"
                onClick={stopNav}
                className={`
                  prev-${apartment.id}
                  absolute left-2 top-1/2 z-20 -translate-y-1/2
                  h-8 w-8 rounded-full border border-gray-300
                  bg-white/80 shadow backdrop-blur
                  opacity-0 transition group-hover:opacity-100
                `}
              >
                <ArrowLeft className="mx-auto h-4 w-4 text-gray-700" />
              </button>
              <button
                type="button"
                aria-label="Наступне фото"
                onClick={stopNav}
                className={`
                  next-${apartment.id}
                  absolute right-2 top-1/2 z-20 -translate-y-1/2
                  h-8 w-8 rounded-full border border-gray-300
                  bg-white/80 shadow backdrop-blur
                  opacity-0 transition group-hover:opacity-100
                `}
              >
                <ArrowRight className="mx-auto h-4 w-4 text-gray-700" />
              </button>
            </>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="mb-auto">
            <h3 className="mb-1 line-clamp-2 text-sm font-bold text-gray-900 sm:text-base">
              {apartment.title}
            </h3>
            <p className="text-xs text-gray-500 sm:text-sm">{apartment.address}</p>
            <p className="text-xs text-gray-500 sm:text-sm">
              {apartment.guests} гостей · {apartment.beds} ліжка
            </p>
          </div>
          <div>
            <span className="text-base font-semibold text-gray-900 sm:text-lg">
              {displayPrice} ₴
              <span className="text-xs text-gray-500 sm:text-sm"> / ніч</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};
