"use client";

import { useState } from "react";
import ApartmentSelector from "./ApartmentSelector";
import DateSelector from "./DateSelector";
import GuestInfo from "./GuestInfo";
import FinancialSection from "./FinancialSection";
import FormActions from "./FormActions";

type BookingFormProps = {
  onSubmit: (data: any) => void;
  loading: boolean;
};

export default function BookingForm({ onSubmit, loading }: BookingFormProps) {
  const [selectedApartment, setSelectedApartment] = useState<any>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [guestContact, setGuestContact] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");

  // Стан для передоплати
  const [prepaidTo, setPrepaidTo] = useState<"me" | "owner">("me");

  // Фінансові показники в гривнях
  const [ownerPricePerNight, setOwnerPricePerNight] = useState(0); // грн/ніч
  const [markupPerNight, setMarkupPerNight] = useState(0); // грн/ніч (мій прибуток)
  const [paidAmount, setPaidAmount] = useState(0); // грн (передоплата)

  // Розрахунок ночей
  const nights =
    dateFrom && dateTo
      ? Math.ceil(
          Math.abs(new Date(dateTo).getTime() - new Date(dateFrom).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  // Фінансові розрахунки в гривнях
  const ownerTotalPrice = ownerPricePerNight * nights; // всього хазяїну (грн)
  const clientTotal = (ownerPricePerNight + markupPerNight) * nights; // всього з клієнта (грн)
  const ourProfit = markupPerNight * nights; // мій прибуток (грн)
  const remainingToPay = clientTotal - paidAmount; // залишок до сплати (грн)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      apartmentId: selectedApartment?.id,
      dateFrom,
      dateTo,
      guestName,
      guestPhone,
      guestCount,
      guestContact,
      // Конвертуємо назад в долари для старої таблиці
      totalAmount: clientTotal / 42,
      ownerPayout: ownerTotalPrice / 42,
      ourProfit: ourProfit / 42,
      // Або використовуй нові поля
      totalAmountUAH: clientTotal,
      ownerPayoutUAH: ownerTotalPrice,
      ourProfitUAH: ourProfit,
      prepaidUAH: paidAmount,
      prepaidTo,
      ownerPhone,
      status: "CONFIRMED",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ApartmentSelector
        selectedApartment={selectedApartment}
        onSelect={setSelectedApartment}
      />

      <DateSelector
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        nights={nights}
      />

      <GuestInfo
        guestName={guestName}
        guestPhone={guestPhone}
        guestCount={guestCount}
        guestContact={guestContact}
        onGuestNameChange={setGuestName}
        onGuestPhoneChange={setGuestPhone}
        onGuestCountChange={setGuestCount}
        onGuestContactChange={setGuestContact}
      />

      <FinancialSection
        selectedApartment={selectedApartment}
        nights={nights}
        ownerPricePerNight={ownerPricePerNight}
        markupPerNight={markupPerNight}
        paidAmount={paidAmount}
        prepaidTo={prepaidTo}
        onOwnerPriceChange={setOwnerPricePerNight}
        onMarkupChange={setMarkupPerNight}
        onPaidAmountChange={setPaidAmount}
        onPrepaidToChange={setPrepaidTo}
        ownerTotalPrice={ownerTotalPrice}
        clientTotal={clientTotal}
        ourProfit={ourProfit}
        remainingToPay={remainingToPay}
      />

      <FormActions loading={loading} />
    </form>
  );
}
