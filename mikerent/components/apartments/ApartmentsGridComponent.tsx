"use client";

import { ApartmentCard } from "./ApartmentCardComponent";
import type { Apartment } from "../../data/ApartmentsTypes";

type Props = {
  apartments: Apartment[];
};

export const ApartmentsGrid = ({ apartments }: Props) => {
  if (apartments.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        Нічого не знайдено 😔
      </div>
    );
  }

  return (
    <div
      className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        gap-6
      "
    >
      {apartments.map((apartment) => (
        <ApartmentCard key={apartment.id} apartment={apartment} />
      ))}
    </div>
  );
};
