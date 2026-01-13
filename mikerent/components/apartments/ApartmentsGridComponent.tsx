"use client";

import { useEffect, useMemo, useState } from "react";
import type { Apartment, ApartmentType } from "@/data/ApartmentsTypes";
import { ApartmentCard } from "./ApartmentCardComponent";
import { ButtonFilterApartments } from "../buttons/ButtonFilterComponent";
import { DateRange } from "../SeasonCalendarComponent";

type Props = {
  apartments: Apartment[];
  guests: number;
  dateRange: DateRange;
};

export const ApartmentsGrid = ({ apartments, guests, dateRange }: Props) => {
  const [typeFilter, setTypeFilter] = useState<ApartmentType | null>(null);
  const [itemsPerLoad, setItemsPerLoad] = useState(8);
  const [visibleCount, setVisibleCount] = useState(8);
  console.log(guests);
  console.log(dateRange);

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
      {/* Фильтр по типу  */}
      <div className="mb-6">
        <ButtonFilterApartments value={typeFilter} onChange={setTypeFilter} />
      </div>

      {/* Результат */}
      {filteredApartments.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          Нічого не знайдено 😔
        </div>
      ) : (
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
