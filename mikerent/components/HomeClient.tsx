"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { SearchForm } from "@/components/search/SearchFormComponent";
import { ApartmentsGrid } from "@/components/apartments/ApartmentsGridComponent";
import type { Apartment } from "@/data/ApartmentsTypes";
import type { ApartmentType } from "@/data/ApartmentsTypes";
import type { DateRange as CalendarDateRange } from "@/components/SeasonCalendarComponent";
import { ButtonFilterApartments } from "@/components/buttons/ButtonFilterComponent";
import { LazyWhenVisible } from "@/components/ui/LazyWhenVisible";
import { readHomeSearchFromSession } from "@/lib/apartmentsListSession";

const CustomerComments = dynamic(
  () =>
    import("@/components/СustomerСommentsComponent").then(
      (m) => m.CustomerComments,
    ),
  { ssr: false },
);

type DateRange = {
  from: Date | null;
  to: Date | null;
};

type Props = {
  apartments: Apartment[];
};

export function HomeClient({ apartments }: Props) {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [typeFilter, setTypeFilter] = useState<ApartmentType | null>(null);

  // Після гідратації — відновити фільтри (не читати sessionStorage при першому рендері)
  useEffect(() => {
    const saved = readHomeSearchFromSession();
    if (!saved) return;

    setDateRange({
      from: saved.dateFrom ? new Date(saved.dateFrom) : null,
      to: saved.dateTo ? new Date(saved.dateTo) : null,
    });
    setAdults(saved.adults);
    setChildrenCount(saved.childrenCount);
    setTypeFilter(saved.typeFilter);
  }, []);

  const handleSearch = (params: {
    dateRange: CalendarDateRange;
    adults: number;
    childrenCount: number;
  }) => {
    setDateRange({
      from: params.dateRange.from,
      to: params.dateRange.to,
    });
    setAdults(params.adults);
    setChildrenCount(params.childrenCount);
  };

  return (
    <main>
      <section className="relative mb-12 overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50/30 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4 py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-1">
              <span className="text-xs font-medium uppercase tracking-wider text-blue-700">
                Подобова оренда
              </span>
            </div>
            <h1 className="mb-4 text-3xl font-bold text-gray-800 sm:text-4xl md:text-5xl">
              Житло в <span className="text-blue-600">Чорноморську</span>
            </h1>
            <p className="mb-8 text-gray-500">
              Зручний пошук квартир та будинків для вашого відпочинку біля моря
            </p>
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <SearchForm
                dateRange={dateRange as CalendarDateRange}
                adults={adults}
                childrenCount={childrenCount}
                onSearch={handleSearch}
              />
              <div className="mt-4">
                <ButtonFilterApartments
                  value={typeFilter}
                  onChange={setTypeFilter}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mb-8">
        <ApartmentsGrid
          apartments={apartments}
          dateRange={dateRange as CalendarDateRange}
          guests={adults + childrenCount}
          typeFilter={typeFilter}
          searchSnapshot={{
            typeFilter,
            adults,
            childrenCount,
            dateFrom: dateRange.from?.toISOString() ?? null,
            dateTo: dateRange.to?.toISOString() ?? null,
          }}
        />
      </section>

      <section className="inset-0 bg-gradient-to-br from-indigo-50 via-white to-pink-50">
        <LazyWhenVisible minHeight={320} rootMargin="400px 0px">
          <CustomerComments />
        </LazyWhenVisible>
      </section>
    </main>
  );
}
