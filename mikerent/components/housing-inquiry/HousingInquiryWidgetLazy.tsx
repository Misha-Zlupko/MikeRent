"use client";

import dynamic from "next/dynamic";

const HousingInquiryWidget = dynamic(
  () =>
    import("@/components/housing-inquiry/HousingInquiryWidget").then(
      (m) => m.HousingInquiryWidget,
    ),
  { ssr: false },
);

export function HousingInquiryWidgetLazy() {
  return <HousingInquiryWidget />;
}
