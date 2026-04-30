"use client";

import { useEffect, useMemo, useState } from "react";
import type { Apartment, ApartmentType } from "@/data/ApartmentsTypes";
import { ApartmentCard } from "./ApartmentCardComponent";
import { DateRange } from "../SeasonCalendarComponent";

type Props = {
  apartments: Apartment[];
  guests: number;
  dateRange: DateRange;
  typeFilter?: ApartmentType | null;
};

export const ApartmentsGrid = ({
  apartments,
  guests,
  dateRange,
  typeFilter = null,
}: Props) => {
  const [itemsPerLoad, setItemsPerLoad] = useState(8);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    const updateLimit = () => {
      const width = window.innerWidth;
      const limit = width >= 1024 ? 16 : 8;

      setItemsPerLoad(limit);
      setVisibleCount(limit);
    };

    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, []);

  const filteredApartments = useMemo(() => {
    return apartments.filter((a) => {
      // 1. Тип
      if (typeFilter && a.type !== typeFilter) {
        return false;
      }

      // 2. Количество гостей
      if (guests > a.guests) {
        return false;
      }

      // 3. Если даты не выбраны — квартира подходит
      if (!dateRange.from || !dateRange.to) {
        return true;
      }

      const selectedFrom = new Date(dateRange.from);
      const selectedTo = new Date(dateRange.to);

      // 5. Проверка занятых дат
      const hasBookingConflict = a.availability.booked.some((b) => {
        const bookedFrom = new Date(b.from);
        const bookedTo = new Date(b.to);

        return selectedFrom <= bookedTo && selectedTo >= bookedFrom;
      });

      if (hasBookingConflict) {
        return false;
      }

      return true;
    });
  }, [apartments, typeFilter, guests, dateRange]);

  // Сброс количества видимых карточек при смене фильтров
  useEffect(() => {
    setVisibleCount(itemsPerLoad);
  }, [filteredApartments, itemsPerLoad]);

  const visibleApartments = filteredApartments.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredApartments.length;

  return (
    <>
      {/* Результат */}
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
      Спробуйте змінити параметри пошуку — оберіть інші дати або зменште кількість гостей
    </p>
    <button
      onClick={() => {
        // Функція скидання фільтрів
        window.location.href = "/";
      }}
      className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-md active:scale-95"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Скинути фільтри
    </button>
  </div>
)  : (
        <>
          <div
            className="
              grid
              grid-cols-2
              gap-4
              md:grid-cols-3
              lg:grid-cols-4
            "
          >
            {visibleApartments.map((apartment) => (
              <ApartmentCard key={apartment.id} apartment={apartment} />
            ))}
          </div>

          {canLoadMore && (
            <div className="flex justify-center mt-10">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + itemsPerLoad)}
                className="
                  px-8 py-3 rounded-full
                  bg-main text-white font-medium
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
