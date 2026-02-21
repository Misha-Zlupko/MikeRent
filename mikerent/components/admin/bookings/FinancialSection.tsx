"use client";

import { DollarSign } from "lucide-react";
import PriceInputs from "./financial/PriceInputs";
import PriceSummary from "./financial/PriceSummary";
import PrepaymentSection from "./financial/PrepaymentSection";
import TotalSummary from "./financial/TotalSummary";
import { useEffect } from "react";

type Props = {
  selectedApartment: any;
  nights: number;
  ownerPricePerNight: number;
  markupPerNight: number;
  paidAmount: number;
  prepaidTo: "me" | "owner";
  onOwnerPriceChange: (value: number) => void;
  onMarkupChange: (value: number) => void;
  onPaidAmountChange: (value: number) => void;
  onPrepaidToChange: (value: "me" | "owner") => void;
  ownerTotalPrice: number;
  clientTotal: number;
  ourProfit: number;
  remainingToPay: number;
};

export default function FinancialSection({
  selectedApartment,
  nights,
  ownerPricePerNight,
  markupPerNight,
  paidAmount,
  prepaidTo,
  onOwnerPriceChange,
  onMarkupChange,
  onPaidAmountChange,
  onPrepaidToChange,
  ownerTotalPrice,
  clientTotal,
  ourProfit,
  remainingToPay,
}: Props) {
  // ✅ Правильно: зміна стану тільки в useEffect
  useEffect(() => {
    if (selectedApartment && nights > 0 && ownerPricePerNight === 0) {
      const basePrice = selectedApartment.pricePerNight * 42; // конвертуємо долари в гривні
      onOwnerPriceChange(basePrice);
      onMarkupChange(Math.round(basePrice * 0.2));
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
        paidAmount={paidAmount}
        onPaidAmountChange={onPaidAmountChange}
        remainingToPay={remainingToPay}
        prepaidTo={prepaidTo}
        onPrepaidToChange={onPrepaidToChange}
        nights={nights}
        ownerPricePerNight={ownerPricePerNight}
        markupPerNight={markupPerNight}
      />

      <TotalSummary
        clientTotal={clientTotal}
        paidAmount={paidAmount}
        ownerTotalPrice={ownerTotalPrice}
        ourProfit={ourProfit}
        remainingToPay={remainingToPay}
        prepaidTo={prepaidTo}
      />
    </div>
  );
}
