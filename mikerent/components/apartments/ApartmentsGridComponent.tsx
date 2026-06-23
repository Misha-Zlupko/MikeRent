"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Apartment, ApartmentType } from "@/data/ApartmentsTypes";
import { ApartmentCard } from "./ApartmentCardComponent";
import { DateRange } from "../SeasonCalendarComponent";
import {
  getDisplayNightlyPrice,
  getMissingPriceMonths,
} from "@/lib/monthlyPricing";
import {
  APARTMENTS_GRID_SSR_VISIBLE,
  buildListFilterKey,
  clearApartmentsListSession,
  readScrollYFromSession,
  resolveVisibleCountFromSession,
  saveApartmentsListSession,
  type HomeSearchSnapshot,
} from "@/lib/apartmentsListSession";

type Props = {
  apartments: Apartment[];
  guests: number;
  dateRange: DateRange;
  typeFilter?: ApartmentType | null;
  searchSnapshot: HomeSearchSnapshot;
};

function getItemsPerLoad() {
  if (typeof window === "undefined") return APARTMENTS_GRID_SSR_VISIBLE;
  if (window.innerWidth >= 1280) return 16;
  if (window.innerWidth < 768) return 6;
  return 9;
}

function restoreScrollY(scrollY: number) {
  const apply = () => {
    window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
  };
  apply();
  requestAnimationFrame(apply);
  setTimeout(apply, 50);
  setTimeout(apply, 150);
}

export const ApartmentsGrid = ({
  apartments,
  guests,
  dateRange,
  typeFilter = null,
  searchSnapshot,
}: Props) => {
  // Однакове на сервері та при гідратації — інакше hydration error
  const [itemsPerLoad, setItemsPerLoad] = useState(APARTMENTS_GRID_SSR_VISIBLE);
  const [visibleCount, setVisibleCount] = useState(APARTMENTS_GRID_SSR_VISIBLE);
  const visibleCountRef = useRef(visibleCount);
  const prevFilterKeyRef = useRef<string | null>(null);

  visibleCountRef.current = visibleCount;

  useEffect(() => {
    const updateLimit = () => {
      const limit = getItemsPerLoad();
      setItemsPerLoad((prev) => (prev === limit ? prev : limit));
    };

    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, []);

  const filteredApartments = useMemo(() => {
    return apartments
      .filter((a) => {
        if (typeFilter && a.type !== typeFilter) {
          return false;
        }

        if (guests > a.guests) {
          return false;
        }

        if (!dateRange.from || !dateRange.to) {
          return true;
        }

        const selectedFrom = new Date(dateRange.from);
        const selectedTo = new Date(dateRange.to);

        const monthlyPrices = a.availability.monthlyPrices ?? {};
        const missingMonths = getMissingPriceMonths(
          selectedFrom,
          selectedTo,
          monthlyPrices,
        );
        if (missingMonths.length > 0) {
          return false;
        }

        const hasBookingConflict = a.availability.booked.some((b) => {
          const bookedFrom = new Date(b.from);
          const bookedTo = new Date(b.to);

          return selectedFrom <= bookedTo && selectedTo >= bookedFrom;
        });

        if (hasBookingConflict) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const anchor = dateRange.from ?? new Date();
        const priceA = getDisplayNightlyPrice(
          a.availability.monthlyPrices ?? {},
          a.pricePerNight,
          anchor,
        );
        const priceB = getDisplayNightlyPrice(
          b.availability.monthlyPrices ?? {},
          b.pricePerNight,
          anchor,
        );
        return priceA - priceB;
      });
  }, [apartments, typeFilter, guests, dateRange]);

  const filterKey = useMemo(
    () =>
      buildListFilterKey({
        typeFilter,
        guests,
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        apartmentsCount: apartments.length,
      }),
    [typeFilter, guests, dateRange.from, dateRange.to, apartments.length],
  );

  const apartmentIds = useMemo(
    () => filteredApartments.map((a) => a.id),
    [filteredApartments],
  );

  // Після гідратації: відновити список / скинути при зміні фільтрів
  useEffect(() => {
    if (apartmentIds.length === 0) return;

    const perLoad = getItemsPerLoad();
    setItemsPerLoad(perLoad);

    const restored = resolveVisibleCountFromSession(
      filterKey,
      apartmentIds,
      perLoad,
    );

    if (restored != null) {
      setVisibleCount(restored);
      const scrollY = readScrollYFromSession(filterKey);
      if (scrollY != null) {
        restoreScrollY(scrollY);
      }
      prevFilterKeyRef.current = filterKey;
      return;
    }

    if (prevFilterKeyRef.current === null) {
      prevFilterKeyRef.current = filterKey;
      setVisibleCount(perLoad);
      return;
    }

    if (prevFilterKeyRef.current !== filterKey) {
      prevFilterKeyRef.current = filterKey;
      clearApartmentsListSession();
      setVisibleCount(perLoad);
    }
  }, [filterKey, apartmentIds]);

  const rememberListPosition = (apartmentId: string) => {
    saveApartmentsListSession({
      filterKey,
      visibleCount: visibleCountRef.current,
      scrollY: window.scrollY,
      apartmentId,
      search: searchSnapshot,
    });
  };

  const visibleApartments = filteredApartments.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredApartments.length;

  return (
    <>
      {filteredApartments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-800">
            Нічого не знайдено
          </h3>
          <p className="mb-6 max-w-md text-gray-500">
            Спробуйте змінити параметри пошуку — оберіть інші дати або зменште
            кількість гостей
          </p>
          <button
            onClick={() => {
              clearApartmentsListSession();
              window.location.href = "/";
            }}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-md active:scale-95"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Скинути фільтри
          </button>
        </div>
      ) : (
        <>
          <div
            className="
              grid
              grid-cols-2
              gap-3
              sm:gap-4
              md:grid-cols-3
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >
            {visibleApartments.map((apartment, index) => (
              <ApartmentCard
                key={apartment.id}
                apartment={apartment}
                priceAnchorDate={dateRange.from}
                priority={index < 4}
                onBeforeOpen={() => rememberListPosition(apartment.id)}
              />
            ))}
          </div>

          {canLoadMore && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setVisibleCount((prev) =>
                    Math.min(prev + itemsPerLoad, filteredApartments.length),
                  );
                }}
                className="
                  rounded-full
                  bg-main px-8 py-3 font-medium text-white
                  transition hover:bg-main/90
                  active:scale-95
                "
              >
                Показати ще
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
};
