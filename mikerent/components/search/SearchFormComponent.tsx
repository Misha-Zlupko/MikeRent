"use client";

import { useState } from "react";
import { DesktopSearch } from "./DesktopSearchComponent";
import { MobileSearch } from "./MobileSearchComponent";
import { DateRange } from "../SeasonCalendarComponent";

export type OpenSection = "when" | "who" | null;
type Props = {
  dateRange: DateRange;
  adults: number;
  childrenCount: number;
  onSearch: (data: {
    dateRange: DateRange;
    adults: number;
    childrenCount: number;
  }) => void;
};

export const SearchForm = ({
  dateRange,
  adults,
  childrenCount,
  onSearch,
}: Props) => {
  const [openMobile, setOpenMobile] = useState(false);
  const [desktopSection, setDesktopSection] = useState<"when" | "who" | null>(
    null
  );

  const [mobileSection, setMobileSection] = useState<"when" | "who" | null>(
    null
  );

  return (
    <div className="flex justify-center">
      <DesktopSearch
        dateRange={dateRange}
        adults={adults}
        childrenCount={childrenCount}
        openSection={desktopSection}
        setOpenSection={setDesktopSection}
        onSearch={onSearch}
      />
      <MobileSearch
        openMobile={openMobile}
        setOpenMobile={setOpenMobile}
        openSection={mobileSection}
        setOpenSection={setMobileSection}
        dateRange={dateRange}
        adults={adults}
        childrenCount={childrenCount}
        onSearch={onSearch}
      />
    </div>
  );
};
