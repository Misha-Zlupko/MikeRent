"use client";

import { useState } from "react";
import { House, BedDouble, School } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ApartmentType = "apartment" | "house" | "room";

type FilterItem = {
  id: ApartmentType;
  label: string;
  Icon: LucideIcon;
};

const filters: FilterItem[] = [
  {
    id: "apartment",
    label: "Квартири",
    Icon: BedDouble,
  },
  {
    id: "house",
    label: "Будинки",
    Icon: House,
  },
  {
    id: "room",
    label: "Номери",
    Icon: School,
  },
];

export const ButtonFilterApartments = () => {
  const [activeType, setActiveType] = useState<ApartmentType | null>(null);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 justify-center flex-wrap">
      {filters.map(({ id, label, Icon }) => {
        const isActive = activeType === id;

        return (
          <button
            key={id}
            onClick={() => setActiveType(id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full
              border text-sm font-medium whitespace-wrap
              transition-all duration-200
              ${
                isActive
                  ? "bg-main text-white border-main shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
              }
              active:scale-95
            `}
          >
            <Icon
              className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-500"}`}
            />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};
