"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Heart, MapPin, Users } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import Link from "next/link";
import { useRouter } from "next/navigation";

import "swiper/css";
import "swiper/css/pagination";

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
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);
  const swipeMovedRef = useRef(false);

  const images = apartment.images.filter(Boolean);
  const hasMultipleImages = images.length > 1;
  const apartmentHref = `/apartments/${apartment.id}`;

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

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    swiperRef.current?.slidePrev();
  };

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    swiperRef.current?.slideNext();
  };

  const openApartmentFromSlide = () => {
    if (swipeMovedRef.current) {
      swipeMovedRef.current = false;
      return;
    }
    router.push(apartmentHref);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <article className="home-listing-card group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-slate-100">
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Прибрати з обраного" : "Додати в обране"}
          className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur-sm transition hover:scale-105 active:scale-95"
        >
          <Heart
            className={`h-4 w-4 transition ${
              isFavorite ? "fill-main text-main" : "text-slate-600"
            }`}
          />
        </button>

        {apartment.seaDistanceMin != null &&
          apartment.seaDistanceMax != null && (
            <div className="pointer-events-none absolute left-3 top-3 z-20 rounded-lg bg-slate-900/75 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
              {apartment.seaDistanceMin}–{apartment.seaDistanceMax} хв до моря
            </div>
          )}

        <Swiper
          modules={[Pagination]}
          slidesPerView={1}
          spaceBetween={0}
          allowTouchMove={hasMultipleImages}
          simulateTouch={hasMultipleImages}
          followFinger
          grabCursor={hasMultipleImages}
          threshold={6}
          touchAngle={40}
          longSwipes
          shortSwipes
          preventClicks
          preventClicksPropagation
          touchStartPreventDefault={false}
          resistanceRatio={0.85}
          pagination={
            hasMultipleImages
              ? { clickable: true, dynamicBullets: true }
              : false
          }
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onTouchStart={() => {
            swipeMovedRef.current = false;
          }}
          onSliderMove={() => {
            swipeMovedRef.current = true;
          }}
          className="apartment-card-swiper h-full w-full"
        >
          {images.map((src, index) => (
            <SwiperSlide key={`${apartment.id}-${index}`} className="!h-auto">
              <div
                role="button"
                tabIndex={0}
                onClick={() => openApartmentFromSlide()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(apartmentHref);
                  }
                }}
                className="relative block aspect-[4/3] w-full cursor-pointer overflow-hidden"
              >
                <OptimizedImage
                  src={src}
                  alt={`${apartment.title} — фото ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={priority && index === 0}
                  optimizeWidth={IMAGE_WIDTH.card}
                  className="object-cover select-none transition duration-500 group-hover:scale-[1.03]"
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
              onClick={goPrev}
              className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/95 shadow-sm opacity-0 transition group-hover:opacity-100"
            >
              <ArrowLeft className="h-4 w-4 text-slate-700" />
            </button>
            <button
              type="button"
              aria-label="Наступне фото"
              onClick={goNext}
              className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/95 shadow-sm opacity-0 transition group-hover:opacity-100"
            >
              <ArrowRight className="h-4 w-4 text-slate-700" />
            </button>
          </>
        )}

        <div className="pointer-events-none absolute bottom-3 right-3 z-20 rounded-xl bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-sm">
          <span className="text-base font-bold text-slate-900">
            {displayPrice} ₴
          </span>
          <span className="text-xs font-normal text-slate-500"> /ніч</span>
        </div>
      </div>

      <Link href={apartmentHref} className="flex flex-1 flex-col p-4">
        <h3 className="mb-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-slate-900 transition group-hover:text-main">
          {apartment.title}
        </h3>

        <p className="mb-3 flex items-start gap-1.5 text-sm text-slate-500">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="line-clamp-1">{apartment.address}</span>
        </p>

        <div className="mt-auto flex items-center gap-1.5 text-xs text-slate-400">
          <Users className="h-3.5 w-3.5" />
          <span>
            {apartment.guests} гостей · {apartment.beds} ліжка
          </span>
        </div>
      </Link>
    </article>
  );
};
