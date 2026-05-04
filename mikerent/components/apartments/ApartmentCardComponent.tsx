"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Heart } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Link from "next/link";

import "swiper/css";
import "swiper/css/navigation";

import { Apartment } from "../../data/ApartmentsTypes";

type Props = {
  apartment: Apartment;
};

const FAVORITES_KEY = "favorites";

export const ApartmentCard = ({ apartment }: Props) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const images = apartment.images;
  const totalImages = images.length;

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem(FAVORITES_KEY) || "[]"
    ) as string[];

    setIsFavorite(stored.includes(apartment.id));
  }, [apartment.id]);

  const toggleFavorite = () => {
    const stored = JSON.parse(
      localStorage.getItem(FAVORITES_KEY) || "[]"
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

  return (
    <div className="relative group h-full">
      {/* ❤️ ИЗБРАННОЕ — ВНЕ Link */}
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

      {/* КАРТОЧКА (ССЫЛКА) */}
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
        {/* Галерея */}
        <div className="relative aspect-[4/3] w-full overflow-hidden">
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
              <SwiperSlide key={index}>
                <Image
                  src={src}
                  alt={apartment.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {totalImages > 1 && (
            <button
              className={`
                prev-${apartment.id}
                absolute left-2 top-1/2 -translate-y-1/2
                h-8 w-8 rounded-full
                bg-white/80 backdrop-blur
                border border-gray-300
                shadow
                z-20
                opacity-0 group-hover:opacity-100
                transition
              `}
            >
              <ArrowLeft className="h-4 w-4 mx-auto text-gray-700" />
            </button>
          )}

          {totalImages > 1 && (
            <button
              className={`
                next-${apartment.id}
                absolute right-2 top-1/2 -translate-y-1/2
                h-8 w-8 rounded-full
                bg-white/80 backdrop-blur
                border border-gray-300
                shadow
                z-20
                opacity-0 group-hover:opacity-100
                transition
              `}
            >
              <ArrowRight className="h-4 w-4 mx-auto text-gray-700" />
            </button>
          )}
        </div>

        {/* Контент */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          <div className="mb-auto">
            <h3 className="font-bold mb-1 text-sm sm:text-base text-gray-900 line-clamp-2">
              {apartment.title}
            </h3>

            <p className="text-xs sm:text-sm text-gray-500">
              {apartment.address}
            </p>

            <p className="text-xs sm:text-sm text-gray-500">
              {apartment.guests} гостей ·{" "}
              {apartment.beds} ліжка
            </p>
          </div>

          <div>
            <span className="text-base sm:text-lg font-semibold text-gray-900">
              {apartment.pricePerNight} ₴
              <span className="text-xs sm:text-sm text-gray-500"> / ніч</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};
