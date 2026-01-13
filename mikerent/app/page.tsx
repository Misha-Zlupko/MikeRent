"use client";

import { SearchForm } from "@/components/search/SearchFormComponent";
import { ApartmentsGrid } from "@/components/apartments/ApartmentsGridComponent";
import { apartments } from "@/data/ApartmentsData";
import { CustomerComments } from "@/components/СustomerСommentsComponent";
import { useState } from "react";

type DateRange = {
  from: Date | null;
  to: Date | null;
};

export default function Home() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);

  const handleSearch = (params: {
    dateRange: DateRange;
    adults: number;
    childrenCount: number;
  }) => {
    setDateRange(params.dateRange);
    setAdults(params.adults);
    setChildrenCount(params.childrenCount);
  };

  return (
    <main>
      <section className="mt-8 mb-8 container">
        <SearchForm
          dateRange={dateRange}
          adults={adults}
          childrenCount={childrenCount}
          onSearch={handleSearch}
        />
      </section>
      <section className="container mb-8">
        <ApartmentsGrid
          apartments={apartments}
          dateRange={dateRange}
          guests={adults + childrenCount}
        />
      </section>
      <section className="inset-0 bg-gradient-to-br from-indigo-50 via-white to-pink-50">
        <CustomerComments />
      </section>
    </main>
  );
}
