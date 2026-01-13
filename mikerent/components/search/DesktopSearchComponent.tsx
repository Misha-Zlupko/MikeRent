"use client";

import React, { useEffect, useRef } from "react";
import { Search, MapPinHouse, Plus, Minus } from "lucide-react";
import { SeasonCalendar, DateRange } from "../SeasonCalendarComponent";
import { formatDateRange } from "./utils";
import { OpenSection } from "./SearchFormComponent";
import { useState } from "react";

type GuestRow = [
  label: string,
  value: number,
  setter: React.Dispatch<React.SetStateAction<number>>,
  min: number
];

type Props = {
  dateRange: DateRange;

  adults: number;

  childrenCount: number;

  openSection: OpenSection;
  setOpenSection: React.Dispatch<React.SetStateAction<OpenSection>>;
  onSearch: (params: {
    dateRange: DateRange;
    adults: number;
    childrenCount: number;
  }) => void;
};

export const DesktopSearch = ({
  dateRange,
  adults,
  childrenCount,
  openSection,
  setOpenSection,
  onSearch,
}: Props) => {
  const [localDateRange, setLocalDateRange] = useState(dateRange);
  const [localAdults, setLocalAdults] = useState(adults);
  const [localChildren, setLocalChildren] = useState(childrenCount);

  const totalGuests = localAdults + localChildren;
  const whenRef = useRef<HTMLDivElement | null>(null);
  const whoRef = useRef<HTMLDivElement | null>(null);

  const guestRows: GuestRow[] = [
    ["Дорослих", localAdults, setLocalAdults, 1],
    ["Дітей", localChildren, setLocalChildren, 0],
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        openSection === "when" &&
        whenRef.current &&
        !whenRef.current.contains(target)
      ) {
        setOpenSection(null);
      }

      if (
        openSection === "who" &&
        whoRef.current &&
        !whoRef.current.contains(target)
      ) {
        setOpenSection(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openSection, setOpenSection]);

  return (
    <div className="hidden sm:block w-full max-w-[820px]">
      <form className="flex items-center rounded-full bg-[#f1f1f1] p-2 shadow-md">
        <div className="flex flex-col px-4 py-2 flex-1 rounded-full transition cursor-default">
          <span className="text-xs font-semibold text-muted">Де</span>
          <div className="flex items-center gap-2 select-none">
            <MapPinHouse className="h-5 w-5 text-main" />
            <span className="font-medium text-main">Чорноморськ</span>
          </div>
        </div>

        <div className="h-8 w-px bg-border" />

        <div className="relative flex-1">
          <div
            onClick={() =>
              setOpenSection(openSection === "when" ? null : "when")
            }
            className={`px-5 py-3 rounded-full mx-1 cursor-pointer transition flex flex-col ${
              openSection === "when" ? "bg-white shadow-sm" : "hover:bg-white"
            }`}
          >
            <span className="text-xs font-semibold text-muted">Коли</span>
            <span className="font-medium truncate">
              {formatDateRange(localDateRange)}
            </span>
          </div>

          {openSection === "when" && (
            <div
              ref={whenRef}
              className="absolute left-1/2 top-[calc(100%+12px)] -translate-x-1/2 z-50 rounded-2xl bg-white p-6 shadow-xl"
            >
              <SeasonCalendar
                value={localDateRange}
                onChange={setLocalDateRange}
              />
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-border" />
        <div className="relative flex-1">
          <div
            onClick={() => setOpenSection(openSection === "who" ? null : "who")}
            className={`px-5 py-3 rounded-full mx-1 cursor-pointer transition flex flex-col ${
              openSection === "who" ? "bg-white shadow-sm" : "hover:bg-white"
            }`}
          >
            <span className="text-xs font-semibold text-muted">Хто</span>
            <span className="font-medium">{totalGuests} гостей</span>
          </div>

          {openSection === "who" && (
            <div
              ref={whoRef}
              className="absolute right-0 top-[calc(100%+12px)] z-50 w-[360px] rounded-2xl bg-white p-6 shadow-xl"
            >
              <div className="space-y-4">
                {guestRows.map(([label, value, setter, min]) => (
                  <div
                    key={label}
                    className="flex justify-between items-center"
                  >
                    <span className="font-medium">{label}</span>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setter((v) => Math.max(min, v - 1))}
                        className="h-9 w-9 rounded-full border flex items-center justify-center"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="w-6 text-center">{value}</span>

                      <button
                        type="button"
                        onClick={() => setter((v) => v + 1)}
                        className="h-9 w-9 rounded-full border flex items-center justify-center"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          className="
    ml-2 h-12 px-6 rounded-full
    bg-main text-white
    flex items-center gap-2
    transition-all duration-200 ease-out
    hover:bg-main/90
    hover:shadow-lg
    hover:-translate-y-[1px]
    active:translate-y-0
    active:scale-95
  "
          onClick={() =>
            onSearch({
              dateRange: localDateRange,
              adults: localAdults,
              childrenCount: localChildren,
            })
          }
        >
          <Search className="h-5 w-5" />
          Пошук
        </button>
      </form>
    </div>
  );
};
