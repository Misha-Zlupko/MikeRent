"use client";

import React from "react";
import {
  Search,
  MapPinHouse,
  Plus,
  Minus,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { SeasonCalendar, DateRange } from "../SeasonCalendarComponent";
import { formatDateRange, getMobileSearchLabel } from "./utils";
import { OpenSection } from "./SearchFormComponent";

type GuestRow = [
  label: string,
  value: number,
  setter: React.Dispatch<React.SetStateAction<number>>,
  min: number
];

type Props = {
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;

  openSection: OpenSection;
  setOpenSection: React.Dispatch<React.SetStateAction<OpenSection>>;

  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;

  adults: number;
  setAdults: React.Dispatch<React.SetStateAction<number>>;

  childrenCount: number;
  setChildrenCount: React.Dispatch<React.SetStateAction<number>>;
};

export const MobileSearch = ({
  openMobile,
  setOpenMobile,
  openSection,
  setOpenSection,
  dateRange,
  setDateRange,
  adults,
  setAdults,
  childrenCount,
  setChildrenCount,
}: Props) => {
  const totalGuests = adults + childrenCount;

  const guestRows: GuestRow[] = [
    ["Дорослих", adults, setAdults, 1],
    ["Дітей", childrenCount, setChildrenCount, 0],
  ];

  return (
    <div className="sm:hidden w-full">
      <button
        onClick={() => setOpenMobile(true)}
        className="w-full h-12 rounded-full bg-main text-white flex items-center gap-2 px-4"
      >
        <Search className="h-5 w-5" />
        <span className="truncate text-sm font-medium">
          {getMobileSearchLabel(dateRange, totalGuests)}
        </span>
      </button>

      {openMobile && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="h-14 px-4 flex items-center gap-3 border-b">
            <button onClick={() => setOpenMobile(false)}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="font-semibold text-base">Пошук</span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <div className="rounded-xl border p-4">
              <span className="text-xs text-muted">Де</span>
              <div className="flex items-center gap-2 mt-1 font-medium">
                <MapPinHouse className="h-5 w-5 text-main" />
                Чорноморськ
              </div>
            </div>

            <div className="rounded-xl border overflow-hidden">
              <button
                onClick={() =>
                  setOpenSection(openSection === "when" ? null : "when")
                }
                className="w-full p-4 flex items-center justify-between"
              >
                <div className="flex flex-col items-start">
                  <span className="text-xs text-muted">Коли</span>
                  <div className="font-medium">
                    {formatDateRange(dateRange)}
                  </div>
                </div>
                {openSection === "when" ? <ChevronDown /> : <ChevronRight />}
              </button>

              <div
                className={`accordion ${
                  openSection === "when" ? "accordion-open" : "accordion-closed"
                }`}
              >
                <div className="pb-5 pt-5 px-4 flex justify-center">
                  <SeasonCalendar value={dateRange} onChange={setDateRange} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border overflow-hidden">
              <button
                onClick={() =>
                  setOpenSection(openSection === "who" ? null : "who")
                }
                className="w-full p-4 flex items-center justify-between"
              >
                <div className="flex flex-col items-start">
                  <span className="text-xs text-muted">Хто</span>
                  <div className="font-medium">{totalGuests} гостей</div>
                </div>
                {openSection === "who" ? <ChevronDown /> : <ChevronRight />}
              </button>

              <div
                className={`accordion ${
                  openSection === "who" ? "accordion-open" : "accordion-closed"
                }`}
              >
                <div className="space-y-4 px-4 py-4">
                  {guestRows.map(([label, value, setter, min]) => (
                    <div
                      key={label}
                      className="flex justify-between items-center"
                    >
                      <span className="font-medium">{label}</span>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setter((v) => Math.max(min, v - 1))}
                          className="h-9 w-9 rounded-full border flex items-center justify-center"
                        >
                          <Minus />
                        </button>

                        <span className="w-6 text-center">{value}</span>

                        <button
                          onClick={() => setter((v) => v + 1)}
                          className="h-9 w-9 rounded-full border flex items-center justify-center"
                        >
                          <Plus />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setOpenMobile(false);
                setOpenSection(null);
              }}
              className="w-full h-12 rounded-full bg-main text-white font-semibold flex items-center justify-center gap-2"
            >
              <Search className="h-5 w-5" />
              Пошук
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
