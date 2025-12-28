"use client";

import { useEffect, useMemo, useState } from "react";
import type { Apartment, ApartmentType } from "@/data/ApartmentsTypes";
import { ApartmentCard } from "./ApartmentCardComponent";
import { ButtonFilterApartments } from "../buttons/ButtonFilterComponent";

type Props = {
  apartments: Apartment[];
};

export const ApartmentsGrid = ({ apartments }: Props) => {
  const [typeFilter, setTypeFilter] = useState<ApartmentType | null>(null);
  const [itemsPerLoad, setItemsPerLoad] = useState(8);
  const [visibleCount, setVisibleCount] = useState(8);

  // responsive limit
  useEffect(() => {
    const updateLimit = () => {
      const width = window.innerWidth;
      let limit = 8;

      if (width >= 1024) limit = 16; // ПК (4x4)
      else limit = 8; // mobile + tablet (2x4)

      setItemsPerLoad(limit);
      setVisibleCount(limit);
    };

    updateLimit();
    window.addEventListener("resize", updateLimit);
    return () => window.removeEventListener("resize", updateLimit);
  }, []);

  // фильтрация (готово к 100+ объектов)
  const filteredApartments = useMemo(() => {
    if (!typeFilter) return apartments;
    return apartments.filter((a) => a.type === typeFilter);
  }, [apartments, typeFilter]);

  // сброс load more при смене фильтра
  useEffect(() => {
    setVisibleCount(itemsPerLoad);
  }, [filteredApartments, itemsPerLoad]);

  const visibleApartments = filteredApartments.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredApartments.length;

  return (
    <>
      {/* ФИЛЬТР */}
      <div className="mb-6">
        <ButtonFilterApartments value={typeFilter} onChange={setTypeFilter} />
      </div>

      {/* GRID */}
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
