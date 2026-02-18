"use client";

import { useState } from "react";
import { SearchForm } from "@/components/search/SearchFormComponent";
import { ApartmentsGrid } from "@/components/apartments/ApartmentsGridComponent";
import { CustomerComments } from "@/components/СustomerСommentsComponent";
import type { Apartment } from "@/data/ApartmentsTypes";
import type { DateRange as CalendarDateRange } from "@/components/SeasonCalendarComponent";

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
      <section className="mt-8 mb-8 container">
        <SearchForm
          dateRange={dateRange as CalendarDateRange}
          adults={adults}
          childrenCount={childrenCount}
          onSearch={handleSearch}
        />
      </section>
      <section className="container mb-8">
        <ApartmentsGrid
          apartments={apartments}
          dateRange={dateRange as CalendarDateRange}
          guests={adults + childrenCount}
        />
      </section>
      <section className="inset-0 bg-gradient-to-br from-indigo-50 via-white to-pink-50">
        <CustomerComments />
      </section>
    </main>
  );
}

