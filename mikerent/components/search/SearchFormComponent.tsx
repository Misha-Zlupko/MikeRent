"use client";

import { useState } from "react";
import { DesktopSearch } from "./DesktopSearchComponent";
import { MobileSearch } from "./MobileSearchComponent";
import { DateRange } from "../SeasonCalendarComponent";

export type OpenSection = "when" | "who" | null;

export const SearchForm = () => {
  const [openMobile, setOpenMobile] = useState(false);
  const [desktopSection, setDesktopSection] = useState<"when" | "who" | null>(
    null
  );

  const [mobileSection, setMobileSection] = useState<"when" | "who" | null>(
    null
  );

  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
  });

  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);

  return (
    <div className="flex justify-center">
      <DesktopSearch
        dateRange={dateRange}
        setDateRange={setDateRange}
        adults={adults}
        setAdults={setAdults}
        childrenCount={childrenCount}
        setChildrenCount={setChildrenCount}
        openSection={desktopSection}
        setOpenSection={setDesktopSection}
      />

      <MobileSearch
        openMobile={openMobile}
        setOpenMobile={setOpenMobile}
        openSection={mobileSection}
        setOpenSection={setMobileSection}
        dateRange={dateRange}
        setDateRange={setDateRange}
        adults={adults}
        setAdults={setAdults}
        childrenCount={childrenCount}
        setChildrenCount={setChildrenCount}
      />
    </div>
  );
};
