"use client";

import { DollarSign } from "lucide-react";
import PriceInputs from "./financial/PriceInputs";
import PriceSummary from "./financial/PriceSummary";
import PrepaymentSection from "./financial/PrepaymentSection";
import TotalSummary from "./financial/TotalSummary";
import { useEffect } from "react";
import { BOOKING_AMOUNT_UAH_FACTOR } from "@/lib/bookingAmounts";

function roundMoney2(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

type Props = {
  selectedApartment: any;
  nights: number;
  ownerPricePerNight: number;
  markupPerNight: number;
  prepaidToMe: number;
  prepaidToOwner: number;
  onOwnerPriceChange: (value: number) => void;
  onMarkupChange: (value: number) => void;
  onPrepaidToMeChange: (value: number) => void;
  onPrepaidToOwnerChange: (value: number) => void;
  ownerTotalPrice: number;
  clientTotal: number;
  ourProfit: number;
};

export default function FinancialSection({
  selectedApartment,
  nights,
  ownerPricePerNight,
  markupPerNight,
  prepaidToMe,
  prepaidToOwner,
  onOwnerPriceChange,
  onMarkupChange,
  onPrepaidToMeChange,
  onPrepaidToOwnerChange,
  ownerTotalPrice,
  clientTotal,
  ourProfit,
}: Props) {
  // ✅ Правильно: зміна стану тільки в useEffect
  useEffect(() => {
    if (selectedApartment && nights > 0 && ownerPricePerNight === 0) {
      const basePrice = roundMoney2(
        selectedApartment.pricePerNight * BOOKING_AMOUNT_UAH_FACTOR,
      );
      onOwnerPriceChange(basePrice);
      onMarkupChange(roundMoney2(basePrice * 0.2));
    }
  }, [
    selectedApartment,
    nights,
    ownerPricePerNight,
    onOwnerPriceChange,
    onMarkupChange,
  ]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <DollarSign size={20} className="text-blue-600" />
        Фінанси (грн)
      </h2>

      <PriceInputs
        ownerPricePerNight={ownerPricePerNight}
        markupPerNight={markupPerNight}
        onOwnerPriceChange={onOwnerPriceChange}
        onMarkupChange={onMarkupChange}
      />

      <PriceSummary
        nights={nights}
        ownerTotalPrice={ownerTotalPrice}
        markupTotal={markupPerNight * nights}
        clientTotal={clientTotal}
      />

      <PrepaymentSection
        prepaidToMe={prepaidToMe}
        prepaidToOwner={prepaidToOwner}
        onPrepaidToMeChange={onPrepaidToMeChange}
        onPrepaidToOwnerChange={onPrepaidToOwnerChange}
        clientTotal={clientTotal}
        ownerTotalPrice={ownerTotalPrice}
        ourProfit={ourProfit}
      />

      <TotalSummary
        clientTotal={clientTotal}
        ownerTotalPrice={ownerTotalPrice}
        ourProfit={ourProfit}
        prepaidToMe={prepaidToMe}
        prepaidToOwner={prepaidToOwner}
      />
    </div>
  );
}
