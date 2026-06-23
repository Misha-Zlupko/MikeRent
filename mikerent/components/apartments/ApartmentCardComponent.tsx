"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  MapPin,
  Users,
  Waves,
} from "lucide-react";
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
  onBeforeOpen?: () => void;
};

const FAVORITES_KEY = "favorites";

export const ApartmentCard = ({
  apartment,
  priceAnchorDate = null,
  priority = false,
  onBeforeOpen,
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
    onBeforeOpen?.();
    router.push(apartmentHref, { scroll: false });
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <article className="home-listing-card group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white max-md:rounded-xl">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-slate-100">
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Прибрати з обраного" : "Додати в обране"}
          className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur-sm transition hover:scale-105 active:scale-95 max-md:right-2 max-md:top-2 max-md:h-7 max-md:w-7"
        >
          <Heart
            className={`h-4 w-4 transition max-md:h-3 max-md:w-3 ${
              isFavorite ? "fill-main text-main" : "text-slate-600"
            }`}
          />
        </button>

        {apartment.seaDistanceMin != null &&
          apartment.seaDistanceMax != null && (
            <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-1 rounded-lg bg-slate-900/75 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm max-md:left-2 max-md:top-2 max-md:max-w-[calc(100%-2.5rem)] max-md:gap-0.5 max-md:rounded-md max-md:bg-slate-900/80 max-md:px-1.5 max-md:py-0.5 max-md:text-[9px] max-md:shadow-sm">
              <Waves
                className="hidden h-3 w-3 shrink-0 text-sky-200 max-md:block max-md:h-2.5 max-md:w-2.5"
                aria-hidden
              />
              <span className="truncate leading-none max-md:font-medium">
                <span className="max-md:hidden">
                  {apartment.seaDistanceMin}–{apartment.seaDistanceMax} хв до
                  моря
                </span>
                <span className="hidden max-md:inline">
                  {apartment.seaDistanceMin}–{apartment.seaDistanceMax} хв
                </span>
              </span>
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
                    onBeforeOpen?.();
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

        <div className="pointer-events-none absolute bottom-3 right-3 z-20 rounded-xl bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-sm max-md:bottom-1.5 max-md:right-1.5 max-md:flex max-md:min-w-[3.25rem] max-md:items-center max-md:justify-center max-md:gap-0.5 max-md:rounded-md max-md:px-1.5 max-md:py-1 max-md:text-center">
          <span className="text-base font-bold text-slate-900 max-md:text-[10px] max-md:font-semibold max-md:leading-none">
            {displayPrice} ₴
          </span>
          <span className="text-xs font-normal text-slate-500 max-md:text-[8px] max-md:leading-none">
            {" "}
            /ніч
          </span>
        </div>
      </div>

      <Link
        href={apartmentHref}
        scroll={false}
        onClick={() => onBeforeOpen?.()}
        className="flex flex-1 flex-col p-4 max-md:p-2.5"
      >
        <h3 className="mb-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-slate-900 transition group-hover:text-main max-md:mb-1 max-md:text-[13px]">
          {apartment.title}
        </h3>

        <p className="mb-3 flex items-start gap-1.5 text-sm text-slate-500 max-md:mb-2 max-md:gap-1 max-md:text-[11px]">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 max-md:mt-px max-md:h-3 max-md:w-3" />
          <span className="line-clamp-1">{apartment.address}</span>
        </p>

        <div className="mt-auto flex items-center gap-1.5 text-xs text-slate-400 max-md:gap-1 max-md:text-[10px]">
          <Users className="h-3.5 w-3.5 shrink-0 max-md:h-3 max-md:w-3" />
          <span className="line-clamp-1">
            <span className="max-md:hidden">
              {apartment.guests} гостей · {apartment.beds} ліжка
            </span>
            <span className="hidden max-md:inline">
              {apartment.guests} гост. · {apartment.beds} ліж.
            </span>
          </span>
        </div>
      </Link>
    </article>
  );
};
