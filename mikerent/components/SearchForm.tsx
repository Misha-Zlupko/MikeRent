"use client";

import { useState } from "react";
import { DesktopSearch } from "./search/DesktopSearch";
import { MobileSearch } from "./search/MobileSearch";
import { DateRange } from "./SeasonCalendar";

export type OpenSection = "when" | "who" | null;

export const SearchForm = () => {
  const [openMobile, setOpenMobile] = useState(false);
  const [openSection, setOpenSection] = useState<OpenSection>(null);

  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });

  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);

  return (
    <>
      <DesktopSearch
        dateRange={dateRange}
        setDateRange={setDateRange}
        adults={adults}
        setAdults={setAdults}
        childrenCount={childrenCount}
        setChildrenCount={setChildrenCount}
        openSection={openSection}
        setOpenSection={setOpenSection}
      />

      <MobileSearch
        openMobile={openMobile}
        setOpenMobile={setOpenMobile}
        openSection={openSection}
        setOpenSection={setOpenSection}
        dateRange={dateRange}
        setDateRange={setDateRange}
        adults={adults}
        setAdults={setAdults}
        childrenCount={childrenCount}
        setChildrenCount={setChildrenCount}
      />
    </>
  );
};
